<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

$pdo = getDb();
$stmt = $pdo->query('SELECT * FROM FoodCategory ORDER BY categoryId ASC');
$json = $stmt->fetchAll();
jsonResponse($json, 200);
