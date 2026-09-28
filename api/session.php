<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

$user = currentUser();
if (!$user) {
    jsonResponse(['message' => 'Not authenticated.'], 401);
}

jsonResponse($user, 200);
