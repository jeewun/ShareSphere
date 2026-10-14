<?php
// backend/api/handover.php - Ephemeral Handover Coordination API
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$user = getCurrentUser($pdo);

if (!$user) {
    sendError('Unauthorized: Please login to access handover coordination', 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Helper to load and authorize reservation access
function getAuthorizedReservation($pdo, $resId, $userId, $userRole) {
    $stmt = $pdo->prepare("
        SELECT res.*, 
               r.title as resource_title, r.image_url as resource_image, r.location as resource_location,
               r.owner_id, owner.name as owner_name, owner.email as owner_email, owner.phone as owner_phone,
               u.name as requester_name, u.email as requester_email, u.phone as requester_phone
        FROM reservations res
        JOIN resources r ON res.resource_id = r.resource_id
        JOIN users owner ON r.owner_id = owner.user_id
        JOIN users u ON res.user_id = u.user_id
        WHERE res.reservation_id = ?
    ");
    $stmt->execute([$resId]);
    $res = $stmt->fetch();

    if (!$res) {
        sendError('Reservation not found', 404);
    }

    $isOwner = ($res['owner_id'] == $userId);
    $isRequester = ($res['user_id'] == $userId);

    if (!$isOwner && !$isRequester) {
        sendError('Forbidden: You are not a participant in this reservation', 403);
    }

    if ($res['status'] !== 'approved' && $res['status'] !== 'completed') {
        sendError('Handover coordination is only available for approved reservations', 400);
    }

    return [$res, $isOwner, $isRequester];
}

// 1. GET - Fetch Handover Space Details and Messages
if ($method === 'GET') {
    $resId = intval($_GET['reservation_id'] ?? 0);
    if (!$resId) {
        sendError('reservation_id parameter is required', 400);
    }

    list($res, $isOwner, $isRequester) = getAuthorizedReservation($pdo, $resId, $user['user_id'], $user['role']);

    // Fetch messages
    $msgStmt = $pdo->prepare("
        SELECT m.message_id, m.reservation_id, m.sender_id, m.message, m.created_at,
               u.name as sender_name, u.role as sender_role, u.avatar as sender_avatar
        FROM handover_messages m
        JOIN users u ON m.sender_id = u.user_id
        WHERE m.reservation_id = ?
        ORDER BY m.message_id ASC
    ");
    $msgStmt->execute([$resId]);
    $messages = $msgStmt->fetchAll();

    sendResponse([
        'reservation' => [
            'reservation_id' => intval($res['reservation_id']),
            'resource_id' => intval($res['resource_id']),
            'resource_title' => $res['resource_title'],
            'resource_image' => $res['resource_image'],
            'resource_location' => $res['resource_location'],
            'start_date' => $res['start_date'],
            'end_date' => $res['end_date'],
            'status' => $res['status'],
            'pickup_time' => $res['pickup_time'] ?? '',
            'chat_status' => $res['chat_status'] ?? 'active',
            'handover_status' => $res['handover_status'] ?? 'pending',
            'owner_id' => intval($res['owner_id']),
            'owner_name' => $res['owner_name'],
            'owner_phone' => $res['owner_phone'],
            'requester_id' => intval($res['user_id']),
            'requester_name' => $res['requester_name'],
            'requester_phone' => $res['requester_phone'],
            'is_owner' => $isOwner,
            'is_requester' => $isRequester
        ],
        'messages' => $messages
    ]);
}

// 2. POST - Handover Actions
if ($method === 'POST') {
    $data = getJsonBody();
    $resId = intval($data['reservation_id'] ?? 0);

    if (!$resId) {
        sendError('reservation_id is required', 400);
    }

    list($res, $isOwner, $isRequester) = getAuthorizedReservation($pdo, $resId, $user['user_id'], $user['role']);

    // A. Send Message
    if ($action === 'send_message' || empty($action)) {
        $message = trim($data['message'] ?? '');
        if (empty($message)) {
            sendError('Message cannot be empty', 400);
        }

        if (($res['chat_status'] ?? 'active') === 'closed') {
            sendError('This handover coordination space has been closed by the owner.', 400);
        }

        $stmt = $pdo->prepare("INSERT INTO handover_messages (reservation_id, sender_id, message) VALUES (?, ?, ?)");
        $stmt->execute([$resId, $user['user_id'], $message]);
        $newMsgId = $pdo->lastInsertId();

        // Send in-app notification to the counterpart
        $targetUserId = $isOwner ? $res['user_id'] : $res['owner_id'];
        $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
        $notifMsg = "{$user['name']}: " . (strlen($message) > 40 ? substr($message, 0, 37) . '...' : $message);
        $notifStmt->execute([$targetUserId, 'Handover Message: ' . $res['resource_title'], $notifMsg, 'info', '/bookings']);

        sendResponse([
            'message' => 'Message sent successfully',
            'new_message' => [
                'message_id' => intval($newMsgId),
                'reservation_id' => $resId,
                'sender_id' => $user['user_id'],
                'sender_name' => $user['name'],
                'sender_role' => $user['role'],
                'message' => $message,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ], 201);
    }

    // B. Propose or Update Exact Pickup Timing Window
    if ($action === 'update_pickup_time') {
        $pickupTime = trim($data['pickup_time'] ?? '');
        if (empty($pickupTime)) {
            sendError('Please provide a pickup time slot', 400);
        }

        $stmt = $pdo->prepare("UPDATE reservations SET pickup_time = ? WHERE reservation_id = ?");
        $stmt->execute([$pickupTime, $resId]);

        // Insert system broadcast message into chat
        $sysMsg = "Pickup Timing Agreed: {$pickupTime} (Set by {$user['name']})";
        $chatStmt = $pdo->prepare("INSERT INTO handover_messages (reservation_id, sender_id, message) VALUES (?, ?, ?)");
        $chatStmt->execute([$resId, $user['user_id'], $sysMsg]);

        // Notify counterpart
        $targetUserId = $isOwner ? $res['user_id'] : $res['owner_id'];
        $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
        $notifStmt->execute([$targetUserId, 'Pickup Time Agreed', "{$user['name']} set pickup time for {$res['resource_title']} to {$pickupTime}.", 'success', '/bookings']);

        sendResponse([
            'message' => 'Pickup timing updated successfully',
            'pickup_time' => $pickupTime
        ]);
    }

    // C. Owner Terminates / Closes Handover Space
    if ($action === 'close_space') {
        if (!$isOwner) {
            sendError('Forbidden: Only the resource owner can confirm handover and close this space', 403);
        }

        $stmt = $pdo->prepare("UPDATE reservations SET chat_status = 'closed', handover_status = 'collected' WHERE reservation_id = ?");
        $stmt->execute([$resId]);

        // Add termination notice message
        $sysMsg = "Handover Complete: Equipment collected. Coordination space terminated by {$user['name']}.";
        $chatStmt = $pdo->prepare("INSERT INTO handover_messages (reservation_id, sender_id, message) VALUES (?, ?, ?)");
        $chatStmt->execute([$resId, $user['user_id'], $sysMsg]);

        // Notify requester
        $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
        $notifStmt->execute([$res['user_id'], 'Handover Completed', "The owner of {$res['resource_title']} confirmed equipment pickup and closed the space.", 'success', '/bookings']);

        sendResponse([
            'message' => 'Handover space successfully closed and item marked collected',
            'chat_status' => 'closed',
            'handover_status' => 'collected'
        ]);
    }

    // D. Owner Reopen Space (Optional safety valve)
    if ($action === 'reopen_space') {
        if (!$isOwner) {
            sendError('Forbidden: Only the resource owner can reopen this space', 403);
        }

        $stmt = $pdo->prepare("UPDATE reservations SET chat_status = 'active' WHERE reservation_id = ?");
        $stmt->execute([$resId]);

        $sysMsg = "Coordination space reopened by {$user['name']}.";
        $chatStmt = $pdo->prepare("INSERT INTO handover_messages (reservation_id, sender_id, message) VALUES (?, ?, ?)");
        $chatStmt->execute([$resId, $user['user_id'], $sysMsg]);

        sendResponse(['message' => 'Coordination space reopened', 'chat_status' => 'active']);
    }

    sendError('Invalid action', 400);
}

sendError('Invalid method', 405);
