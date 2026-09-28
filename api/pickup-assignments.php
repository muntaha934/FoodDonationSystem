<?php
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $pdo = getDb();
    $sql = 'SELECT * FROM PickupAssignment';
    $params = [];

    if (!empty($_GET['volunteerId'])) {
        $sql .= ' WHERE volunteerId = :volunteerId';
        $params[':volunteerId'] = $_GET['volunteerId'];
    }
    if (!empty($_GET['status'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'status = :status';
        $params[':status'] = $_GET['status'];
    }
    if (!empty($_GET['id'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'assignmentId = :id';
        $params[':id'] = $_GET['id'];
    }

    $stmt = $pdo->prepare($sql . ' ORDER BY assignmentId DESC');
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll(), 200);
}

if ($method === 'POST') {
    $user = requireAuth();
    $data = readJsonBody();
    foreach (['requestId', 'donationId', 'volunteerId', 'donorName', 'recipientName', 'pickupAddress', 'deliveryAddress'] as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            jsonResponse(['message' => "Field '{$field}' is required."], 400);
        }
    }

    $pdo = getDb();
    $assignmentId = generateNextId($pdo, 'PickupAssignment', 'PA', 'assignmentId');
    $stmt = $pdo->prepare('INSERT INTO PickupAssignment (assignmentId, requestId, donationId, volunteerId, donorName, recipientName, pickupAddress, deliveryAddress, pickupTime, deliveryTime, status) VALUES (:id, :requestId, :donationId, :volunteerId, :donorName, :recipientName, :pickupAddress, :deliveryAddress, :pickupTime, :deliveryTime, :status)');
    $stmt->execute([
        ':id' => $assignmentId,
        ':requestId' => $data['requestId'],
        ':donationId' => $data['donationId'],
        ':volunteerId' => $data['volunteerId'],
        ':donorName' => $data['donorName'],
        ':recipientName' => $data['recipientName'],
        ':pickupAddress' => $data['pickupAddress'],
        ':deliveryAddress' => $data['deliveryAddress'],
        ':pickupTime' => $data['pickupTime'] ?? null,
        ':deliveryTime' => $data['deliveryTime'] ?? null,
        ':status' => 'assigned',
    ]);

    $created = $pdo->prepare('SELECT * FROM PickupAssignment WHERE assignmentId = :id LIMIT 1');
    $created->execute([':id' => $assignmentId]);
    jsonResponse($created->fetch(), 201);
}

if ($method === 'PATCH') {
    $user = requireAuth();
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    if (!$id || !$status) {
        jsonResponse(['message' => 'Assignment id and status are required.'], 400);
    }

    $pdo = getDb();
    $stmt = $pdo->prepare('UPDATE PickupAssignment SET status = :status WHERE assignmentId = :id');
    $stmt->execute([':status' => $status, ':id' => $id]);

    if ($status === 'delivered') {
        $fetch = $pdo->prepare('SELECT donationId FROM PickupAssignment WHERE assignmentId = :id LIMIT 1');
        $fetch->execute([':id' => $id]);
        $donationId = $fetch->fetchColumn();
        if ($donationId) {
            $pdo->prepare('UPDATE FoodDonation SET status = :status WHERE donationId = :id')->execute([':status' => 'delivered', ':id' => $donationId]);
        }
    }

    $updated = $pdo->prepare('SELECT * FROM PickupAssignment WHERE assignmentId = :id LIMIT 1');
    $updated->execute([':id' => $id]);
    jsonResponse($updated->fetch(), 200);
}

jsonResponse(['message' => 'Method not allowed.'], 405);
