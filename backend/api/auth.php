<?php
// backend/api/auth.php
require_once __DIR__ . '/helpers.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $data = getJsonBody();

    if ($action === 'login') {
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            sendError('Please provide both email and password.');
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            sendError('Invalid email or password.', 401);
        }

        // Return user info (strip sensitive password_hash)
        unset($user['password_hash']);
        sendResponse([
            'message' => 'Login successful',
            'token' => 'Bearer ' . $user['user_id'],
            'user' => $user
        ]);
    }

    if ($action === 'register') {
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');
        $confirmPassword = trim($data['confirm_password'] ?? '');
        $role = trim($data['role'] ?? 'student');
        $department = trim($data['department'] ?? 'Information Technology');

        // Validation (Unit-III Server-side validation)
        if (empty($name) || empty($email) || empty($password)) {
            sendError('Name, email, and password are required.');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendError('Please enter a valid email address.');
        }

        if (strlen($password) < 6) {
            sendError('Password must be at least 6 characters.');
        }

        if (!empty($confirmPassword) && $password !== $confirmPassword) {
            sendError('Passwords do not match.');
        }

        $role = 'student';

        // Check if email already registered
        $check = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            sendError('This email is already registered. Please login.', 409);
        }

        // Secure password hashing
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        // Default avatar is empty unless explicitly uploaded by user
        $avatar = '';

        $insert = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, department, avatar) VALUES (?, ?, ?, ?, ?, ?)");
        $insert->execute([$name, $email, $passwordHash, $role, $department, $avatar]);
        $newUserId = $pdo->lastInsertId();

        // Create welcome notification
        $notif = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
        $notif->execute([$newUserId, 'Welcome to ShareSphere!', 'Your campus resource sharing account has been created successfully.', 'success']);

        $stmt = $pdo->prepare("SELECT user_id, name, email, role, department, phone, avatar FROM users WHERE user_id = ?");
        $stmt->execute([$newUserId]);
        $user = $stmt->fetch();

        sendResponse([
            'message' => 'Registration successful',
            'token' => 'Bearer ' . $user['user_id'],
            'user' => $user
        ], 201);
    }

    if ($action === 'update_profile') {
        $user = getCurrentUser($pdo);
        if (!$user) {
            sendError('Unauthorized', 401);
        }

        $name = trim($data['name'] ?? $user['name']);
        $department = trim($data['department'] ?? $user['department']);
        $phone = trim($data['phone'] ?? $user['phone']);
        $avatar = trim($data['avatar'] ?? $user['avatar']);

        $stmt = $pdo->prepare("UPDATE users SET name = ?, department = ?, phone = ?, avatar = ? WHERE user_id = ?");
        $stmt->execute([$name, $department, $phone, $avatar, $user['user_id']]);

        $updated = getCurrentUser($pdo);
        sendResponse(['message' => 'Profile updated successfully', 'user' => $updated]);
    }

    if ($action === 'change_password') {
        $user = getCurrentUser($pdo);
        if (!$user) {
            sendError('Unauthorized', 401);
        }

        $currentPass = trim($data['current_password'] ?? '');
        $newPass = trim($data['new_password'] ?? '');
        $confirmPass = trim($data['confirm_password'] ?? '');

        if (empty($currentPass) || empty($newPass)) {
            sendError('Current and new password are required.');
        }

        if (strlen($newPass) < 6) {
            sendError('New password must be at least 6 characters.');
        }

        if (!empty($confirmPass) && $newPass !== $confirmPass) {
            sendError('New passwords do not match.');
        }

        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);
        $row = $stmt->fetch();

        if (!password_verify($currentPass, $row['password_hash'])) {
            sendError('Current password is incorrect.', 400);
        }

        $newHash = password_hash($newPass, PASSWORD_BCRYPT);
        $update = $pdo->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
        $update->execute([$newHash, $user['user_id']]);

        sendResponse(['message' => 'Password updated successfully!']);
    }
}

if ($method === 'GET') {
    if ($action === 'me') {
        $user = getCurrentUser($pdo);
        if (!$user) {
            sendError('Not authenticated', 401);
        }
        sendResponse(['user' => $user]);
    }
}

sendError('Invalid endpoint or method', 404);
