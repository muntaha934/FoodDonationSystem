<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = requireAuth();
    $pdo = getDb();
    $sql = 'SELECT * FROM Feedback';
    $params = [];

    if (!empty($_GET['toUserId'])) {
        $sql .= ' WHERE toUserId = :toUserId';
        $params[':toUserId'] = $_GET['toUserId'];
    }
    if (!empty($_GET['fromUserId'])) {
        $sql .= (str_contains($sql, 'WHERE') ? ' AND ' : ' WHERE ') . 'fromUserId = :fromUserId';
        $params[':fromUserId'] = $_GET['fromUserId'];
    }

    $stmt = $pdo->prepare($sql . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll(), 200);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = requireAuth();
    $data = readJsonBody();
    foreach (['donationId', 'fromUserId', 'toUserId', 'rating'] as $field) {
        if (!isset($data[$field])) {
            jsonResponse(['message' => "Field '{$field}' is required."], 400);
        }
    }

    $pdo = getDb();
    $feedbackId = generateNextId($pdo, 'Feedback', 'F', 'feedbackId');
    $stmt = $pdo->prepare('INSERT INTO Feedback (feedbackId, donationId, fromUserId, toUserId, rating, review, createdAt) VALUES (:id, :donationId, :fromUserId, :toUserId, :rating, :review, :createdAt)');
    $stmt->execute([
        ':id' => $feedbackId,
        ':donationId' => $data['donationId'],
        ':fromUserId' => $data['fromUserId'],
        ':toUserId' => $data['toUserId'],
        ':rating' => (int) $data['rating'],
        ':review' => $data['review'] ?? '',
        ':createdAt' => date('Y-m-d\TH:i:s'),
    ]);

    $created = $pdo->prepare('SELECT * FROM Feedback WHERE feedbackId = :id LIMIT 1');
    $created->execute([':id' => $feedbackId]);
    jsonResponse($created->fetch(), 201);
}

jsonResponse(['message' => 'Method not allowed.'], 405);
