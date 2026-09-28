USE food_waste_management;

-- Extra mock dataset for 10 users and their interaction flow
-- This script adds additional users, donations, requests, assignments,
-- notifications, feedback, waste logs, and audit entries.

INSERT IGNORE INTO FoodCategory (categoryId, name) VALUES
('C5', 'Rice & Grains'),
('C6', 'Fruits'),
('C7', 'Soups & Stews'),
('C8', 'Snacks');

INSERT IGNORE INTO AppUser (userId, role, name, email, password_hash, phone, donor_type, recipient_type, organization_name, address, vehicle_type, availability, status, created_at) VALUES
('U-D2', 'donor', 'Nadia Hossain', 'donor2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1711-333222', 'Hotel', NULL, 'Nadia Catering', 'Bashundhara, Dhaka', NULL, NULL, 'active', '2026-08-10 08:20:00'),
('U-D3', 'donor', 'Farhan Iqbal', 'donor3@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1722-442111', 'Bakery', NULL, 'Fresh Oven', 'Uttara, Dhaka', NULL, NULL, 'active', '2026-08-18 09:45:00'),
('U-D4', 'donor', 'Mehnaz Akter', 'donor4@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1812-983444', 'School Canteen', NULL, 'Lakeside Academy', 'Motijheel, Dhaka', NULL, NULL, 'active', '2026-08-25 12:10:00'),
('U-R2', 'recipient', 'Ibrahim Khalil', 'recipient2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1911-778900', NULL, 'Community Kitchen', 'Rooftop Nutrition Hub', 'Shyamoli, Dhaka', NULL, NULL, 'active', '2026-08-12 10:00:00'),
('U-R3', 'recipient', 'Shahida Begum', 'recipient3@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1601-101010', NULL, 'Family Support', 'Amin Family Center', 'Dhanmondi, Dhaka', NULL, NULL, 'active', '2026-08-16 11:50:00'),
('U-R4', 'recipient', 'Rafiul Islam', 'recipient4@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1744-555100', NULL, 'School Program', 'Urban Youth Relief', 'Khilgaon, Dhaka', NULL, NULL, 'active', '2026-08-22 07:40:00'),
('U-R5', 'recipient', 'Mariam Noor', 'recipient5@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1888-221144', NULL, 'Clinic Support', 'Care Bridge', 'Old Dhaka, Dhaka', NULL, NULL, 'active', '2026-08-30 15:30:00'),
('U-V2', 'volunteer', 'Samiul Haque', 'volunteer2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1955-321789', NULL, NULL, NULL, 'Gulshan, Dhaka', 'Cycle', 'Weekdays after 4 PM', 'active', '2026-09-01 08:00:00'),
('U-V3', 'volunteer', 'Zarin Tasnim', 'volunteer3@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1700-609090', NULL, NULL, NULL, 'Jatrabari, Dhaka', 'Scooter', 'Morning shifts', 'active', '2026-09-03 10:15:00'),
('U-A2', 'admin', 'Operations Manager', 'admin2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '+880 1677-543210', NULL, NULL, NULL, 'Sufra HQ, Dhaka', NULL, NULL, 'active', '2026-08-01 09:00:00');

INSERT IGNORE INTO FoodDonation (
    donationId, donorId, donorName, title, categoryId, description, quantity, unit,
    preparedAt, expiresAt, pickupAddress, contact, notes, status, createdAt, requestCount
) VALUES
('D-2001', 'U-D2', 'Nadia Catering', 'Rice & Lentil Packets', 'C5', 'Ready-to-serve rice and lentil packets for low-income families.', 20, 'packs', '2026-09-10 09:00:00', '2026-09-11 18:00:00', 'Bashundhara, Dhaka', '+880 1711-333222', 'Please keep the bags sealed.', 'available', '2026-09-10 08:30:00', 1),
('D-2002', 'U-D3', 'Fresh Oven', 'Fruit Box', 'C6', 'Fresh seasonal fruits from the bakery delivery route.', 14, 'boxes', '2026-09-11 07:00:00', '2026-09-12 12:00:00', 'Uttara, Dhaka', '+880 1722-442111', 'Best before noon.', 'claimed', '2026-09-11 07:20:00', 1),
('D-2003', 'U-D4', 'Lakeside Academy', 'Lunchbox Mix', 'C7', 'Soup and stew portions from the school kitchen.', 18, 'servings', '2026-09-09 12:00:00', '2026-09-10 16:00:00', 'Motijheel, Dhaka', '+880 1812-983444', 'Healthy and easy to distribute.', 'delivered', '2026-09-09 12:15:00', 1),
('D-2004', 'U-D2', 'Nadia Catering', 'Snack Donation', 'C8', 'Packaged snacks from a local event.', 40, 'packs', '2026-09-12 18:00:00', '2026-09-13 20:00:00', 'Bashundhara, Dhaka', '+880 1711-333222', 'Please collect before evening.', 'pending', '2026-09-12 18:10:00', 1),
('D-2005', 'U-D3', 'Fresh Oven', 'Unsold Pastry Box', 'C8', 'Bakery leftovers that still have a few hours before expiry.', 12, 'boxes', '2026-09-10 18:00:00', '2026-09-11 08:00:00', 'Uttara, Dhaka', '+880 1722-442111', 'Needs quick collection.', 'expired', '2026-09-10 18:20:00', 0);

INSERT IGNORE INTO Request (requestId, donationId, recipientId, recipientName, requestedQuantity, peopleToServe, notes, status, createdAt) VALUES
('RQ-4', 'D-2001', 'U-R2', 'Rooftop Nutrition Hub', 8, 30, 'Prepare meal boxes for evening distribution.', 'accepted', '2026-09-10 09:30:00'),
('RQ-5', 'D-2002', 'U-R3', 'Amin Family Center', 6, 20, 'Fresh fruit for the children’s program.', 'accepted', '2026-09-11 07:45:00'),
('RQ-6', 'D-2004', 'U-R4', 'Urban Youth Relief', 12, 15, 'Need packaged snacks for after-school activities.', 'pending', '2026-09-12 18:50:00'),
('RQ-7', 'D-2005', 'U-R5', 'Care Bridge', 6, 12, 'Can collect immediately if available.', 'rejected', '2026-09-10 18:45:00');

INSERT IGNORE INTO PickupAssignment (
    assignmentId, requestId, donationId, volunteerId, donorName, recipientName,
    pickupAddress, deliveryAddress, pickupTime, deliveryTime, status
) VALUES
('PA-2', 'RQ-4', 'D-2001', 'U-V2', 'Nadia Catering', 'Rooftop Nutrition Hub', 'Bashundhara, Dhaka', 'Shyamoli, Dhaka', '2026-09-10 10:30:00', '2026-09-10 11:20:00', 'picked_up'),
('PA-3', 'RQ-5', 'D-2002', 'U-V3', 'Fresh Oven', 'Amin Family Center', 'Uttara, Dhaka', 'Dhanmondi, Dhaka', '2026-09-11 08:10:00', '2026-09-11 08:50:00', 'delivered');

INSERT IGNORE INTO Notification (notificationId, userId, message, isRead, createdAt) VALUES
('N-7', 'U-D2', 'Your donation "Rice & Lentil Packets" has a confirmed request.', 0, '2026-09-10 09:35:00'),
('N-8', 'U-R2', 'Your request for "Rice & Lentil Packets" was accepted.', 1, '2026-09-10 09:40:00'),
('N-9', 'U-V2', 'Pickup assignment for "Rice & Lentil Packets" is ready.', 0, '2026-09-10 10:00:00'),
('N-10', 'U-D3', 'Your fruit donation was picked up and delivered.', 1, '2026-09-11 09:00:00'),
('N-11', 'U-R5', 'Your request for "Unsold Pastry Box" was not approved.', 1, '2026-09-10 18:50:00'),
('N-12', 'U-A2', 'New donor activity detected for extra mock dataset.', 0, '2026-09-12 18:15:00');

INSERT IGNORE INTO Feedback (feedbackId, donationId, fromUserId, toUserId, rating, review, createdAt) VALUES
('F-2', 'D-2003', 'U-R2', 'U-D4', 5, 'The lunchbox mix arrived on time and was very useful for our group.', '2026-09-09 17:00:00'),
('F-3', 'D-2002', 'U-R3', 'U-D3', 4, 'Fresh fruits and a smooth pickup experience. Thank you!', '2026-09-11 09:10:00'),
('F-4', 'D-2001', 'U-R2', 'U-D2', 5, 'Packaging was neat and the food was distributed quickly.', '2026-09-10 12:00:00');

INSERT IGNORE INTO WasteLog (wasteLogId, donationId, categoryId, quantity, unit, reason, expiresAt, loggedAt) VALUES
('W-2', 'D-2005', 'C8', 12, 'boxes', 'No remaining requests before expiry window ended.', '2026-09-11 08:00:00', '2026-09-11 08:10:00');

INSERT IGNORE INTO AuditLog (logId, timestamp, userName, action, entity, description) VALUES
('AL-4', '2026-09-10 09:35:00', 'Rooftop Nutrition Hub', 'Submitted request', 'Request RQ-4', 'Raised a request for Rice & Lentil Packets.'),
('AL-5', '2026-09-10 10:30:00', 'Samiul Haque', 'Pickup started', 'Assignment PA-2', 'Volunteer started the pickup route for a donation delivery.'),
('AL-6', '2026-09-11 08:50:00', 'Zarin Tasnim', 'Delivered donation', 'Assignment PA-3', 'Fruit box delivered to Amin Family Center.'),
('AL-7', '2026-09-11 08:10:00', 'System', 'Logged waste', 'Donation D-2005', 'Expired pastry box logged as waste due to no requests.' );

SELECT 'Extra mock dataset inserted successfully.' AS status;
