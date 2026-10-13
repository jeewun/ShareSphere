<?php
// backend/api/reservations.php
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// GET Endpoints
if ($method === 'GET') {
    // 1. Conflict Check Pre-Flight (Module 3 & Standout Feature)
    if ($action === 'check_conflict') {
        $resourceId = intval($_GET['resource_id'] ?? 0);
        $startDate = $_GET['start_date'] ?? '';
        $endDate = $_GET['end_date'] ?? '';

        if (!$resourceId || empty($startDate) || empty($endDate)) {
            sendError('resource_id, start_date, and end_date are required.');
        }

        if (strtotime($startDate) > strtotime($endDate)) {
            sendError('Start date cannot be after end date.');
        }

        // Get resource details
        $resStmt = $pdo->prepare("SELECT resource_id, category_id, title FROM resources WHERE resource_id = ?");
        $resStmt->execute([$resourceId]);
        $resource = $resStmt->fetch();
        if (!$resource) {
            sendError('Resource not found', 404);
        }

        $conflicts = checkBookingConflicts($pdo, $resourceId, $startDate, $endDate);
        $hasConflict = !empty($conflicts);

        $alternatives = [];
        if ($hasConflict) {
            $alternatives = findAlternativeSuggestions($pdo, $resource['category_id'], $startDate, $endDate, $resourceId);
        }

        sendResponse([
            'has_conflict' => $hasConflict,
            'message' => $hasConflict 
                ? "This resource is already booked for the selected dates." 
                : "This resource is available for your selected dates.",
            'conflicts' => $conflicts,
            'alternatives' => $alternatives
        ]);
    }

    // 2. Availability Calendar Slots (Image 3 Screen 6)
    if ($action === 'calendar') {
        $resourceId = intval($_GET['resource_id'] ?? 0);
        if (!$resourceId) {
            sendError('resource_id is required');
        }

        $stmt = $pdo->prepare("SELECT r.reservation_id, r.start_date, r.end_date, r.status, u.name as user_name
                               FROM reservations r
                               JOIN users u ON r.user_id = u.user_id
                               WHERE r.resource_id = ? AND r.status IN ('approved', 'pending')
                               ORDER BY r.start_date ASC");
        $stmt->execute([$resourceId]);
        $bookings = $stmt->fetchAll();

        sendResponse(['bookings' => $bookings]);
    }

    // 3. User Bookings & Owner Management
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Unauthorized', 401);
    }

    $type = $_GET['type'] ?? 'my_bookings'; // 'my_bookings', 'owner_requests', or 'all' (admin)
    $statusFilter = $_GET['status'] ?? 'all';

    $params = [];
    if ($type === 'owner_requests') {
        $sql = "SELECT res.*, r.title as resource_title, r.image_url as resource_image, c.name as category_name, 
                       u.name as requester_name, u.email as requester_email, u.department as requester_department
                FROM reservations res
                JOIN resources r ON res.resource_id = r.resource_id
                JOIN categories c ON r.category_id = c.category_id
                JOIN users u ON res.user_id = u.user_id
                WHERE r.owner_id = ?";
        $params[] = $user['user_id'];
    } elseif ($type === 'all' && $user['role'] === 'admin') {
        $sql = "SELECT res.*, r.title as resource_title, r.image_url as resource_image, c.name as category_name, 
                       u.name as requester_name, u.email as requester_email,
                       owner.name as owner_name
                FROM reservations res
                JOIN resources r ON res.resource_id = r.resource_id
                JOIN categories c ON r.category_id = c.category_id
                JOIN users u ON res.user_id = u.user_id
                JOIN users owner ON r.owner_id = owner.user_id
                WHERE 1=1";
    } else {
        // My Bookings
        $sql = "SELECT res.*, r.title as resource_title, r.image_url as resource_image, r.location, c.name as category_name, 
                       owner.name as owner_name, owner.email as owner_email
                FROM reservations res
                JOIN resources r ON res.resource_id = r.resource_id
                JOIN categories c ON r.category_id = c.category_id
                JOIN users owner ON r.owner_id = owner.user_id
                WHERE res.user_id = ?";
        $params[] = $user['user_id'];
    }

    if ($statusFilter !== 'all') {
        $sql .= " AND res.status = ?";
        $params[] = $statusFilter;
    }

    $sql .= " ORDER BY res.reservation_id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    sendResponse(['reservations' => $bookings]);
}

// POST - Create Reservation (With strict database transaction and conflict prevention)
if ($method === 'POST') {
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Unauthorized: Please login to book a resource', 401);
    }

    $data = getJsonBody();
    $resourceId = intval($data['resource_id'] ?? 0);
    $startDate = trim($data['start_date'] ?? '');
    $endDate = trim($data['end_date'] ?? '');
    $purpose = trim($data['purpose'] ?? 'Academic project');

    if (!$resourceId || empty($startDate) || empty($endDate)) {
        sendError('Resource, start date, and end date are required.');
    }

    if (strtotime($startDate) > strtotime($endDate)) {
        sendError('Start date cannot be after end date.');
    }

    if (strtotime($startDate) < strtotime(date('Y-m-d'))) {
        sendError('Reservation start date cannot be in the past.');
    }

    // Fetch resource
    $resStmt = $pdo->prepare("SELECT r.*, u.name as owner_name, u.user_id as owner_id FROM resources r JOIN users u ON r.owner_id = u.user_id WHERE r.resource_id = ?");
    $resStmt->execute([$resourceId]);
    $resource = $resStmt->fetch();
    if (!$resource) {
        sendError('Resource not found', 404);
    }

    // STRICT SERVER-SIDE CONFLICT PREVENTION (Module 3 & Requirement 4)
    // Check for approved or pending bookings overlapping with [startDate, endDate]
    $conflicts = checkBookingConflicts($pdo, $resourceId, $startDate, $endDate);
    if (!empty($conflicts)) {
        $alternatives = findAlternativeSuggestions($pdo, $resource['category_id'], $startDate, $endDate, $resourceId);
        sendError("Conflict detected: This resource is already booked from {$conflicts[0]['start_date']} to {$conflicts[0]['end_date']}.", 409, [
            'conflict' => true,
            'conflicting_booking' => $conflicts[0],
            'alternatives' => $alternatives
        ]);
    }

    // Begin database transaction for safe concurrent booking
    $pdo->beginTransaction();
    try {
        $insert = $pdo->prepare("INSERT INTO reservations (resource_id, user_id, start_date, end_date, purpose, status, decision_notes)
                                 VALUES (?, ?, ?, ?, ?, 'pending', 'Submitted request awaiting owner approval')");
        $insert->execute([$resourceId, $user['user_id'], $startDate, $endDate, $purpose]);
        $resvId = $pdo->lastInsertId();

        // Send notification to resource owner
        $notifOwner = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
        $ownerMsg = "User {$user['name']} requested '{$resource['title']}' from {$startDate} to {$endDate}.";
        $notifOwner->execute([$resource['owner_id'], 'New Reservation Request', $ownerMsg, 'info', '/bookings']);

        // Send confirmation notification to requester
        $notifUser = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
        $userMsg = "Your booking request for '{$resource['title']}' ({$startDate} to {$endDate}) has been submitted.";
        $notifUser->execute([$user['user_id'], 'Reservation Submitted', $userMsg, 'info', '/bookings']);

        $pdo->commit();

        sendResponse([
            'message' => 'Reservation request submitted successfully!',
            'reservation_id' => $resvId,
            'status' => 'pending'
        ], 201);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendError('Failed to create reservation: ' . $e->getMessage(), 500);
    }
}

// PUT - Update Reservation Status (Approve / Reject / Cancel)
if ($method === 'PUT') {
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Unauthorized', 401);
    }

    if (!$id) {
        sendError('Reservation ID is required', 400);
    }

    $data = getJsonBody();
    $newStatus = trim($data['status'] ?? '');
    $notes = trim($data['decision_notes'] ?? '');

    $allowedStatuses = ['approved', 'rejected', 'cancelled', 'completed'];
    if (!in_array($newStatus, $allowedStatuses)) {
        sendError('Invalid status update', 400);
    }

    // Fetch existing reservation
    $stmt = $pdo->prepare("SELECT res.*, r.title as resource_title, r.owner_id, u.name as requester_name
                           FROM reservations res
                           JOIN resources r ON res.resource_id = r.resource_id
                           JOIN users u ON res.user_id = u.user_id
                           WHERE res.reservation_id = ?");
    $stmt->execute([$id]);
    $reservation = $stmt->fetch();
    if (!$reservation) {
        sendError('Reservation not found', 404);
    }

    // Permission checks
    $isOwner = ($reservation['owner_id'] == $user['user_id']);
    $isRequester = ($reservation['user_id'] == $user['user_id']);
    $isAdmin = ($user['role'] === 'admin');

    if ($newStatus === 'cancelled') {
        if (!$isRequester && !$isAdmin && !$isOwner) {
            sendError('Forbidden: You can only cancel your own bookings', 403);
        }
    } else {
        if (!$isOwner && !$isAdmin) {
            sendError('Forbidden: Only resource owner or admin can change this status', 403);
        }
    }

    // If approving, re-check conflict against other already approved reservations!
    if ($newStatus === 'approved') {
        $conflicts = checkBookingConflicts($pdo, $reservation['resource_id'], $reservation['start_date'], $reservation['end_date'], $id);
        $approvedConflicts = array_filter($conflicts, fn($c) => $c['status'] === 'approved');
        if (!empty($approvedConflicts)) {
            sendError('Cannot approve: another approved reservation overlaps with these dates.', 409);
        }
    }

    $update = $pdo->prepare("UPDATE reservations SET status = ?, decision_notes = ? WHERE reservation_id = ?");
    $update->execute([$newStatus, $notes ?: "Updated to {$newStatus}", $id]);

    // Send notification to user
    $notifType = ($newStatus === 'approved') ? 'success' : (($newStatus === 'rejected') ? 'danger' : 'info');
    $notifTitle = "Reservation " . ucfirst($newStatus);
    $notifMsg = "Your booking for {$reservation['resource_title']} has been {$newStatus}. " . ($notes ? "Notes: {$notes}" : '');

    $notif = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
    $notif->execute([$reservation['user_id'], $notifTitle, $notifMsg, $notifType, '/bookings']);

    sendResponse(['message' => "Reservation status changed to {$newStatus}", 'status' => $newStatus]);
}

sendError('Invalid method', 405);
