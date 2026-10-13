<?php
// backend/api/notifications.php
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$user = getCurrentUser($pdo);
if (!$user) {
    sendError('Unauthorized', 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY notification_id DESC LIMIT 50");
    $stmt->execute([$user['user_id']]);
    $notifications = $stmt->fetchAll();

    $unreadStmt = $pdo->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0");
    $unreadStmt->execute([$user['user_id']]);
    $unreadCount = $unreadStmt->fetch()['unread_count'] ?? 0;

    sendResponse([
        'notifications' => $notifications,
        'unread_count' => intval($unreadCount)
    ]);
}

if ($method === 'PUT') {
    if ($action === 'mark_all_read') {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);
        sendResponse(['message' => 'All notifications marked as read']);
    }

    if ($action === 'mark_read') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?");
        $stmt->execute([$id, $user['user_id']]);
        sendResponse(['message' => 'Notification marked as read']);
    }
}

sendError('Invalid method or action', 405);
