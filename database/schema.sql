CREATE DATABASE IF NOT EXISTS food_waste_management;
USE food_waste_management;

DROP TABLE IF EXISTS AuditLog;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Feedback;
DROP TABLE IF EXISTS WasteLog;
DROP TABLE IF EXISTS PickupAssignment;
DROP TABLE IF EXISTS Request;
DROP TABLE IF EXISTS DonationImage;
DROP TABLE IF EXISTS FoodDonation;
DROP TABLE IF EXISTS FoodCategory;
DROP TABLE IF EXISTS AppUser;

CREATE TABLE AppUser (
    userId VARCHAR(50) PRIMARY KEY,
    role ENUM('donor', 'recipient', 'volunteer', 'admin') NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    donor_type VARCHAR(100) DEFAULT NULL,
    recipient_type VARCHAR(100) DEFAULT NULL,
    organization_name VARCHAR(200) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    vehicle_type VARCHAR(100) DEFAULT NULL,
    availability VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE FoodCategory (
    categoryId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE FoodDonation (
    donationId VARCHAR(50) PRIMARY KEY,
    donorId VARCHAR(50) NOT NULL,
    donorName VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    categoryId VARCHAR(50) NOT NULL,
    description TEXT,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    preparedAt DATETIME NOT NULL,
    expiresAt DATETIME NOT NULL,
    pickupAddress VARCHAR(255) NOT NULL,
    contact VARCHAR(100) DEFAULT NULL,
    notes TEXT,
    status ENUM('available', 'pending', 'claimed', 'delivered', 'expired', 'cancelled') NOT NULL DEFAULT 'available',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    requestCount INT NOT NULL DEFAULT 0,
    FOREIGN KEY (donorId) REFERENCES AppUser(userId),
    FOREIGN KEY (categoryId) REFERENCES FoodCategory(categoryId)
);

CREATE TABLE DonationImage (
    imageId VARCHAR(50) PRIMARY KEY,
    donationId VARCHAR(50) NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donationId) REFERENCES FoodDonation(donationId)
);

CREATE TABLE Request (
    requestId VARCHAR(50) PRIMARY KEY,
    donationId VARCHAR(50) NOT NULL,
    recipientId VARCHAR(50) NOT NULL,
    recipientName VARCHAR(150) NOT NULL,
    requestedQuantity INT NOT NULL,
    peopleToServe INT NOT NULL,
    notes TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donationId) REFERENCES FoodDonation(donationId),
    FOREIGN KEY (recipientId) REFERENCES AppUser(userId)
);

CREATE TABLE PickupAssignment (
    assignmentId VARCHAR(50) PRIMARY KEY,
    requestId VARCHAR(50) NOT NULL,
    donationId VARCHAR(50) NOT NULL,
    volunteerId VARCHAR(50) NOT NULL,
    donorName VARCHAR(150) NOT NULL,
    recipientName VARCHAR(150) NOT NULL,
    pickupAddress VARCHAR(255) NOT NULL,
    deliveryAddress VARCHAR(255) NOT NULL,
    pickupTime DATETIME DEFAULT NULL,
    deliveryTime DATETIME DEFAULT NULL,
    status ENUM('assigned', 'picked_up', 'in_transit', 'delivered') NOT NULL DEFAULT 'assigned',
    FOREIGN KEY (requestId) REFERENCES Request(requestId),
    FOREIGN KEY (donationId) REFERENCES FoodDonation(donationId),
    FOREIGN KEY (volunteerId) REFERENCES AppUser(userId)
);

CREATE TABLE WasteLog (
    wasteLogId VARCHAR(50) PRIMARY KEY,
    donationId VARCHAR(50) NOT NULL,
    categoryId VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    expiresAt DATETIME NOT NULL,
    loggedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donationId) REFERENCES FoodDonation(donationId),
    FOREIGN KEY (categoryId) REFERENCES FoodCategory(categoryId)
);

CREATE TABLE Feedback (
    feedbackId VARCHAR(50) PRIMARY KEY,
    donationId VARCHAR(50) NOT NULL,
    fromUserId VARCHAR(50) NOT NULL,
    toUserId VARCHAR(50) NOT NULL,
    rating INT NOT NULL,
    review TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donationId) REFERENCES FoodDonation(donationId),
    FOREIGN KEY (fromUserId) REFERENCES AppUser(userId),
    FOREIGN KEY (toUserId) REFERENCES AppUser(userId)
);

CREATE TABLE Notification (
    notificationId VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    isRead TINYINT(1) NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES AppUser(userId)
);

CREATE TABLE AuditLog (
    logId VARCHAR(50) PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userName VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(150) NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO FoodCategory (categoryId, name) VALUES
('C1', 'Cooked Meal'),
('C2', 'Packaged Food'),
('C3', 'Produce'),
('C4', 'Bakery');

INSERT INTO AppUser (userId, role, name, email, password_hash, phone, donor_type, recipient_type, organization_name, address, vehicle_type, availability, status, created_at) VALUES
('U-D1', 'donor', 'Amina Rahman', 'donor@demo.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1711-000111', 'Restaurant', NULL, 'Green Leaf Kitchen', 'House 12, Road 5, Dhanmondi, Dhaka', NULL, NULL, 'active', '2026-06-14 10:00:00'),
('U-R1', 'recipient', 'Karim Hasan', 'recipient@demo.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1811-222333', NULL, 'NGO', 'Hope Shelter Trust', '45 Mirpur Road, Dhaka', NULL, NULL, 'active', '2026-06-20 09:30:00'),
('U-V1', 'volunteer', 'Tanvir Alam', 'volunteer@demo.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1911-444555', NULL, NULL, NULL, '22 Banani, Dhaka', 'Motorbike', 'Evenings & weekends', 'active', '2026-07-02 14:15:00'),
('U-A1', 'admin', 'System Admin', 'admin@demo.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1611-777888', NULL, NULL, NULL, 'Sufra HQ, Gulshan, Dhaka', NULL, NULL, 'active', '2026-05-01 09:00:00');

INSERT INTO FoodDonation (
    donationId, donorId, donorName, title, categoryId, description, quantity, unit, preparedAt, expiresAt,
    pickupAddress, contact, notes, status, createdAt, requestCount
) VALUES
('D-1001', 'U-D1', 'Green Leaf Kitchen', 'Vegetable Biryani Trays', 'C1', 'Freshly cooked vegetable biryani, prepared for a cancelled event.', 12, 'trays', '2026-09-02 10:00:00', '2026-09-02 20:00:00', 'House 12, Road 5, Dhanmondi, Dhaka', '+880 1711-000111', NULL, 'available', '2026-09-02 10:15:00', 2),
('D-1002', 'U-D1', 'Green Leaf Kitchen', 'Packaged Sandwiches', 'C2', 'Sealed sandwich packs left over from a catering order.', 30, 'packs', '2026-09-02 09:00:00', '2026-09-03 09:00:00', 'House 12, Road 5, Dhanmondi, Dhaka', '+880 1711-000111', NULL, 'pending', '2026-09-02 09:20:00', 1),
('D-1003', 'U-D1', 'Green Leaf Kitchen', 'Mixed Seasonal Produce', 'C3', 'Excess vegetables from the morning market delivery.', 18, 'kg', '2026-09-01 08:00:00', '2026-09-01 22:00:00', 'House 12, Road 5, Dhanmondi, Dhaka', '+880 1711-000111', NULL, 'expired', '2026-09-01 08:10:00', 0),
('D-1004', 'U-D1', 'Green Leaf Kitchen', 'Bread & Bakery Assortment', 'C4', 'End-of-day unsold bread and pastries, still fresh.', 24, 'pieces', '2026-09-02 18:00:00', '2026-09-03 08:00:00', 'House 12, Road 5, Dhanmondi, Dhaka', '+880 1711-000111', NULL, 'delivered', '2026-08-31 18:10:00', 3);

INSERT INTO Request (requestId, donationId, recipientId, recipientName, requestedQuantity, peopleToServe, notes, status, createdAt) VALUES
('RQ-1', 'D-1001', 'U-R1', 'Hope Shelter Trust', 6, 25, 'Serving evening meal at our shelter.', 'pending', '2026-09-02 11:00:00'),
('RQ-2', 'D-1004', 'U-R1', 'Hope Shelter Trust', 24, 20, 'Breakfast for residents.', 'accepted', '2026-08-31 19:00:00'),
('RQ-3', 'D-1002', 'U-R1', 'Hope Shelter Trust', 10, 10, 'Could pick up same afternoon.', 'rejected', '2026-09-02 09:45:00');

INSERT INTO PickupAssignment (assignmentId, requestId, donationId, volunteerId, donorName, recipientName, pickupAddress, deliveryAddress, pickupTime, deliveryTime, status) VALUES
('PA-1', 'RQ-2', 'D-1004', 'U-V1', 'Green Leaf Kitchen', 'Hope Shelter Trust', 'House 12, Road 5, Dhanmondi, Dhaka', '45 Mirpur Road, Dhaka', '2026-08-31 19:30:00', '2026-08-31 20:15:00', 'delivered');

INSERT INTO Notification (notificationId, userId, message, isRead, createdAt) VALUES
('N-1', 'U-D1', 'Your donation "Vegetable Biryani Trays" received a new request.', 0, '2026-09-02 11:00:00'),
('N-2', 'U-R1', 'Your request for "Bread & Bakery Assortment" was accepted.', 1, '2026-08-31 19:05:00'),
('N-3', 'U-V1', 'You have been assigned a new pickup.', 1, '2026-08-31 19:10:00'),
('N-4', 'U-D1', '"Mixed Seasonal Produce" expired without being claimed.', 0, '2026-09-01 22:05:00'),
('N-5', 'U-R1', 'Your request for "Vegetable Biryani Trays" is awaiting donor review.', 0, '2026-09-02 11:00:00'),
('N-6', 'U-R1', 'Your request for "Packaged Sandwiches" was declined by the donor.', 1, '2026-09-02 10:00:00');

INSERT INTO Feedback (feedbackId, donationId, fromUserId, toUserId, rating, review, createdAt) VALUES
('F-1', 'D-1004', 'U-R1', 'U-D1', 5, 'Well packed and right on time. Thank you!', '2026-08-31 21:00:00');

INSERT INTO WasteLog (wasteLogId, donationId, categoryId, quantity, unit, reason, expiresAt, loggedAt) VALUES
('W-1', 'D-1003', 'C3', 18, 'kg', 'No requests before expiry', '2026-09-01 22:00:00', '2026-09-01 22:05:00');

INSERT INTO AuditLog (logId, timestamp, userName, action, entity, description) VALUES
('AL-1', '2026-09-02 11:00:00', 'Karim Hasan', 'Submitted request', 'Request RQ-1', 'Requested 6 trays from "Vegetable Biryani Trays".'),
('AL-2', '2026-09-01 22:05:00', 'System', 'Logged waste', 'Donation D-1003', '"Mixed Seasonal Produce" expired unclaimed and was logged as waste.'),
('AL-3', '2026-08-31 19:05:00', 'Amina Rahman', 'Accepted request', 'Request RQ-2', 'Accepted Hope Shelter Trust\'s request for "Bread & Bakery Assortment".');
