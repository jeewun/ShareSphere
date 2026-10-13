-- =====================================================================
-- ShareSphere: A Smart Resource-Sharing & Reservation Management System
-- Database Schema for MySQL / MariaDB (R2023 IT / REC Web Programming)
-- Compatible with XAMPP, WAMP, Laragon, or standalone MySQL 8.x
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `sharesphere` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sharesphere`;

-- Drop tables if existing (in reverse foreign key order)
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
    `role` ENUM('student', 'faculty', 'lab_assistant', 'admin') NOT NULL DEFAULT 'student',
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
    `condition_status` ENUM('New', 'Like New', 'Good', 'Fair') NOT NULL DEFAULT 'Good',
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
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reservation_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    INDEX `idx_res_dates` (`resource_id`, `start_date`, `end_date`, `status`)
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
-- SEED DATA (Default password for accounts is 'password123', admin is 'admin123')
-- =====================================================================

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `role`, `department`, `phone`, `avatar`) VALUES
(1, 'Alex Carter', 'alex@example.com', '$2y$10$w099k76gXQeYvj8H4lA12.m3Vq7Q7y9hO9g.1B6wXh6h2Xl8nI9v.', 'student', 'Information Technology', '+91 98765 11111', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
(2, 'John Doe', 'john@example.com', '$2y$10$w099k76gXQeYvj8H4lA12.m3Vq7Q7y9hO9g.1B6wXh6h2Xl8nI9v.', 'faculty', 'Computer Science & Engineering', '+91 98765 22222', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'),
(3, 'Sarah Kim', 'sarah@example.com', '$2y$10$w099k76gXQeYvj8H4lA12.m3Vq7Q7y9hO9g.1B6wXh6h2Xl8nI9v.', 'lab_assistant', 'Electronics & Comm.', '+91 98765 33333', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'),
(4, 'David Lee', 'david@example.com', '$2y$10$w099k76gXQeYvj8H4lA12.m3Vq7Q7y9hO9g.1B6wXh6h2Xl8nI9v.', 'student', 'Mechanical Engineering', '+91 98765 44444', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'),
(5, 'System Administrator', 'admin@sharesphere.edu', '$2y$10$tJ0iQ6xG6m1.f5kY.p3hReB6U3/Q6/r2uD4m8L7u5K8X1q3s0w5i6', 'admin', 'Central Campus Administration', '+91 98765 00000', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80');

INSERT INTO `categories` (`category_id`, `name`, `icon`, `description`) VALUES
(1, 'Electronics', 'Laptop', 'Laptops, calculators, audio systems, and microcontrollers'),
(2, 'Media & Photography', 'Camera', 'DSLR cameras, lenses, tripods, studio lights and microphones'),
(3, 'Science & Lab', 'Cpu', 'Oscilloscopes, digital multimeters, test benches and sensors'),
(4, 'Sports & Recreation', 'Trophy', 'Tennis rackets, badminton sets, basketballs, fitness gear'),
(5, 'Study & Reference', 'BookOpen', 'Engineering handbooks, graphing tablets, project modules');

INSERT INTO `resources` (`resource_id`, `owner_id`, `category_id`, `title`, `description`, `specifications`, `condition_status`, `location`, `image_url`, `rating`, `reviews_count`, `status`) VALUES
(1, 2, 2, 'Canon EOS 200D Camera', 'DSLR camera with 24.1MP APS-C CMOS sensor, Dual Pixel autofocus, 4K video recording, and 18-55mm IS STM kit lens. Great for campus events and multimedia projects.', 'Sensor: 24.1MP | Mount: Canon EF-S | Kit: 18-55mm Lens | Battery: 2x LP-E17', 'Good', 'Library / Media Lab', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', 4.8, 12, 'available'),
(2, 3, 1, 'Scientific Calculator (fx-991EX)', 'Casio ClassWiz scientific calculator with 552 functions, natural textbook high-resolution display, matrix calculation, equation solver, and QR code visualizer.', 'Functions: 552 | Power: Solar + LR44 | Display: 192x63 dots natural textbook', 'Like New', 'Science Building - Room 302', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80', 4.9, 8, 'available'),
(3, 1, 4, 'Tennis Racket (Wilson Pro Staff)', 'Precision graphite composite tennis racket with vibration dampener, synthetic gut strings, fresh grip tape, and carrying case.', 'Head Size: 97 sq.in | Weight: 315g | Grip: Size 3 | Strings: Wilson Sensation 16G', 'Good', 'Sports Complex - Equipment Desk', 'https://images.unsplash.com/photo-1617083934555-ac7d4efa22d9?auto=format&fit=crop&w=800&q=80', 4.7, 5, 'available'),
(4, 2, 1, 'Laptop (i5, 16GB RAM)', 'High-performance college workstation with 11th Gen Intel Core i5 processor, 16GB DDR4 RAM, 512GB SSD, pre-configured with Linux, VS Code, and MATLAB.', 'CPU: Intel Core i5-1135G7 | RAM: 16GB | SSD: 512GB NVMe | OS: Dual Boot Windows 11 + Ubuntu', 'Good', 'Library - IT Helpdesk', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 4.6, 10, 'available'),
(5, 3, 1, 'Projector (Full HD 3500 Lumens)', 'Bright 1080p multimedia projector with dual HDMI ports, USB display, 16W speaker, and wireless casting module for seminar halls.', 'Resolution: 1920x1080 | Lumens: 3500 ANSI | Contrast: 15000:1 | Inputs: 2x HDMI, VGA', 'Like New', 'Lecture Hall - AV Center', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80', 4.8, 7, 'available'),
(6, 3, 3, 'Lab Equipment Kit (Oscilloscope & DMM)', 'Dual-channel digital storage oscilloscope (100MHz bandwidth, 1GSa/s sampling) plus true-RMS digital multimeter with calibration certificates.', 'Bandwidth: 100MHz | Channels: 2 | Memory: 14Mpts | DMM: 6000 Counts auto-ranging', 'Like New', 'Lab 1 - Electrical Engineering', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', 4.9, 6, 'available'),
(7, 2, 2, 'Nikon D5600 Camera', 'Compact DSLR with 24.2 MP DX sensor, 3.2-inch vari-angle touchscreen LCD, 39-point AF system, and SnapBridge Bluetooth pairing.', 'Sensor: 24.2MP | Video: 1080/60p | Lens: AF-P DX 18-55mm VR', 'Like New', 'Library - Multimedia Center', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80', 4.7, 9, 'available'),
(8, 1, 2, 'Sony Alpha 6400 Camera', 'Advanced mirrorless camera with world-class real-time tracking AF, 4K HDR movie recording, 180-degree flip screen, and 16-50mm power zoom.', 'Sensor: 24.2MP APS-C | AF: 425 Phase-detection points | Video: 4K HDR', 'Like New', 'Media Lab - Room 104', 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80', 4.9, 15, 'available'),
(9, 4, 2, 'Fujifilm Instax Mini 11', 'Instant film camera with automatic exposure control, built-in selfie lens mirror, and wrist strap.', 'Film: Fujifilm Instax Mini | Lens: 60mm f/12.7 | Power: 2x AA Batteries', 'Good', 'Student Center - Club Room', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', 4.5, 4, 'available'),
(10, 4, 4, 'Badminton Racket Set (Yonex Nanoray)', 'Pair of Nanoray 10F graphite rackets with Isometric head design, pre-strung with Yonex BG65.', 'Frame: Full Graphite | Weight: 4U (83g) | Pack: 2 Rackets + Shuttle Tube', 'Good', 'Sports Complex - Indoor Courts', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', 4.6, 8, 'available');

INSERT INTO `reservations` (`reservation_id`, `resource_id`, `user_id`, `start_date`, `end_date`, `purpose`, `status`, `decision_notes`) VALUES
(1, 1, 1, '2026-10-12', '2026-10-14', 'Campus fest photography coverage and yearbook portraits', 'pending', 'Awaiting owner equipment inspection'),
(2, 1, 3, '2026-10-19', '2026-10-20', 'Robotics competition showcase documentation', 'approved', 'Confirmed pickup from Library front desk'),
(3, 1, 4, '2026-10-25', '2026-10-27', 'ECE department final year project demonstration video', 'pending', 'Under review'),
(4, 4, 1, '2026-10-05', '2026-10-07', 'Deep learning workshop and GPU simulation benchmark', 'approved', 'Completed without issue'),
(5, 3, 4, '2026-09-20', '2026-09-22', 'Inter-college sports tournament practice sessions', 'approved', 'Returned in good condition'),
(6, 5, 1, '2026-09-10', '2026-09-12', 'Guest lecture seminar presentation', 'rejected', 'AV technician was undergoing routine maintenance'),
(7, 6, 4, '2026-09-02', '2026-09-04', 'Antenna frequency response testing in RF lab', 'approved', 'Returned on time');

INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `type`, `is_read`, `link`) VALUES
(1, 1, 'Reservation Approved', 'Your booking for Canon EOS 200D Camera has been approved.', 'success', 0, '/bookings'),
(2, 1, 'Reservation Rejected', 'Your booking for Projector has been rejected.', 'danger', 0, '/bookings'),
(3, 1, 'Direct Message', 'New message from John Doe: Hi, the camera is ready for pickup.', 'info', 0, '/resources/1'),
(4, 1, 'New Resource Request', 'Your resource (Laptop) received a new reservation request.', 'success', 1, '/bookings'),
(5, 1, 'Reservation Cancelled', 'Your booking for Tennis Racket has been cancelled.', 'danger', 1, '/bookings');
