<?php
// backend/api/resources.php
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// GET requests
if ($method === 'GET') {
    // Public overview stats for catalog header (Available items, active reservations)
    if ($action === 'overview_stats') {
        $resCount = $pdo->query("SELECT COUNT(*) FROM resources WHERE status = 'available'")->fetchColumn();
        $bookingCount = $pdo->query("SELECT COUNT(*) FROM reservations WHERE status = 'approved'")->fetchColumn();
        $pendingCount = $pdo->query("SELECT COUNT(*) FROM reservations WHERE status = 'pending'")->fetchColumn();
        sendResponse([
            'total_resources' => intval($resCount),
            'active_bookings' => intval($bookingCount),
            'pending_requests' => intval($pendingCount)
        ]);
    }

    // 1. Alternative Suggestions Endpoint (Standout Feature #1)
    if ($action === 'alternatives') {
        $resId = intval($_GET['resource_id'] ?? 0);
        $startDate = $_GET['start_date'] ?? date('Y-m-d');
        $endDate = $_GET['end_date'] ?? date('Y-m-d', strtotime('+2 days'));

        if (!$resId) {
            sendError('resource_id parameter is required');
        }

        // Fetch resource category
        $stmt = $pdo->prepare("SELECT category_id, title FROM resources WHERE resource_id = ?");
        $stmt->execute([$resId]);
        $target = $stmt->fetch();

        if (!$target) {
            sendError('Resource not found', 404);
        }

        $alternatives = findAlternativeSuggestions($pdo, $target['category_id'], $startDate, $endDate, $resId);
        sendResponse([
            'requested_resource_id' => $resId,
            'requested_title' => $target['title'],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'alternatives' => $alternatives
        ]);
    }

    // 2. Single Resource Detail
    if ($id) {
        $stmt = $pdo->prepare("SELECT r.*, c.name as category_name, c.icon as category_icon, 
                                      u.name as owner_name, u.email as owner_email, u.department as owner_department, u.avatar as owner_avatar
                               FROM resources r
                               JOIN categories c ON r.category_id = c.category_id
                               JOIN users u ON r.owner_id = u.user_id
                               WHERE r.resource_id = ?");
        $stmt->execute([$id]);
        $resource = $stmt->fetch();

        if (!$resource) {
            sendError('Resource not found', 404);
        }

        // Fetch approved & pending reservations for availability calendar
        $resStmt = $pdo->prepare("SELECT reservation_id, start_date, end_date, status, purpose, u.name as user_name
                                  FROM reservations r
                                  JOIN users u ON r.user_id = u.user_id
                                  WHERE r.resource_id = ? AND r.status IN ('approved', 'pending')
                                  ORDER BY r.start_date ASC");
        $resStmt->execute([$id]);
        $bookings = $resStmt->fetchAll();

        sendResponse([
            'resource' => $resource,
            'existing_bookings' => $bookings
        ]);
    }

    // 3. List Resources with Dynamic Search and Filters (Module 2)
    $q = trim($_GET['q'] ?? '');
    $categoryId = !empty($_GET['category_id']) ? intval($_GET['category_id']) : null;
    $location = trim($_GET['location'] ?? '');
    $condition = trim($_GET['condition'] ?? '');
    $ownerId = !empty($_GET['owner_id']) ? intval($_GET['owner_id']) : null;
    $sort = $_GET['sort'] ?? 'newest';

    $sql = "SELECT r.*, c.name as category_name, c.icon as category_icon, 
                   u.name as owner_name, u.email as owner_email, u.avatar as owner_avatar
            FROM resources r
            JOIN categories c ON r.category_id = c.category_id
            JOIN users u ON r.owner_id = u.user_id
            WHERE 1=1";
    $params = [];

    if (!empty($q)) {
        $sql .= " AND (r.title LIKE ? OR r.description LIKE ? OR r.location LIKE ?)";
        $wildcard = "%{$q}%";
        $params[] = $wildcard;
        $params[] = $wildcard;
        $params[] = $wildcard;
    }

    if ($categoryId) {
        $sql .= " AND r.category_id = ?";
        $params[] = $categoryId;
    }

    if (!empty($location) && $location !== 'All Locations') {
        $sql .= " AND r.location LIKE ?";
        $params[] = "%{$location}%";
    }

    if (!empty($condition) && $condition !== 'All Conditions') {
        $sql .= " AND r.condition_status = ?";
        $params[] = $condition;
    }

    if ($ownerId) {
        $sql .= " AND r.owner_id = ?";
        $params[] = $ownerId;
    }

    // Sorting
    switch ($sort) {
        case 'rating_desc':
            $sql .= " ORDER BY r.rating DESC, r.reviews_count DESC";
            break;
        case 'title_asc':
            $sql .= " ORDER BY r.title ASC";
            break;
        case 'oldest':
            $sql .= " ORDER BY r.resource_id ASC";
            break;
        case 'newest':
        default:
            $sql .= " ORDER BY r.resource_id DESC";
            break;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resources = $stmt->fetchAll();

    // Get distinct locations for filter dropdown
    $locStmt = $pdo->query("SELECT DISTINCT location FROM resources WHERE location IS NOT NULL AND location != '' ORDER BY location ASC");
    $locations = $locStmt->fetchAll(PDO::FETCH_COLUMN);

    sendResponse([
        'resources' => $resources,
        'count' => count($resources),
        'locations' => $locations
    ]);
}

// POST - Add Resource
if ($method === 'POST') {
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Unauthorized: Please login to list a resource', 401);
    }

    $data = getJsonBody();
    $title = trim($data['title'] ?? '');
    $categoryId = intval($data['category_id'] ?? 0);
    $description = trim($data['description'] ?? '');
    $specifications = trim($data['specifications'] ?? '');
    $condition = trim($data['condition_status'] ?? 'Good');
    $location = trim($data['location'] ?? 'Campus Library');
    $imageUrl = trim($data['image_url'] ?? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80');

    if (empty($title) || !$categoryId || empty($description)) {
        sendError('Title, category, and description are required.');
    }

    $stmt = $pdo->prepare("INSERT INTO resources (owner_id, category_id, title, description, specifications, condition_status, location, image_url, rating, reviews_count, status)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1, 'available')");
    $stmt->execute([$user['user_id'], $categoryId, $title, $description, $specifications, $condition, $location, $imageUrl]);
    $newId = $pdo->lastInsertId();

    sendResponse(['message' => 'Resource created successfully', 'resource_id' => $newId], 201);
}

// PUT - Update Resource
if ($method === 'PUT') {
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Unauthorized', 401);
    }

    if (!$id) {
        sendError('Missing resource ID', 400);
    }

    // Check ownership
    $check = $pdo->prepare("SELECT owner_id FROM resources WHERE resource_id = ?");
    $check->execute([$id]);
    $existing = $check->fetch();
    if (!$existing) {
        sendError('Resource not found', 404);
    }

    if ($existing['owner_id'] != $user['user_id']) {
        sendError('Forbidden: You can only edit your own resources', 403);
    }

    $data = getJsonBody();
    $title = trim($data['title'] ?? '');
    $categoryId = intval($data['category_id'] ?? 0);
    $description = trim($data['description'] ?? '');
    $specifications = trim($data['specifications'] ?? '');
    $condition = trim($data['condition_status'] ?? 'Good');
    $location = trim($data['location'] ?? '');
    $imageUrl = trim($data['image_url'] ?? '');
    $status = trim($data['status'] ?? 'available');

    $stmt = $pdo->prepare("UPDATE resources SET title = ?, category_id = ?, description = ?, specifications = ?, condition_status = ?, location = ?, image_url = ?, status = ? WHERE resource_id = ?");
    $stmt->execute([$title, $categoryId, $description, $specifications, $condition, $location, $imageUrl, $status, $id]);

    sendResponse(['message' => 'Resource updated successfully']);
}

// DELETE - Remove Resource
if ($method === 'DELETE') {
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Unauthorized', 401);
    }

    if (!$id) {
        sendError('Missing resource ID', 400);
    }

    $check = $pdo->prepare("SELECT owner_id FROM resources WHERE resource_id = ?");
    $check->execute([$id]);
    $existing = $check->fetch();
    if (!$existing) {
        sendError('Resource not found', 404);
    }

    if ($existing['owner_id'] != $user['user_id']) {
        sendError('Forbidden: You cannot delete this resource', 403);
    }

    $stmt = $pdo->prepare("DELETE FROM resources WHERE resource_id = ?");
    $stmt->execute([$id]);

    sendResponse(['message' => 'Resource deleted successfully']);
}

sendError('Invalid method', 405);
