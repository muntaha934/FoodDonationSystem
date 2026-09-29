<?php
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $pdo = getDb();
    $sql = 'SELECT * FROM Request';
    $params = [];

    if (!empty($_GET['donationId'])) {
        $sql .= ' WHERE donationId = :donationId';
        $params[':donationId'] = $_GET['donationId'];
    }
    if (!empty($_GET['recipientId'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'recipientId = :recipientId';
        $params[':recipientId'] = $_GET['recipientId'];
    }
    if (!empty($_GET['status'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'status = :status';
        $params[':status'] = $_GET['status'];
    }

    $sql .= ' ORDER BY createdAt DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    jsonResponse(array_map('normalizeRequestRow', $rows), 200);
}

if ($method === 'POST') {
    $user = requireAuth();
    $data = readJsonBody();

    foreach (['donationId', 'recipientId', 'recipientName', 'requestedQuantity', 'peopleToServe'] as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            jsonResponse(['message' => "Field '{$field}' is required."], 400);
        }
    }

    $pdo = getDb();
    $recipientUserId = resolveUserId($pdo, $data['recipientId'] ?? $user['userId'] ?? null);
    $donationIdInt = resolveDonationId($pdo, $data['donationId']);
    if ($recipientUserId === null || $donationIdInt === null) {
        jsonResponse(['message' => 'Valid recipient and donation are required.'], 400);
    }

    $recipientUser = $pdo->prepare('SELECT * FROM AppUser WHERE user_id = :id LIMIT 1');
    $recipientUser->execute([':id' => $recipientUserId]);
    $recipientRow = $recipientUser->fetch();
    $requestId = generateNextId($pdo, 'Request', 'RQ', 'requestId');
    $stmt = $pdo->prepare('INSERT INTO Request (requestId, donation_id, recipient_id, recipientId, recipientName, requested_qty, requestedQuantity, peopleToServe, notes, status, createdAt) VALUES (:requestId, :donation_id, :recipient_id, :recipientId, :recipientName, :requested_qty, :requestedQuantity, :peopleToServe, :notes, :status, :createdAt)');
    $stmt->execute([
        ':requestId' => $requestId,
        ':donation_id' => $donationIdInt,
        ':recipient_id' => $recipientUserId,
        ':recipientId' => $data['recipientId'] ?? $user['userId'] ?? 'U-' . $recipientUserId,
        ':recipientName' => $recipientRow['name'] ?? $data['recipientName'] ?? 'Unknown recipient',
        ':requested_qty' => (float) $data['requestedQuantity'],
        ':requestedQuantity' => (float) $data['requestedQuantity'],
        ':peopleToServe' => (int) $data['peopleToServe'],
        ':notes' => $data['notes'] ?? '',
        ':status' => 'pending',
        ':createdAt' => date('Y-m-d\TH:i:s'),
    ]);

    $donationStmt = $pdo->prepare('UPDATE FoodDonation SET requestCount = requestCount + 1 WHERE donation_id = :id OR donationId = :legacy');
    $donationStmt->execute([':id' => $donationIdInt, ':legacy' => $data['donationId']]);

    $donationRow = $pdo->prepare('SELECT * FROM FoodDonation WHERE donation_id = :id OR donationId = :legacy LIMIT 1');
    $donationRow->execute([':id' => $donationIdInt, ':legacy' => $data['donationId']]);
    $donation = $donationRow->fetch();
    if ($donation) {
        $donorId = $donation['donor_id'] ?? resolveUserId($pdo, $donation['donorId'] ?? null);
        if ($donorId) {
            createNotification($pdo, 'U-' . $donorId, 'A recipient submitted a new request for "' . ($donation['title'] ?? $data['donationId']) . '".');
        }
    }

    $created = $pdo->prepare('SELECT request_id AS requestId, donation_id AS donationId, recipient_id AS recipientId, recipientId AS legacyRecipientId, recipientName, requested_qty AS requestedQuantity, peopleToServe, notes, status, created_at AS createdAt FROM Request WHERE requestId = :id LIMIT 1');
    $created->execute([':id' => $requestId]);
    jsonResponse(normalizeRequestRow($created->fetch()), 201);
}

if ($method === 'PATCH') {
    $user = requireAuth();
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    if (!$id || !$status) {
        jsonResponse(['message' => 'Request id and status are required.'], 400);
    }

    $pdo = getDb();
    $request = $pdo->prepare('SELECT * FROM Request WHERE requestId = :id LIMIT 1');
    $request->execute([':id' => $id]);
    $row = $request->fetch();
    if (!$row) {
        jsonResponse(['message' => 'Request not found.'], 404);
    }

    $stmt = $pdo->prepare('UPDATE Request SET status = :status WHERE requestId = :id');
    $stmt->execute([':status' => $status, ':id' => $id]);

    if ($status === 'accepted') {
        $donationStmt = $pdo->prepare('UPDATE FoodDonation SET status = :status WHERE donationId = :donationId');
        $donationStmt->execute([':status' => 'claimed', ':donationId' => $row['donationId']]);
        createNotification($pdo, $row['recipientId'], 'Your request for "' . $row['donationId'] . '" was accepted.');
    }

    $updated = $pdo->prepare('SELECT * FROM Request WHERE requestId = :id LIMIT 1');
    $updated->execute([':id' => $id]);
    jsonResponse(normalizeRequestRow($updated->fetch()), 200);
}

jsonResponse(['message' => 'Method not allowed.'], 405);
