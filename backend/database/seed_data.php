<?php
// backend/database/seed_data.php

function seedDatabase($pdo) {
    // 1. Categories (For campus members to categorize their listed items)
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
    if ($stmt->fetch()['count'] > 0) {
        return; // Already seeded
    }

    // 2. Insert Standard Categories (For users to categorize their listed items)
    $categories = [
        ['Electronics', 'Laptop', 'Laptops, calculators, audio systems, and microcontrollers'],
        ['Media & Photography', 'Camera', 'DSLR cameras, lenses, tripods, studio lights and microphones'],
        ['Science & Lab', 'Cpu', 'Oscilloscopes, digital multimeters, test benches and sensors'],
        ['Sports & Recreation', 'Trophy', 'Tennis rackets, badminton sets, basketballs, fitness gear'],
        ['Study & Reference', 'BookOpen', 'Engineering handbooks, graphing tablets, project modules'],
        ['Other', 'MoreHorizontal', 'General supplies, accessories, tools, and miscellaneous campus resources']
    ];

    $catStmt = $pdo->prepare("INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)");
    foreach ($categories as $c) {
        $catStmt->execute($c);
    }

    // 3. Resources: No predetermined mock items. Only items added by real users will be stored and displayed.
}
