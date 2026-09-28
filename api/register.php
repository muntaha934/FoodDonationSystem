<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

$data = readJsonBody();
$name = trim((string) ($data['name'] ?? ''));
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');
$role = strtolower(trim((string) ($data['role'] ?? '')));

if ($name === '' || $email === '' || $password === '' || $role === '') {
    jsonResponse(['message' => 'Name, email, password, and role are required.'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT userId FROM AppUser WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
if ($stmt->fetch()) {
    jsonResponse(['message' => 'A user with this email already exists.'], 409);
}

if (!in_array($role, ['donor', 'recipient', 'volunteer', 'admin'], true)) {
    jsonResponse(['message' => 'Unsupported role.'], 400);
}

$userId = generateNextId($pdo, 'AppUser', 'U', 'userId');
$phone = trim((string) ($data['phone'] ?? ''));
$address = trim((string) ($data['address'] ?? ''));
$donorType = trim((string) ($data['donorType'] ?? ''));
$recipientType = trim((string) ($data['recipientType'] ?? ''));
$organizationName = trim((string) ($data['organizationName'] ?? ''));
$vehicleType = trim((string) ($data['vehicleType'] ?? ''));
$availability = trim((string) ($data['availability'] ?? ''));
$createdAt = date('Y-m-d\TH:i:s');

$stmt = $pdo->prepare('INSERT INTO AppUser (
    userId, role, name, email, password_hash, phone, donor_type, recipient_type,
    organization_name, address, vehicle_type, availability, status, created_at
) VALUES (
    :userId, :role, :name, :email, :password_hash, :phone, :donor_type,
    :recipient_type, :organization_name, :address, :vehicle_type, :availability,
    :status, :created_at
)');

$stmt->execute([
    ':userId' => $userId,
    ':role' => $role,
    ':name' => $name,
    ':email' => $email,
    ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ':phone' => $phone,
    ':donor_type' => $donorType,
    ':recipient_type' => $recipientType,
    ':organization_name' => $organizationName,
    ':address' => $address,
    ':vehicle_type' => $vehicleType,
    ':availability' => $availability,
    ':status' => 'active',
    ':created_at' => $createdAt,
]);

$created = $pdo->prepare('SELECT * FROM AppUser WHERE userId = :id LIMIT 1');
$created->execute([':id' => $userId]);
$user = $created->fetch();

jsonResponse(normalizeUserRow($user), 201);
