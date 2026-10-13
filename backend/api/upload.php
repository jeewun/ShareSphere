<?php
// backend/api/upload.php - PHP File Handling (Unit-III Syllabus)
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$user = getCurrentUser($pdo);
if (!$user) {
    sendError('Unauthorized: Please login to upload files', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('POST method required', 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    sendError('No valid image file uploaded', 400);
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5 MB

if (!in_array($file['type'], $allowedTypes)) {
    sendError('Only JPG, PNG, WEBP, and GIF images are allowed', 400);
}

if ($file['size'] > $maxSize) {
    sendError('File size exceeds 5MB limit', 400);
}

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$safeFilename = 'img_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
$destination = $uploadDir . $safeFilename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
    $fileUrl = $baseUrl . '/uploads/' . $safeFilename;
    sendResponse([
        'message' => 'Image uploaded successfully',
        'url' => $fileUrl,
        'filename' => $safeFilename
    ]);
} else {
    sendError('Failed to move uploaded file to destination directory', 500);
}
