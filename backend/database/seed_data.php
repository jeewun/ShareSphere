<?php
// backend/database/seed_data.php

function seedDatabase($pdo) {
    // Check if users already seeded
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    if ($stmt->fetch()['count'] > 0) {
        return; // Already seeded
    }

    $passHash = password_hash('password123', PASSWORD_BCRYPT);
    $adminHash = password_hash('admin123', PASSWORD_BCRYPT);

    // 1. Insert Users
    $users = [
        ['Alex Carter', 'alex@example.com', $passHash, 'student', 'Information Technology', '+91 98765 11111', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'],
        ['John Doe', 'john@example.com', $passHash, 'faculty', 'Computer Science & Engineering', '+91 98765 22222', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'],
        ['Sarah Kim', 'sarah@example.com', $passHash, 'lab_assistant', 'Electronics & Comm.', '+91 98765 33333', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'],
        ['David Lee', 'david@example.com', $passHash, 'student', 'Mechanical Engineering', '+91 98765 44444', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'],
        ['System Administrator', 'admin@sharesphere.edu', $adminHash, 'admin', 'Central Campus Administration', '+91 98765 00000', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80']
    ];

    $userStmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, department, phone, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($users as $u) {
        $userStmt->execute($u);
    }

    // 2. Insert Categories
    $categories = [
        ['Electronics', 'Laptop', 'Laptops, calculators, audio systems, and microcontrollers'],
        ['Media & Photography', 'Camera', 'DSLR cameras, lenses, tripods, studio lights and microphones'],
        ['Science & Lab', 'Cpu', 'Oscilloscopes, digital multimeters, test benches and sensors'],
        ['Sports & Recreation', 'Trophy', 'Tennis rackets, badminton sets, basketballs, fitness gear'],
        ['Study & Reference', 'BookOpen', 'Engineering handbooks, graphing tablets, project modules']
    ];

    $catStmt = $pdo->prepare("INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)");
    foreach ($categories as $c) {
        $catStmt->execute($c);
    }

    // 3. Insert Resources
    $resources = [
        [
            2, 2, 'Canon EOS 200D Camera',
            'DSLR camera with 24.1MP APS-C CMOS sensor, Dual Pixel autofocus, 4K video recording, and 18-55mm IS STM kit lens. Great for campus events and multimedia projects.',
            'Sensor: 24.1MP | Mount: Canon EF-S | Kit: 18-55mm Lens | Battery: 2x LP-E17 | Storage: 64GB SanDisk SD Card',
            'Good', 'Library / Media Lab',
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
            4.8, 12, 'available'
        ],
        [
            3, 1, 'Scientific Calculator (fx-991EX)',
            'Casio ClassWiz scientific calculator with 552 functions, natural textbook high-resolution display, matrix calculation, equation solver, and QR code visualizer.',
            'Functions: 552 | Power: Solar + LR44 | Display: 192x63 dots natural textbook | Approved for engineering exams',
            'Like New', 'Science Building - Room 302',
            'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
            4.9, 8, 'available'
        ],
        [
            1, 4, 'Tennis Racket (Wilson Pro Staff)',
            'Precision graphite composite tennis racket with vibration dampener, synthetic gut strings, fresh grip tape, and carrying case.',
            'Head Size: 97 sq.in | Weight: 315g | Grip: Size 3 (4 3/8) | Strings: Wilson Sensation 16G',
            'Good', 'Sports Complex - Equipment Desk',
            'https://images.unsplash.com/photo-1617083934555-ac7d4efa22d9?auto=format&fit=crop&w=800&q=80',
            4.7, 5, 'available'
        ],
        [
            2, 1, 'Laptop (i5, 16GB RAM)',
            'High-performance college workstation with 11th Gen Intel Core i5 processor, 16GB DDR4 RAM, 512GB SSD, pre-configured with Linux, VS Code, and MATLAB.',
            'CPU: Intel Core i5-1135G7 | RAM: 16GB | SSD: 512GB NVMe | OS: Dual Boot Windows 11 + Ubuntu 22.04',
            'Good', 'Library - IT Helpdesk',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
            4.6, 10, 'available'
        ],
        [
            3, 1, 'Projector (Full HD 3500 Lumens)',
            'Bright 1080p multimedia projector with dual HDMI ports, USB display, 16W speaker, and wireless casting module for seminar halls.',
            'Resolution: 1920x1080 | Lumens: 3500 ANSI | Contrast: 15000:1 | Inputs: 2x HDMI, VGA, Audio Out',
            'Like New', 'Lecture Hall - AV Center',
            'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
            4.8, 7, 'available'
        ],
        [
            3, 3, 'Lab Equipment Kit (Oscilloscope & DMM)',
            'Dual-channel digital storage oscilloscope (100MHz bandwidth, 1GSa/s sampling) plus true-RMS digital multimeter with calibration certificates.',
            'Bandwidth: 100MHz | Channels: 2 | Memory: 14Mpts | DMM: 6000 Counts auto-ranging with thermocouple probe',
            'Like New', 'Lab 1 - Electrical Engineering',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            4.9, 6, 'available'
        ],
        [
            2, 2, 'Nikon D5600 Camera',
            'Compact DSLR with 24.2 MP DX sensor, 3.2-inch vari-angle touchscreen LCD, 39-point AF system, and SnapBridge Bluetooth pairing.',
            'Sensor: 24.2MP | Video: 1080/60p | Lens: AF-P DX 18-55mm VR | Battery: EN-EL14a',
            'Like New', 'Library - Multimedia Center',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
            4.7, 9, 'available'
        ],
        [
            1, 2, 'Sony Alpha 6400 Camera',
            'Advanced mirrorless camera with world-class real-time tracking AF, 4K HDR movie recording, 180-degree flip screen, and 16-50mm power zoom.',
            'Sensor: 24.2MP APS-C | AF: 425 Phase-detection points | Video: 4K HDR 30p | Lens: E PZ 16-50mm OSS',
            'Like New', 'Media Lab - Room 104',
            'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
            4.9, 15, 'available'
        ],
        [
            4, 2, 'Fujifilm Instax Mini 11',
            'Instant film camera with automatic exposure control, built-in selfie lens mirror, and wrist strap. Perfect for quick event photography.',
            'Film: Fujifilm Instax Mini | Lens: 60mm f/12.7 | Shutter: 1/2 to 1/250 sec | Power: 2x AA Batteries',
            'Good', 'Student Center - Club Room',
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
            4.5, 4, 'available'
        ],
        [
            4, 4, 'Badminton Racket Set (Yonex Nanoray)',
            'Pair of Nanoray 10F graphite rackets with Isometric head design, pre-strung with Yonex BG65, includes 6-piece nylon shuttlecock tube.',
            'Frame: Full Graphite | Weight: 4U (83g) | Balance: Head-light | Pack: 2 Rackets + Shuttle Tube',
            'Good', 'Sports Complex - Indoor Courts',
            'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
            4.6, 8, 'available'
        ]
    ];

    $resStmt = $pdo->prepare("INSERT INTO resources (owner_id, category_id, title, description, specifications, condition_status, location, image_url, rating, reviews_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($resources as $r) {
        $resStmt->execute($r);
    }

    // 4. Insert Reservations
    $nowYear = date('Y');
    $reservations = [
        // Resource 1: Canon EOS 200D
        [1, 1, "$nowYear-10-12", "$nowYear-10-14", 'Campus fest photography coverage and yearbook portraits', 'pending', 'Awaiting owner equipment inspection'],
        [1, 3, "$nowYear-10-19", "$nowYear-10-20", 'Robotics competition showcase documentation', 'approved', 'Confirmed pickup from Library front desk'],
        [1, 4, "$nowYear-10-25", "$nowYear-10-27", 'ECE department final year project demonstration video', 'pending', 'Under review'],
        // Resource 4: Laptop
        [4, 1, "$nowYear-10-05", "$nowYear-10-07", 'Deep learning workshop and GPU simulation benchmark', 'approved', 'Completed without issue'],
        // Resource 3: Tennis Racket
        [3, 4, "$nowYear-09-20", "$nowYear-09-22", 'Inter-college sports tournament practice sessions', 'approved', 'Returned in good condition'],
        // Resource 5: Projector
        [5, 1, "$nowYear-09-10", "$nowYear-09-12", 'Guest lecture seminar presentation', 'rejected', 'AV technician was undergoing routine maintenance'],
        // Resource 6: Lab Equipment Kit
        [6, 4, "$nowYear-09-02", "$nowYear-09-04", 'Antenna frequency response testing in RF lab', 'approved', 'Returned on time']
    ];

    $resvStmt = $pdo->prepare("INSERT INTO reservations (resource_id, user_id, start_date, end_date, purpose, status, decision_notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($reservations as $rv) {
        $resvStmt->execute($rv);
    }

    // 5. Insert Notifications
    $notifications = [
        [1, 'Reservation Approved', 'Your booking for Canon EOS 200D Camera has been approved.', 'success', 0, '/bookings'],
        [1, 'Reservation Rejected', 'Your booking for Projector has been rejected.', 'danger', 0, '/bookings'],
        [1, 'Direct Message', 'New message from John Doe: Hi, the camera is ready for pickup.', 'info', 0, '/resources/1'],
        [1, 'New Resource Request', 'Your resource (Laptop) received a new reservation request.', 'success', 1, '/bookings'],
        [1, 'Reservation Cancelled', 'Your booking for Tennis Racket has been cancelled.', 'danger', 1, '/bookings']
    ];

    $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($notifications as $n) {
        $notifStmt->execute($n);
    }
}
