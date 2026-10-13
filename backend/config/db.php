<?php
// backend/config/db.php

class Database {
    private static $pdo = null;
    private static $driver = null; // 'mysql' or 'sqlite'

    public static function getConnection() {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        // Configuration settings
        $dbConfig = [
            'use_mysql' => false, // Set to true if MySQL server is running
            'mysql_host' => '127.0.0.1',
            'mysql_port' => 3306,
            'mysql_db'   => 'sharesphere',
            'mysql_user' => 'root',
            'mysql_pass' => '',
            'sqlite_path'=> __DIR__ . '/../database/sharesphere.sqlite'
        ];

        // Try MySQL first if configured or available
        $mysqlAttempt = false;
        if ($dbConfig['use_mysql']) {
            try {
                $dsn = "mysql:host={$dbConfig['mysql_host']};port={$dbConfig['mysql_port']};charset=utf8mb4";
                $initPdo = new PDO($dsn, $dbConfig['mysql_user'], $dbConfig['mysql_pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
                $initPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbConfig['mysql_db']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                
                $fullDsn = "mysql:host={$dbConfig['mysql_host']};port={$dbConfig['mysql_port']};dbname={$dbConfig['mysql_db']};charset=utf8mb4";
                self::$pdo = new PDO($fullDsn, $dbConfig['mysql_user'], $dbConfig['mysql_pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
                self::$driver = 'mysql';
                $mysqlAttempt = true;
            } catch (PDOException $e) {
                // If MySQL fails, gracefully fallback to SQLite
                $mysqlAttempt = false;
            }
        }

        if (!$mysqlAttempt) {
            // SQLite connection
            $sqliteDir = dirname($dbConfig['sqlite_path']);
            if (!is_dir($sqliteDir)) {
                mkdir($sqliteDir, 0777, true);
            }

            self::$pdo = new PDO("sqlite:" . $dbConfig['sqlite_path'], null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            self::$pdo->exec("PRAGMA foreign_keys = ON;");
            self::$driver = 'sqlite';
        }

        // Initialize schema and seed data if needed
        self::initDatabase();

        return self::$pdo;
    }

    public static function getDriver() {
        return self::$driver;
    }

    private static function initDatabase() {
        if (!self::$pdo) return;

        // Check if users table exists
        try {
            $test = self::$pdo->query("SELECT 1 FROM users LIMIT 1");
        } catch (Exception $e) {
            // Need to initialize tables
            self::createSchema();
            self::seedInitialData();
        }
    }

    private static function createSchema() {
        if (self::$driver === 'sqlite') {
            $sql = "
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT CHECK(role IN ('student', 'faculty', 'lab_assistant', 'admin')) DEFAULT 'student',
                department TEXT DEFAULT 'Information Technology',
                phone TEXT DEFAULT '+91 98765 43210',
                avatar TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                icon TEXT DEFAULT 'Layers',
                description TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS resources (
                resource_id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                specifications TEXT DEFAULT '',
                condition_status TEXT CHECK(condition_status IN ('New', 'Like New', 'Good', 'Fair')) DEFAULT 'Good',
                location TEXT NOT NULL,
                image_url TEXT NOT NULL,
                rating REAL DEFAULT 4.8,
                reviews_count INTEGER DEFAULT 12,
                status TEXT CHECK(status IN ('available', 'maintenance', 'retired')) DEFAULT 'available',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS reservations (
                reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                resource_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                purpose TEXT DEFAULT '',
                status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')) DEFAULT 'pending',
                decision_notes TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT CHECK(type IN ('info', 'success', 'warning', 'danger')) DEFAULT 'info',
                is_read INTEGER DEFAULT 0,
                link TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_res_dates ON reservations(resource_id, start_date, end_date, status);
            ";
            self::$pdo->exec($sql);
        } else {
            // MySQL Schema
            $sql = "
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(120) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('student', 'faculty', 'lab_assistant', 'admin') DEFAULT 'student',
                department VARCHAR(100) DEFAULT 'Information Technology',
                phone VARCHAR(30) DEFAULT '+91 98765 43210',
                avatar VARCHAR(255) DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;

            CREATE TABLE IF NOT EXISTS categories (
                category_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                icon VARCHAR(50) DEFAULT 'Layers',
                description VARCHAR(255) DEFAULT ''
            ) ENGINE=InnoDB;

            CREATE TABLE IF NOT EXISTS resources (
                resource_id INT AUTO_INCREMENT PRIMARY KEY,
                owner_id INT NOT NULL,
                category_id INT NOT NULL,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL,
                specifications TEXT DEFAULT NULL,
                condition_status ENUM('New', 'Like New', 'Good', 'Fair') DEFAULT 'Good',
                location VARCHAR(120) NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                rating DECIMAL(2,1) DEFAULT 4.8,
                reviews_count INT DEFAULT 12,
                status ENUM('available', 'maintenance', 'retired') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(category_id)
            ) ENGINE=InnoDB;

            CREATE TABLE IF NOT EXISTS reservations (
                reservation_id INT AUTO_INCREMENT PRIMARY KEY,
                resource_id INT NOT NULL,
                user_id INT NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                purpose TEXT DEFAULT NULL,
                status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
                decision_notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_res_dates (resource_id, start_date, end_date, status)
            ) ENGINE=InnoDB;

            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(150) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
                is_read TINYINT(1) DEFAULT 0,
                link VARCHAR(255) DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
            ";
            self::$pdo->exec($sql);
        }
    }

    public static function seedInitialData() {
        require_once __DIR__ . '/../database/seed_data.php';
        seedDatabase(self::$pdo);
    }
}
