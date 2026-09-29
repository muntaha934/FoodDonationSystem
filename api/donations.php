<?php
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $pdo = getDb();
    $sql = 'SELECT * FROM FoodDonation';
    $params = [];

    if (!empty($_GET['donorId'])) {
        $sql .= ' WHERE donorId = :donorId';
        $params[':donorId'] = $_GET['donorId'];
    }
    if (!empty($_GET['status'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'status = :status';
        $params[':status'] = $_GET['status'];
    }
    if (!empty($_GET['categoryId'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'categoryId = :categoryId';
        $params[':categoryId'] = $_GET['categoryId'];
    }
    if (!empty($_GET['id'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'donationId = :id';
        $params[':id'] = $_GET['id'];
    }

    $sql .= ' ORDER BY createdAt DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    jsonResponse(array_map('normalizeDonationRow', $rows), 200);
}

if ($method === 'POST') {
    $user = requireAuth();
    $data = readJsonBody();

    $missing = ['donorId', 'title', 'categoryId', 'quantity', 'unit', 'preparedAt', 'expiresAt', 'pickupAddress', 'contact'];
    foreach ($missing as $field) {
        if (empty($data[$field])) {
            jsonResponse(['message' => "Field '{$field}' is required."], 400);
        }
    }

    $pdo = getDb();
    $donorUserId = resolveUserId($pdo, $data['donorId'] ?? $user['userId'] ?? null) ?? (int) ($user['user_id'] ?? 0);
    $categoryId = resolveCategoryId($pdo, $data['categoryId']);

    if ($donorUserId === null || $donorUserId === 0) {
        jsonResponse(['message' => 'Valid donor not found.'], 400);
    }

    $donorUser = $pdo->prepare('SELECT * FROM AppUser WHERE user_id = :id LIMIT 1');
    $donorUser->execute([':id' => $donorUserId]);
    $donorRow = $donorUser->fetch();
    if (!$donorRow) {
        jsonResponse(['message' => 'Donor user not found.'], 400);
    }

    $donationId = generateNextId($pdo, 'FoodDonation', 'D', 'donationId');
    $stmt = $pdo->prepare('INSERT INTO FoodDonation (
        donationId, donor_id, donorId, donorName, title, category_id, categoryId, description, quantity, unit, preparedAt, expiresAt,
        pickupAddress, contact, notes, status, createdAt, requestCount
    ) VALUES (
        :donationId, :donor_id, :donorId, :donorName, :title, :category_id, :categoryId, :description, :quantity, :unit,
        :preparedAt, :expiresAt, :pickupAddress, :contact, :notes, :status, :createdAt, :requestCount
    )');

    $donorName = $donorRow['name'] ?? $data['donorName'] ?? 'Unknown donor';
    $stmt->execute([
        ':donationId' => $donationId,
        ':donor_id' => $donorUserId,
        ':donorId' => $data['donorId'] ?? $user['userId'] ?? 'U-' . $donorUserId,
        ':donorName' => $donorName,
        ':title' => $data['title'],
        ':category_id' => $categoryId,
        ':categoryId' => $data['categoryId'],
        ':description' => $data['description'] ?? '',
        ':quantity' => (float) $data['quantity'],
        ':unit' => $data['unit'],
        ':preparedAt' => $data['preparedAt'],
        ':expiresAt' => $data['expiresAt'],
        ':pickupAddress' => $data['pickupAddress'],
        ':contact' => $data['contact'],
        ':notes' => $data['notes'] ?? '',
        ':status' => 'available',
        ':createdAt' => date('Y-m-d\TH:i:s'),
        ':requestCount' => 0,
    ]);

    $created = $pdo->prepare('SELECT * FROM FoodDonation WHERE donationId = :id LIMIT 1');
    $created->execute([':id' => $donationId]);
    $row = $created->fetch();
    jsonResponse(normalizeDonationRow($row), 201);
}

if ($method === 'PATCH') {
    $user = requireAuth();
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    if (!$id || !$status) {
        jsonResponse(['message' => 'Donation id and status are required.'], 400);
    }

    $pdo = getDb();
    $stmt = $pdo->prepare('UPDATE FoodDonation SET status = :status WHERE donationId = :id');
    $stmt->execute([':status' => $status, ':id' => $id]);

    $updated = $pdo->prepare('SELECT * FROM FoodDonation WHERE donationId = :id LIMIT 1');
    $updated->execute([':id' => $id]);
    $row = $updated->fetch();
    jsonResponse(normalizeDonationRow($row), 200);
}

jsonResponse(['message' => 'Method not allowed.'], 405);
