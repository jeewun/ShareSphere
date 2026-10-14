<?php
// backend/api/categories.php
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT c.*, COUNT(r.resource_id) as resource_count 
                         FROM categories c
                         LEFT JOIN resources r ON c.category_id = r.category_id
                         GROUP BY c.category_id
                         ORDER BY c.name ASC");
    $categories = $stmt->fetchAll();
    sendResponse(['categories' => $categories]);
}

if ($method === 'POST') {
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Unauthorized', 401);
    }

    $data = getJsonBody();
    $name = trim($data['name'] ?? '');
    $icon = trim($data['icon'] ?? 'Layers');
    $description = trim($data['description'] ?? '');

    if (empty($name)) {
        sendError('Category name is required');
    }

    $stmt = $pdo->prepare("INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)");
    $stmt->execute([$name, $icon, $description]);
    $catId = $pdo->lastInsertId();

    sendResponse(['message' => 'Category created', 'category_id' => $catId], 201);
}

sendError('Invalid method', 405);
