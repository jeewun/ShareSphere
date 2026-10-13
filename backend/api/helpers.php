<?php
// backend/api/helpers.php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function sendResponse($data = [], $status = 200) {
    http_response_code($status);
    echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function sendError($message = 'An error occurred', $status = 400, $extra = []) {
    http_response_code($status);
    echo json_encode(array_merge(['success' => false, 'error' => $message], $extra), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function getCurrentUser($pdo) {
    // Check Authorization header: Bearer <user_id> or user_id in headers/query
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $userId = null;

    if (preg_match('/Bearer\s+(\d+)/i', $authHeader, $matches)) {
        $userId = intval($matches[1]);
    } elseif (!empty($_GET['auth_user_id'])) {
        $userId = intval($_GET['auth_user_id']);
    } elseif (!empty($_COOKIE['sharesphere_user_id'])) {
        $userId = intval($_COOKIE['sharesphere_user_id']);
    }

    if (!$userId) {
        return null;
    }

    $stmt = $pdo->prepare("SELECT user_id, name, email, role, department, phone, avatar FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    return $user ?: null;
}

/**
 * Intelligent Conflict Detection Logic:
 * Two date spans [S1, E1] and [S2, E2] overlap if:
 * S1 <= E2 AND E1 >= S2
 */
function checkBookingConflicts($pdo, $resourceId, $startDate, $endDate, $excludeReservationId = null) {
    $sql = "SELECT r.*, u.name as booked_by 
            FROM reservations r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.resource_id = ? 
            AND r.status IN ('approved', 'pending')
            AND r.start_date <= ? 
            AND r.end_date >= ?";
    $params = [$resourceId, $endDate, $startDate];

    if ($excludeReservationId) {
        $sql .= " AND r.reservation_id != ?";
        $params[] = $excludeReservationId;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Intelligent Alternative Suggestion Engine:
 * When a resource has conflicts for [startDate, endDate], find other active resources
 * in the same category that DO NOT have any conflicting reservations!
 */
function findAlternativeSuggestions($pdo, $categoryId, $startDate, $endDate, $excludeResourceId) {
    // 1. Get resources in same category (excluding current)
    $sql = "SELECT r.*, c.name as category_name, u.name as owner_name 
            FROM resources r
            JOIN categories c ON r.category_id = c.category_id
            JOIN users u ON r.owner_id = u.user_id
            WHERE r.category_id = ? 
            AND r.resource_id != ? 
            AND r.status = 'available'
            LIMIT 6";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$categoryId, $excludeResourceId]);
    $candidates = $stmt->fetchAll();

    $availableAlternatives = [];
    foreach ($candidates as $cand) {
        $conflicts = checkBookingConflicts($pdo, $cand['resource_id'], $startDate, $endDate);
        if (empty($conflicts)) {
            $availableAlternatives[] = $cand;
        }
    }

    return $availableAlternatives;
}
