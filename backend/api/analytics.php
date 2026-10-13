<?php
// backend/api/analytics.php
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$user = getCurrentUser($pdo);

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    sendError('Invalid method', 405);
}

// Strictly enforce: Only admin can view analytics and audit reports
if (!$user || $user['role'] !== 'admin') {
    sendError('Access denied: Administrator privileges required to access analytics and reports.', 403);
}

// 1. KPI Counts (Module 5 Admin Dashboard)
$totalUsers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$totalResources = $pdo->query("SELECT COUNT(*) FROM resources")->fetchColumn();
$totalBookings = $pdo->query("SELECT COUNT(*) FROM reservations")->fetchColumn();
$pendingRequests = $pdo->query("SELECT COUNT(*) FROM reservations WHERE status = 'pending'")->fetchColumn();
$approvedBookings = $pdo->query("SELECT COUNT(*) FROM reservations WHERE status = 'approved'")->fetchColumn();

// 2. Resource Utilization by Category (For HTML5 Canvas Chart & Bar Chart)
// Utilization formula: (category bookings / total bookings) * 100 or booking rate
$categoryStatsSql = "
    SELECT 
        c.category_id,
        c.name as category_name,
        COUNT(DISTINCT r.resource_id) as resource_count,
        COUNT(res.reservation_id) as total_bookings,
        ROUND(
            CASE 
                WHEN COUNT(DISTINCT r.resource_id) > 0 
                THEN (COUNT(res.reservation_id) * 1.0 / (SELECT MAX(1, COUNT(*)) FROM reservations)) * 100 
                ELSE 0 
            END, 1
        ) as utilization_rate
    FROM categories c
    LEFT JOIN resources r ON c.category_id = r.category_id
    LEFT JOIN reservations res ON r.resource_id = res.resource_id
    GROUP BY c.category_id, c.name
    ORDER BY total_bookings DESC
";
$categoryStats = $pdo->query($categoryStatsSql)->fetchAll();

// 3. Top Requested Resources
$topResourcesSql = "
    SELECT 
        r.resource_id,
        r.title,
        r.image_url,
        r.rating,
        c.name as category_name,
        COUNT(res.reservation_id) as request_count
    FROM resources r
    JOIN categories c ON r.category_id = c.category_id
    LEFT JOIN reservations res ON r.resource_id = res.resource_id
    GROUP BY r.resource_id, r.title, r.image_url, r.rating, c.name
    ORDER BY request_count DESC, r.rating DESC
    LIMIT 5
";
$topResources = $pdo->query($topResourcesSql)->fetchAll();

// 4. Booking Status Distribution
$statusDistSql = "
    SELECT status, COUNT(*) as count 
    FROM reservations 
    GROUP BY status
";
$statusDist = $pdo->query($statusDistSql)->fetchAll();

// 5. Recent Reservations (Feed)
$recentSql = "
    SELECT 
        res.reservation_id,
        res.start_date,
        res.end_date,
        res.status,
        res.created_at,
        r.title as resource_title,
        r.image_url as resource_image,
        u.name as requester_name,
        u.email as requester_email
    FROM reservations res
    JOIN resources r ON res.resource_id = r.resource_id
    JOIN users u ON res.user_id = u.user_id
    ORDER BY res.reservation_id DESC
    LIMIT 8
";
$recentReservations = $pdo->query($recentSql)->fetchAll();

sendResponse([
    'stats' => [
        'total_users' => intval($totalUsers),
        'total_resources' => intval($totalResources),
        'total_bookings' => intval($totalBookings),
        'pending_requests' => intval($pendingRequests),
        'approved_bookings' => intval($approvedBookings)
    ],
    'category_utilization' => $categoryStats,
    'top_resources' => $topResources,
    'status_distribution' => $statusDist,
    'recent_reservations' => $recentReservations
]);
