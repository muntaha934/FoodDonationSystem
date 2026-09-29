-- =====================================================================
-- FOOD WASTE MANAGEMENT SYSTEM - FINAL CONSOLIDATED SCHEMA
-- This single file includes the original 15-table design PLUS every
-- ALTER TABLE change made afterward, already merged in. Run this once
-- on a fresh database instead of running the original script + separate
-- ALTER scripts one by one.
-- Engine: MySQL (XAMPP / phpMyAdmin compatible)
-- =====================================================================

DROP DATABASE IF EXISTS food_waste_management;
CREATE DATABASE food_waste_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_waste_management;

-- =====================================================================
-- 1. APPUSER (Base entity for ISA hierarchy)
--    + reset_token, reset_expires (added for Forgot Password feature)
-- =====================================================================
CREATE TABLE AppUser (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    role          ENUM('donor', 'volunteer', 'admin', 'recipient') NOT NULL,
    phone         VARCHAR(50) DEFAULT NULL,
    donor_type    VARCHAR(100) DEFAULT NULL,
    recipient_type VARCHAR(100) DEFAULT NULL,
    organization_name VARCHAR(200) DEFAULT NULL,
    address       VARCHAR(255) DEFAULT NULL,
    vehicle_type  VARCHAR(100) DEFAULT NULL,
    availability  VARCHAR(255) DEFAULT NULL,
    status        VARCHAR(32) NOT NULL DEFAULT 'active',
    reset_token   VARCHAR(64)  NULL DEFAULT NULL,
    reset_expires DATETIME     NULL DEFAULT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId        VARCHAR(50) UNIQUE NULL,
    userIdLegacy  VARCHAR(50) UNIQUE NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 2. ADDRESS (standalone, referenced by Donor + FoodDonation pickup)
-- =====================================================================
CREATE TABLE Address (
    address_id   INT AUTO_INCREMENT PRIMARY KEY,
    street       VARCHAR(150) NOT NULL,
    city         VARCHAR(80) NOT NULL,
    state        VARCHAR(80),
    postal_code  VARCHAR(20)
) ENGINE=InnoDB;

-- =====================================================================
-- 3. DONOR (ISA subclass of AppUser)
-- =====================================================================
CREATE TABLE Donor (
    donor_id     INT PRIMARY KEY,
    donor_type   VARCHAR(100) DEFAULT 'individual',
    org_name     VARCHAR(150),
    address_id   INT,
    FOREIGN KEY (donor_id) REFERENCES AppUser(user_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 4. VOLUNTEER (ISA subclass of AppUser)
-- =====================================================================
CREATE TABLE Volunteer (
    volunteer_id  INT PRIMARY KEY,
    vehicle_type  VARCHAR(50),
    availability  VARCHAR(255) DEFAULT 'available',
    FOREIGN KEY (volunteer_id) REFERENCES AppUser(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 5. ADMIN (ISA subclass of AppUser)
-- =====================================================================
CREATE TABLE Admin (
    admin_id         INT PRIMARY KEY,
    permission_level ENUM('super', 'moderator', 'support') DEFAULT 'moderator',
    FOREIGN KEY (admin_id) REFERENCES AppUser(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 6. RECIPIENT (ISA subclass of AppUser)
-- =====================================================================
CREATE TABLE Recipient (
    recipient_id    INT PRIMARY KEY,
    recipient_type  VARCHAR(100) DEFAULT 'individual',
    org_name        VARCHAR(150),
    FOREIGN KEY (recipient_id) REFERENCES AppUser(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 7. FOODCATEGORY
-- =====================================================================
CREATE TABLE FoodCategory (
    category_id    INT AUTO_INCREMENT PRIMARY KEY,
    category_name  VARCHAR(80) NOT NULL UNIQUE,
    categoryId     VARCHAR(50) UNIQUE NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 8. FOODDONATION (central entity)
-- =====================================================================
CREATE TABLE FoodDonation (
    donation_id   INT AUTO_INCREMENT PRIMARY KEY,
    donor_id      INT NOT NULL,
    category_id   INT,
    address_id    INT,
    title         VARCHAR(150) NOT NULL,
    quantity      DECIMAL(10,2) NOT NULL,
    unit          VARCHAR(30) NOT NULL,
    expiry_time   DATETIME NOT NULL,
    status        ENUM('available', 'requested', 'assigned', 'delivered', 'wasted', 'expired', 'pending', 'claimed', 'cancelled') DEFAULT 'available',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    donationId    VARCHAR(50) UNIQUE NULL,
    donorId       VARCHAR(50) NULL,
    donorName     VARCHAR(150) NULL,
    categoryId    VARCHAR(50) NULL,
    description   TEXT NULL,
    preparedAt    DATETIME NULL,
    expiresAt     DATETIME NULL,
    pickupAddress VARCHAR(255) NULL,
    contact       VARCHAR(100) NULL,
    notes         TEXT NULL,
    requestCount  INT NOT NULL DEFAULT 0,
    createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES FoodCategory(category_id) ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 9. DONATIONIMAGE (weak entity)
-- =====================================================================
CREATE TABLE DonationImage (
    image_id     INT AUTO_INCREMENT PRIMARY KEY,
    donation_id  INT NOT NULL,
    image_url    VARCHAR(255) NOT NULL,
    FOREIGN KEY (donation_id) REFERENCES FoodDonation(donation_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 10. REQUEST
-- =====================================================================
CREATE TABLE Request (
    request_id     INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id   INT NOT NULL,
    donation_id    INT NOT NULL,
    requested_qty  DECIMAL(10,2) NOT NULL,
    status         ENUM('pending', 'approved', 'rejected', 'fulfilled', 'accepted', 'cancelled') DEFAULT 'pending',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requestId      VARCHAR(50) UNIQUE NULL,
    recipientId    VARCHAR(50) NULL,
    recipientName  VARCHAR(150) NULL,
    requestedQuantity INT NULL,
    peopleToServe  INT NULL,
    notes          TEXT NULL,
    createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES FoodDonation(donation_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 11. PICKUPASSIGNMENT
-- =====================================================================
CREATE TABLE PickupAssignment (
    assignment_id  INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id   INT NOT NULL,
    request_id     INT NOT NULL,
    pickup_time    DATETIME,
    delivery_time  DATETIME,
    status         ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled') DEFAULT 'assigned',
    assignmentId   VARCHAR(50) UNIQUE NULL,
    donationId     VARCHAR(50) NULL,
    volunteerId    VARCHAR(50) NULL,
    donorName      VARCHAR(150) NULL,
    recipientName  VARCHAR(150) NULL,
    pickupAddress  VARCHAR(255) NULL,
    deliveryAddress VARCHAR(255) NULL,
    pickupTime     DATETIME NULL,
    deliveryTime   DATETIME NULL,
    FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES Request(request_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 12. WASTELOG (weak entity)
-- =====================================================================
CREATE TABLE WasteLog (
    waste_id         INT AUTO_INCREMENT PRIMARY KEY,
    donation_id      INT NOT NULL,
    quantity_wasted  DECIMAL(10,2) NOT NULL,
    reason           VARCHAR(255),
    logged_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES FoodDonation(donation_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 13. NOTIFICATION
-- =====================================================================
CREATE TABLE Notification (
    notification_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    donation_id      INT,
    message          VARCHAR(255) NOT NULL,
    is_read          BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notificationId   VARCHAR(50) UNIQUE NULL,
    userId           VARCHAR(50) NULL,
    isRead           BOOLEAN DEFAULT FALSE,
    createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES AppUser(user_id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES FoodDonation(donation_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 14. FEEDBACK
-- =====================================================================
CREATE TABLE Feedback (
    feedback_id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL,
    donation_id         INT NOT NULL,
    request_id          INT NULL,
    rating              TINYINT CHECK (rating BETWEEN 1 AND 5),
    comments            VARCHAR(500),
    volunteer_id        INT NULL,
    volunteer_rating    TINYINT NULL,
    volunteer_comments  VARCHAR(500) NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedbackId          VARCHAR(50) UNIQUE NULL,
    fromUserId          VARCHAR(50) NULL,
    toUserId            VARCHAR(50) NULL,
    review              TEXT NULL,
    createdAt           DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES AppUser(user_id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES FoodDonation(donation_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES Request(request_id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 15. AUDITLOG
-- =====================================================================
CREATE TABLE AuditLog (
    log_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    action_type  VARCHAR(50) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id    INT,
    action_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logId        VARCHAR(50) UNIQUE NULL,
    timestamp    DATETIME DEFAULT CURRENT_TIMESTAMP,
    userName     VARCHAR(150) NULL,
    action       VARCHAR(100) NULL,
    entity       VARCHAR(150) NULL,
    description  TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES AppUser(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- INDEXES for common lookups
-- =====================================================================
CREATE INDEX idx_donation_status ON FoodDonation(status);
CREATE INDEX idx_donation_expiry ON FoodDonation(expiry_time);
CREATE INDEX idx_request_status ON Request(status);
CREATE INDEX idx_notification_user ON Notification(user_id, is_read);
CREATE INDEX idx_auditlog_user ON AuditLog(user_id);

-- ===============================================================
-- NOTE: Mock/demo seed data has been moved to database/extramockdata.sql
-- Keep this file as the clean database schema only.
-- ===============================================================

-- =====================================================================
-- END OF FINAL CONSOLIDATED SCHEMA
-- =====================================================================
