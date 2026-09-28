<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = requireAuth();
    $pdo = getDb();
    $stmt = $pdo->query('SELECT * FROM AppUser ORDER BY created_at DESC');
    $users = array_map('normalizeUserRow', $stmt->fetchAll());
    jsonResponse($users, 200);
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $user = requireAuth();
    $id = $_GET['id'] ?? null;
    $data = readJsonBody();
    if (!$id) {
        jsonResponse(['message' => 'User id is required.'], 400);
    }

    $pdo = getDb();
    $fields = [];
    $params = [':id' => $id];

    if (isset($data['status'])) {
        $fields[] = 'status = :status';
        $params[':status'] = $data['status'];
    }
    if (isset($data['name'])) {
        $fields[] = 'name = :name';
        $params[':name'] = $data['name'];
    }
    if (isset($data['address'])) {
        $fields[] = 'address = :address';
        $params[':address'] = $data['address'];
    }
    if (isset($data['phone'])) {
        $fields[] = 'phone = :phone';
        $params[':phone'] = $data['phone'];
    }

    if (!$fields) {
        jsonResponse(['message' => 'No user fields were supplied.'], 400);
    }

    $sql = 'UPDATE AppUser SET ' . implode(', ', $fields) . ' WHERE userId = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $updated = $pdo->prepare('SELECT * FROM AppUser WHERE userId = :id LIMIT 1');
    $updated->execute([':id' => $id]);
    jsonResponse(normalizeUserRow($updated->fetch()), 200);
}

jsonResponse(['message' => 'Method not allowed.'], 405);
