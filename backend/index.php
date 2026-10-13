<?php
// backend/index.php - ShareSphere API Gateway & Health Status
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/api/helpers.php';

try {
    $pdo = Database::getConnection();
    $driver = Database::getDriver();
    $resCount = $pdo->query("SELECT COUNT(*) FROM resources")->fetchColumn();
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $dbStatus = "Connected successfully ({$driver})";
} catch (Exception $e) {
    $dbStatus = "Error: " . $e->getMessage();
    $resCount = 0;
    $userCount = 0;
}

sendResponse([
    'project' => 'ShareSphere: A Smart Resource-Sharing, Availability and Reservation Management System',
    'status' => 'operational',
    'php_version' => PHP_VERSION,
    'database' => [
        'status' => $dbStatus,
        'driver' => $driver ?? 'unknown',
        'total_resources' => intval($resCount),
        'total_users' => intval($userCount)
    ],
    'endpoints' => [
        'auth' => '/api/auth.php',
        'resources' => '/api/resources.php',
        'reservations' => '/api/reservations.php',
        'categories' => '/api/categories.php',
        'notifications' => '/api/notifications.php',
        'analytics' => '/api/analytics.php',
        'upload' => '/api/upload.php'
    ]
]);
