<?php
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = requireAuth();
    $pdo = getDb();
    $stmt = $pdo->prepare('SELECT * FROM Notification WHERE userId = :userId ORDER BY createdAt DESC');
    $stmt->execute([':userId' => $user['userId']]);
    jsonResponse($stmt->fetchAll(), 200);
}

if ($method === 'PATCH') {
    $user = requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        jsonResponse(['message' => 'Notification id is required.'], 400);
    }

    $pdo = getDb();
    $stmt = $pdo->prepare('UPDATE Notification SET isRead = 1 WHERE notificationId = :id AND userId = :userId');
    $stmt->execute([':id' => $id, ':userId' => $user['userId']]);
    jsonResponse(['message' => 'Notification marked as read.'], 200);
}

jsonResponse(['message' => 'Method not allowed.'], 405);
