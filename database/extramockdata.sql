USE food_waste_management;

-- ---------------------------------------------------------------------
-- Extra mock dataset: 20 users and their interaction flow
-- Includes realistic donor, recipient, volunteer, admin, donation,
-- request, assignment, notification, feedback, waste log, and audit log data.
-- ---------------------------------------------------------------------

INSERT IGNORE INTO FoodCategory (category_name, categoryId) VALUES
('Rice & Grains', 'CAT-01'),
('Fruits', 'CAT-02'),
('Cooked Meals', 'CAT-03'),
('Bakery', 'CAT-04'),
('Vegetables', 'CAT-05'),
('Soups & Stews', 'CAT-06'),
('Snacks', 'CAT-07'),
('Family Packs', 'CAT-08');

-- 20 users: 6 donors, 8 recipients, 4 volunteers, 2 admins
INSERT IGNORE INTO AppUser (
    user_id, name, email, password, password_hash, role, phone,
    donor_type, recipient_type, organization_name, address,
    vehicle_type, availability, status, created_at,
    userId, userIdLegacy
) VALUES
(1, 'Nadia Hossain', 'donor1@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'donor', '+8801711333222', 'restaurant', NULL, 'Nadia Catering', 'Bashundhara, Dhaka', NULL, NULL, 'active', '2026-08-10 08:20:00', 'U-001', 'U-D1'),
(2, 'Farhan Iqbal', 'donor2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'donor', '+8801722442111', 'bakery', NULL, 'Fresh Oven', 'Uttara, Dhaka', NULL, NULL, 'active', '2026-08-18 09:45:00', 'U-002', 'U-D2'),
(3, 'Mehnaz Akter', 'donor3@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'donor', '+8801812983444', 'school_canteen', NULL, 'Lakeside Academy', 'Motijheel, Dhaka', NULL, NULL, 'active', '2026-08-25 12:10:00', 'U-003', 'U-D3'),
(4, 'Rashedul Alam', 'donor4@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'donor', '+8801716554098', 'grocery', NULL, 'Green Basket', 'Dhanmondi, Dhaka', NULL, NULL, 'active', '2026-08-27 10:55:00', 'U-004', 'U-D4'),
(5, 'Tania Rahman', 'donor5@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'donor', '+8801888223344', 'event', NULL, 'Royal Banquet Hall', 'Gulshan, Dhaka', NULL, NULL, 'active', '2026-09-01 14:10:00', 'U-005', 'U-D5'),
(6, 'Aminul Karim', 'donor6@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'donor', '+8801600123456', 'individual', NULL, 'Amin Foods', 'Mirpur, Dhaka', NULL, NULL, 'active', '2026-09-04 09:20:00', 'U-006', 'U-D6'),
(7, 'Ibrahim Khalil', 'recipient1@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801911778900', NULL, 'community_kitchen', 'Rooftop Nutrition Hub', 'Shyamoli, Dhaka', NULL, NULL, 'active', '2026-08-12 10:00:00', 'U-007', 'U-R1'),
(8, 'Shahida Begum', 'recipient2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801601101010', NULL, 'family_support', 'Amin Family Center', 'Dhanmondi, Dhaka', NULL, NULL, 'active', '2026-08-16 11:50:00', 'U-008', 'U-R2'),
(9, 'Rafiul Islam', 'recipient3@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801744555100', NULL, 'school_program', 'Urban Youth Relief', 'Khilgaon, Dhaka', NULL, NULL, 'active', '2026-08-22 07:40:00', 'U-009', 'U-R3'),
(10, 'Mariam Noor', 'recipient4@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801888221144', NULL, 'clinic_support', 'Care Bridge', 'Old Dhaka, Dhaka', NULL, NULL, 'active', '2026-08-30 15:30:00', 'U-010', 'U-R4'),
(11, 'Sajjad Hossain', 'recipient5@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801765439001', NULL, 'women_support', 'Hope House', 'Rampura, Dhaka', NULL, NULL, 'active', '2026-09-02 08:15:00', 'U-011', 'U-R5'),
(12, 'Nusrat Jahan', 'recipient6@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801710854321', NULL, 'community_center', 'Bashundhara Community Center', 'Bashundhara, Dhaka', NULL, NULL, 'active', '2026-09-03 12:00:00', 'U-012', 'U-R6'),
(13, 'Tawhid Ahmed', 'recipient7@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801700234401', NULL, 'orphanage', 'Noorjahan Orphanage', 'Uttara, Dhaka', NULL, NULL, 'active', '2026-09-05 09:10:00', 'U-013', 'U-R7'),
(14, 'Shammi Akhter', 'recipient8@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'recipient', '+8801611893389', NULL, 'senior_support', 'Silver Care', 'Mohakhali, Dhaka', NULL, NULL, 'active', '2026-09-06 16:45:00', 'U-014', 'U-R8'),
(15, 'Samiul Haque', 'volunteer1@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'volunteer', '+8801955321789', NULL, NULL, NULL, 'Gulshan, Dhaka', 'Cycle', 'Weekdays after 4 PM', 'active', '2026-09-01 08:00:00', 'U-015', 'U-V1'),
(16, 'Zarin Tasnim', 'volunteer2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'volunteer', '+8801700609090', NULL, NULL, NULL, 'Jatrabari, Dhaka', 'Scooter', 'Morning shifts', 'active', '2026-09-03 10:15:00', 'U-016', 'U-V2'),
(17, 'Rimon Ali', 'volunteer3@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'volunteer', '+8801810993344', NULL, NULL, NULL, 'Paltan, Dhaka', 'Motorbike', 'Evenings only', 'active', '2026-09-04 12:20:00', 'U-017', 'U-V3'),
(18, 'Mahiya Islam', 'volunteer4@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'volunteer', '+8801767218811', NULL, NULL, NULL, 'Badda, Dhaka', 'Van', 'Saturday & Sunday', 'active', '2026-09-08 07:00:00', 'U-018', 'U-V4'),
(19, 'Operations Manager', 'admin1@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'admin', '+8801677543210', NULL, NULL, NULL, 'Sufra HQ, Dhaka', NULL, NULL, 'active', '2026-08-01 09:00:00', 'U-019', 'U-A1'),
(20, 'Compliance Officer', 'admin2@extra.com', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', '$2y$10$JF8XQl87md/pphsrjcCgxeUWO1F72rImURDVkrpbOqIGuiZdg5qbW', 'admin', '+8801500102030', NULL, NULL, NULL, 'Sufra HQ, Dhaka', NULL, NULL, 'active', '2026-08-05 11:40:00', 'U-020', 'U-A2');

INSERT IGNORE INTO Donor (donor_id, donor_type, org_name, address_id) VALUES
(1, 'restaurant', 'Nadia Catering', NULL),
(2, 'bakery', 'Fresh Oven', NULL),
(3, 'school_canteen', 'Lakeside Academy', NULL),
(4, 'grocery', 'Green Basket', NULL),
(5, 'event', 'Royal Banquet Hall', NULL),
(6, 'individual', 'Amin Foods', NULL);

INSERT IGNORE INTO Recipient (recipient_id, recipient_type, org_name) VALUES
(7, 'community_kitchen', 'Rooftop Nutrition Hub'),
(8, 'family_support', 'Amin Family Center'),
(9, 'school_program', 'Urban Youth Relief'),
(10, 'clinic_support', 'Care Bridge'),
(11, 'women_support', 'Hope House'),
(12, 'community_center', 'Bashundhara Community Center'),
(13, 'orphanage', 'Noorjahan Orphanage'),
(14, 'senior_support', 'Silver Care');

INSERT IGNORE INTO Volunteer (volunteer_id, vehicle_type, availability) VALUES
(15, 'Cycle', 'available'),
(16, 'Scooter', 'available'),
(17, 'Motorbike', 'busy'),
(18, 'Van', 'available');

INSERT IGNORE INTO Admin (admin_id, permission_level) VALUES
(19, 'super'),
(20, 'moderator');

-- Donation activity for the 20-user dataset
INSERT IGNORE INTO FoodDonation (
    donation_id, donor_id, category_id, title, quantity, unit,
    expiry_time, status, created_at,
    donationId, donorId, donorName, categoryId, description,
    preparedAt, expiresAt, pickupAddress, contact, notes,
    requestCount, createdAt
) VALUES
(101, 1, 1, 'Rice & Lentil Packs', 18.00, 'packs', '2026-09-30 18:00:00', 'available', '2026-09-29 08:00:00', 'D-101', 'U-001', 'Nadia Catering', 'CAT-01', 'Fresh rice and lentil packs prepared for family meals.', '2026-09-29 07:30:00', '2026-09-30 18:00:00', 'Bashundhara, Dhaka', '+8801711333222', 'Pack in separate sealed bags.', 2, '2026-09-29 08:00:00'),
(102, 2, 2, 'Fruit Box', 12.00, 'boxes', '2026-09-30 12:00:00', 'assigned', '2026-09-29 07:00:00', 'D-102', 'U-002', 'Fresh Oven', 'CAT-02', 'Seasonal fruits from the bakery route.', '2026-09-29 06:45:00', '2026-09-30 12:00:00', 'Uttara, Dhaka', '+8801722442111', 'Best collected before noon.', 1, '2026-09-29 07:00:00'),
(103, 3, 5, 'Vegetable Harvest', 25.00, 'boxes', '2026-09-30 20:00:00', 'available', '2026-09-28 18:45:00', 'D-103', 'U-003', 'Lakeside Academy', 'CAT-05', 'Fresh vegetables from the school kitchen surplus.', '2026-09-28 18:15:00', '2026-09-30 20:00:00', 'Motijheel, Dhaka', '+8801812983444', 'Needs quick distribution.', 1, '2026-09-28 18:45:00'),
(104, 4, 4, 'Bakery Leftovers', 14.00, 'boxes', '2026-09-29 20:00:00', 'delivered', '2026-09-29 12:10:00', 'D-104', 'U-004', 'Green Basket', 'CAT-04', 'Fresh pastries and buns from the evening stock.', '2026-09-29 11:55:00', '2026-09-29 20:00:00', 'Dhanmondi, Dhaka', '+8801716554098', 'Please collect before 8 PM.', 2, '2026-09-29 12:10:00'),
(105, 5, 6, 'Soup & Stew Bundle', 30.00, 'servings', '2026-09-29 23:00:00', 'pending', '2026-09-29 14:30:00', 'D-105', 'U-005', 'Royal Banquet Hall', 'CAT-06', 'Large ready-to-serve soup and stew quantities from event leftovers.', '2026-09-29 13:30:00', '2026-09-29 23:00:00', 'Gulshan, Dhaka', '+8801888223344', 'Suitable for community kitchens.', 1, '2026-09-29 14:30:00'),
(106, 6, 3, 'Cooked Meal Trays', 16.00, 'trays', '2026-09-30 17:30:00', 'available', '2026-09-29 09:00:00', 'D-106', 'U-006', 'Amin Foods', 'CAT-03', 'Home-cooked meal trays ready for immediate delivery.', '2026-09-29 08:40:00', '2026-09-30 17:30:00', 'Mirpur, Dhaka', '+8801600123456', 'Can be delivered in batches.', 0, '2026-09-29 09:00:00'),
(107, 1, 7, 'Snack Pack', 40.00, 'packs', '2026-10-01 09:00:00', 'available', '2026-09-29 16:20:00', 'D-107', 'U-001', 'Nadia Catering', 'CAT-07', 'Packaged snack items for school and shelter programs.', '2026-09-29 15:50:00', '2026-10-01 09:00:00', 'Bashundhara, Dhaka', '+8801711333222', 'No refrigeration needed.', 0, '2026-09-29 16:20:00'),
(108, 2, 8, 'Family Meal Pack', 10.00, 'packs', '2026-09-30 21:00:00', 'available', '2026-09-29 17:00:00', 'D-108', 'U-002', 'Fresh Oven', 'CAT-08', 'Ready meal packs prepared for family support groups.', '2026-09-29 16:30:00', '2026-09-30 21:00:00', 'Uttara, Dhaka', '+8801722442111', 'Good for 4-5 people per pack.', 1, '2026-09-29 17:00:00');

-- Request lifecycle for multiple recipient groups
INSERT IGNORE INTO Request (
    request_id, recipient_id, donation_id, requested_qty, status,
    created_at, requestId, recipientId, recipientName,
    requestedQuantity, peopleToServe, notes, createdAt
) VALUES
(201, 7, 101, 8.00, 'approved', '2026-09-29 08:45:00', 'RQ-201', 'U-007', 'Rooftop Nutrition Hub', 8, 30, 'Meal packs for evening distribution.', '2026-09-29 08:45:00'),
(202, 8, 102, 6.00, 'accepted', '2026-09-29 07:20:00', 'RQ-202', 'U-008', 'Amin Family Center', 6, 18, 'Fresh fruits for the family care program.', '2026-09-29 07:20:00'),
(203, 9, 104, 5.00, 'fulfilled', '2026-09-29 12:40:00', 'RQ-203', 'U-009', 'Urban Youth Relief', 5, 12, 'Bakery items for youth activity night.', '2026-09-29 12:40:00'),
(204, 10, 105, 10.00, 'pending', '2026-09-29 15:10:00', 'RQ-204', 'U-010', 'Care Bridge', 10, 24, 'Soup and stew for clinic support sessions.', '2026-09-29 15:10:00'),
(205, 11, 108, 4.00, 'approved', '2026-09-29 17:35:00', 'RQ-205', 'U-011', 'Hope House', 4, 10, 'Family meal packs for women support shelter.', '2026-09-29 17:35:00'),
(206, 12, 103, 10.00, 'pending', '2026-09-29 19:10:00', 'RQ-206', 'U-012', 'Bashundhara Community Center', 10, 20, 'Vegetables for a community kitchen event.', '2026-09-29 19:10:00'),
(207, 13, 106, 6.00, 'rejected', '2026-09-29 09:20:00', 'RQ-207', 'U-013', 'Noorjahan Orphanage', 6, 15, 'Need meals for children before evening.', '2026-09-29 09:20:00'),
(208, 14, 107, 12.00, 'pending', '2026-09-29 16:50:00', 'RQ-208', 'U-014', 'Silver Care', 12, 28, 'Snack packs for senior community support.', '2026-09-29 16:50:00');

-- Volunteer pickup activity
INSERT IGNORE INTO PickupAssignment (
    assignment_id, volunteer_id, request_id, pickup_time,
    delivery_time, status, assignmentId, donationId,
    volunteerId, donorName, recipientName, pickupAddress,
    deliveryAddress, pickupTime, deliveryTime
) VALUES
(301, 15, 201, '2026-09-29 09:40:00', '2026-09-29 10:25:00', 'delivered', 'PA-301', 'D-101', 'U-015', 'Nadia Catering', 'Rooftop Nutrition Hub', 'Bashundhara, Dhaka', 'Shyamoli, Dhaka', '2026-09-29 09:40:00', '2026-09-29 10:25:00'),
(302, 16, 202, '2026-09-29 07:50:00', '2026-09-29 08:25:00', 'picked_up', 'PA-302', 'D-102', 'U-016', 'Fresh Oven', 'Amin Family Center', 'Uttara, Dhaka', 'Dhanmondi, Dhaka', '2026-09-29 07:50:00', '2026-09-29 08:25:00'),
(303, 17, 203, '2026-09-29 13:10:00', '2026-09-29 13:55:00', 'delivered', 'PA-303', 'D-104', 'U-017', 'Green Basket', 'Urban Youth Relief', 'Dhanmondi, Dhaka', 'Khilgaon, Dhaka', '2026-09-29 13:10:00', '2026-09-29 13:55:00'),
(304, 18, 205, '2026-09-29 18:05:00', NULL, 'assigned', 'PA-304', 'D-108', 'U-018', 'Fresh Oven', 'Hope House', 'Uttara, Dhaka', 'Rampura, Dhaka', '2026-09-29 18:05:00', NULL);

-- Notifications generated by donor/request activity
INSERT IGNORE INTO Notification (
    notification_id, user_id, donation_id, message, is_read,
    created_at, notificationId, userId, isRead, createdAt
) VALUES
(401, 1, 101, 'Your donation "Rice & Lentil Packs" has a confirmed request.', 0, '2026-09-29 08:50:00', 'N-401', 'U-001', 0, '2026-09-29 08:50:00'),
(402, 7, 101, 'Your request for "Rice & Lentil Packs" was approved.', 1, '2026-09-29 08:55:00', 'N-402', 'U-007', 1, '2026-09-29 08:55:00'),
(403, 15, 101, 'Pickup assignment for "Rice & Lentil Packs" is ready.', 0, '2026-09-29 09:15:00', 'N-403', 'U-015', 0, '2026-09-29 09:15:00'),
(404, 2, 102, 'Fruit donation is in transit to the recipient.', 0, '2026-09-29 07:55:00', 'N-404', 'U-002', 0, '2026-09-29 07:55:00'),
(405, 14, 107, 'New snack request is waiting for approval.', 0, '2026-09-29 16:55:00', 'N-405', 'U-014', 0, '2026-09-29 16:55:00'),
(406, 19, 105, 'A donor submitted a large meal surplus for review.', 0, '2026-09-29 15:20:00', 'N-406', 'U-019', 0, '2026-09-29 15:20:00');

-- Feedback and ratings from interactions
INSERT IGNORE INTO Feedback (
    feedback_id, user_id, donation_id, request_id, rating, comments,
    volunteer_id, volunteer_rating, volunteer_comments, created_at,
    feedbackId, fromUserId, toUserId, review, createdAt
) VALUES
(501, 7, 101, 201, 5, 'Very organized and quick response. The food was fresh.', 15, 5, 'Pickup was smooth and on time.', '2026-09-29 10:40:00', 'F-501', 'U-007', 'U-001', 'The food was fresh and well packed.', '2026-09-29 10:40:00'),
(502, 8, 102, 202, 4, 'The fruits were good quality and arrived before lunchtime.', 16, 4, 'Volunteer reached the location on time.', '2026-09-29 08:35:00', 'F-502', 'U-008', 'U-002', 'Fresh fruit and proper timing.', '2026-09-29 08:35:00'),
(503, 9, 104, 203, 5, 'The bakery donation helped extend our youth event food plan.', 17, 5, 'Volunteer was helpful and polite.', '2026-09-29 14:10:00', 'F-503', 'U-009', 'U-004', 'Excellent support and quick delivery.', '2026-09-29 14:10:00'),
(504, 11, 108, 205, 5, 'The family meal pack was perfect for our shelter dinner.', 18, 4, 'Pickup coordination was clear.', '2026-09-29 18:30:00', 'F-504', 'U-011', 'U-002', 'Helpful and reliable support.', '2026-09-29 18:30:00'),
(505, 14, 107, 208, 4, 'Snack packs were useful for our community support drive.', NULL, NULL, NULL, '2026-09-29 17:20:00', 'F-505', 'U-014', 'U-001', 'Good quality and easy to distribute.', '2026-09-29 17:20:00');

-- Waste tracking
INSERT IGNORE INTO WasteLog (waste_id, donation_id, quantity_wasted, reason, logged_at) VALUES
(601, 105, 8.00, 'Event leftovers exceeded partner demand before the deadline.', '2026-09-29 15:30:00'),
(602, 106, 3.00, 'Some meal trays were not claimed before expiry window ended.', '2026-09-29 18:15:00');

-- Audit trail for major actions
INSERT IGNORE INTO AuditLog (
    log_id, user_id, action_type, target_table, target_id,
    action_time, logId, timestamp, userName, action, entity, description
) VALUES
(701, 19, 'request_review', 'Request', 201, '2026-09-29 08:50:00', 'AL-701', '2026-09-29 08:50:00', 'Operations Manager', 'Reviewed request', 'Request #201', 'Reviewed a community meal request for approval.'),
(702, 15, 'pickup_started', 'PickupAssignment', 301, '2026-09-29 09:40:00', 'AL-702', '2026-09-29 09:40:00', 'Samiul Haque', 'Pickup started', 'Assignment #301', 'Volunteer started the donation pickup route.'),
(703, 16, 'pickup_in_transit', 'PickupAssignment', 302, '2026-09-29 07:55:00', 'AL-703', '2026-09-29 07:55:00', 'Zarin Tasnim', 'Pickup in progress', 'Assignment #302', 'Donation was collected and is being delivered.'),
(704, 20, 'waste_logged', 'WasteLog', 601, '2026-09-29 15:35:00', 'AL-704', '2026-09-29 15:35:00', 'Compliance Officer', 'Logged waste', 'WasteLog #601', 'Event leftovers were marked as waste after not being collected.'),
(705, 19, 'feedback_reviewed', 'Feedback', 501, '2026-09-29 10:50:00', 'AL-705', '2026-09-29 10:50:00', 'Operations Manager', 'Reviewed feedback', 'Feedback #501', 'Positive feedback was recorded from a recipient.' );

SELECT 'Extra mock dataset for 20 users inserted successfully.' AS status;