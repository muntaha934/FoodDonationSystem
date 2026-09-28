<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

$pdo = getDb();
$stmt = $pdo->query('SELECT * FROM WasteLog ORDER BY loggedAt DESC');
jsonResponse($stmt->fetchAll(), 200);
