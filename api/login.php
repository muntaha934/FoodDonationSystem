<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

$data = readJsonBody();
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    jsonResponse(['message' => 'Email and password are required.'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT * FROM AppUser WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonResponse(['message' => 'Invalid email or password.'], 401);
}

$_SESSION['user_id'] = $user['userId'];
jsonResponse(normalizeUserRow($user), 200);
