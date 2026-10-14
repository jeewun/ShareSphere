-- =====================================================================
-- ShareSphere: A Smart Resource-Sharing & Reservation Management System
-- Database Schema for MySQL / MariaDB (R2023 IT / REC Web Programming)
-- Compatible with XAMPP, WAMP, Laragon, or standalone MySQL 8.x
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `sharesphere` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sharesphere`;

-- Drop tables if existing (in reverse foreign key order)
DROP TABLE IF EXISTS `handover_messages`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- 1. USERS TABLE
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'student',
    `department` VARCHAR(100) DEFAULT 'Information Technology',
    `phone` VARCHAR(30) DEFAULT '+91 98765 43210',
    `avatar` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CATEGORIES TABLE
CREATE TABLE `categories` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `icon` VARCHAR(50) DEFAULT 'Layers',
    `description` VARCHAR(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. RESOURCES TABLE
CREATE TABLE `resources` (
    `resource_id` INT AUTO_INCREMENT PRIMARY KEY,
    `owner_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `specifications` TEXT DEFAULT NULL,
    `condition_status` ENUM('New', 'Good', 'Fair', 'Poor') NOT NULL DEFAULT 'Good',
    `location` VARCHAR(120) NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `rating` DECIMAL(2,1) NOT NULL DEFAULT 4.8,
    `reviews_count` INT NOT NULL DEFAULT 12,
    `status` ENUM('available', 'maintenance', 'retired') NOT NULL DEFAULT 'available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_resource_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_resource_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. RESERVATIONS TABLE (With Conflict-Prevention Index)
CREATE TABLE `reservations` (
    `reservation_id` INT AUTO_INCREMENT PRIMARY KEY,
    `resource_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `purpose` TEXT DEFAULT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    `decision_notes` TEXT DEFAULT NULL,
    `pickup_time` VARCHAR(50) DEFAULT NULL,
    `chat_status` ENUM('active', 'closed') NOT NULL DEFAULT 'active',
    `handover_status` ENUM('pending', 'collected', 'returned') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reservation_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    INDEX `idx_res_dates` (`resource_id`, `start_date`, `end_date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4B. HANDOVER MESSAGES TABLE (Ephemeral coordination)
CREATE TABLE `handover_messages` (
    `message_id` INT AUTO_INCREMENT PRIMARY KEY,
    `reservation_id` INT NOT NULL,
    `sender_id` INT NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_handover_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`reservation_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_handover_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. NOTIFICATIONS TABLE
CREATE TABLE `notifications` (
    `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('info', 'success', 'warning', 'danger') NOT NULL DEFAULT 'info',
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `link` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA
-- =====================================================================

-- 1. Categories
INSERT INTO `categories` (`category_id`, `name`, `icon`, `description`) VALUES
(1, 'Electronics', 'Laptop', 'Laptops, calculators, audio systems, and microcontrollers'),
(2, 'Media & Photography', 'Camera', 'DSLR cameras, lenses, tripods, studio lights and microphones'),
(3, 'Science & Lab', 'Cpu', 'Oscilloscopes, digital multimeters, test benches and sensors'),
(4, 'Sports & Recreation', 'Trophy', 'Tennis rackets, badminton sets, basketballs, fitness gear'),
(5, 'Study & Reference', 'BookOpen', 'Engineering handbooks, graphing tablets, project modules'),
(6, 'Other', 'MoreHorizontal', 'General supplies, accessories, tools, and miscellaneous campus resources');

-- 3. Shareable Campus Resources: Starts clean. Real users list resources via 'My Listed Items'.
