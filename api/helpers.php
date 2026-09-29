<?php
require_once __DIR__ . '/db.php';

function jsonResponse(mixed $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if (trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function currentUser(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $pdo = getDb();
    $stmt = $pdo->prepare('SELECT * FROM AppUser WHERE userId = :id LIMIT 1');
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $row = $stmt->fetch();

    return $row ? normalizeUserRow($row) : null;
}

function requireAuth(): array
{
    $user = currentUser();
    if (!$user) {
        jsonResponse(['message' => 'Unauthorized. Please log in again.'], 401);
    }

    return $user;
}

function requireRole(string $role): array
{
    $user = requireAuth();
    if ($user['role'] !== $role) {
        jsonResponse(['message' => 'Forbidden. This action requires a ' . $role . ' account.'], 403);
    }

    return $user;
}

function normalizeUserRow(array $row): array
{
    return [
        'userId' => $row['userId'] ?? $row['userIdLegacy'] ?? $row['user_id'] ?? null,
        'role' => $row['role'] ?? null,
        'name' => $row['name'] ?? null,
        'email' => $row['email'] ?? null,
        'phone' => $row['phone'] ?? null,
        'donorType' => $row['donor_type'] ?? null,
        'recipientType' => $row['recipient_type'] ?? null,
        'organizationName' => $row['organization_name'] ?? null,
        'address' => $row['address'] ?? null,
        'vehicleType' => $row['vehicle_type'] ?? null,
        'availability' => $row['availability'] ?? null,
        'status' => $row['status'] ?? 'active',
        'registeredAt' => $row['created_at'] ?? $row['createdAt'] ?? null,
    ];
}

function normalizeDonationRow(array $row): array
{
    return [
        'donationId' => $row['donationId'] ?? $row['donation_id'] ?? null,
        'donorId' => $row['donorId'] ?? $row['donor_id'] ?? null,
        'donorName' => $row['donorName'] ?? null,
        'title' => $row['title'] ?? null,
        'categoryId' => $row['categoryId'] ?? $row['category_id'] ?? null,
        'description' => $row['description'] ?? null,
        'quantity' => (int) ($row['quantity'] ?? 0),
        'unit' => $row['unit'] ?? null,
        'preparedAt' => $row['preparedAt'] ?? $row['prepared_at'] ?? null,
        'expiresAt' => $row['expiresAt'] ?? $row['expiry_time'] ?? null,
        'pickupAddress' => $row['pickupAddress'] ?? null,
        'contact' => $row['contact'] ?? null,
        'notes' => $row['notes'] ?? null,
        'status' => $row['status'] ?? 'available',
        'createdAt' => $row['createdAt'] ?? $row['created_at'] ?? null,
        'requestCount' => (int) ($row['requestCount'] ?? 0),
    ];
}

function normalizeRequestRow(array $row): array
{
    return [
        'requestId' => $row['requestId'] ?? $row['request_id'] ?? null,
        'donationId' => $row['donationId'] ?? $row['donation_id'] ?? null,
        'recipientId' => $row['recipientId'] ?? $row['recipient_id'] ?? null,
        'recipientName' => $row['recipientName'] ?? null,
        'requestedQuantity' => (int) ($row['requestedQuantity'] ?? $row['requested_qty'] ?? 0),
        'peopleToServe' => (int) ($row['peopleToServe'] ?? 0),
        'notes' => $row['notes'] ?? null,
        'status' => $row['status'] ?? 'pending',
        'createdAt' => $row['createdAt'] ?? $row['created_at'] ?? null,
    ];
}

function generateNextId(PDO $pdo, string $table, string $prefix, string $column): string
{
    $stmt = $pdo->prepare("SELECT {$column} FROM `{$table}` WHERE {$column} LIKE :prefix ORDER BY {$column} DESC LIMIT 1");
    $stmt->execute([':prefix' => $prefix . '-%']);
    $row = $stmt->fetch();

    if (!$row) {
        return $prefix . '-1';
    }

    $lastNumber = preg_replace('/^' . preg_quote($prefix, '/') . '-/', '', (string) $row[$column]);
    return $prefix . '-' . ((int) $lastNumber + 1);
}

function resolveUserId(PDO $pdo, mixed $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    if (is_numeric($value)) {
        return (int) $value;
    }

    $stmt = $pdo->prepare('SELECT user_id FROM AppUser WHERE userId = :value1 OR userIdLegacy = :value2 OR CONCAT("U-", user_id) = :value3 LIMIT 1');
    $stmt->execute([
        ':value1' => (string) $value,
        ':value2' => (string) $value,
        ':value3' => (string) $value,
    ]);
    $row = $stmt->fetch();

    return $row ? (int) $row['user_id'] : null;
}

function resolveCategoryId(PDO $pdo, mixed $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    if (is_numeric($value)) {
        return (int) $value;
    }

    $stmt = $pdo->prepare('SELECT category_id FROM FoodCategory WHERE categoryId = :value1 OR CONCAT("C-", category_id) = :value2 OR category_name = :value3 LIMIT 1');
    $stmt->execute([
        ':value1' => (string) $value,
        ':value2' => (string) $value,
        ':value3' => (string) $value,
    ]);
    $row = $stmt->fetch();

    return $row ? (int) $row['category_id'] : null;
}

function resolveDonationId(PDO $pdo, mixed $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    if (is_numeric($value)) {
        return (int) $value;
    }

    $stmt = $pdo->prepare('SELECT donation_id FROM FoodDonation WHERE donationId = :value1 OR CONCAT("D-", donation_id) = :value2 LIMIT 1');
    $stmt->execute([
        ':value1' => (string) $value,
        ':value2' => (string) $value,
    ]);
    $row = $stmt->fetch();

    return $row ? (int) $row['donation_id'] : null;
}

function resolveRequestId(PDO $pdo, mixed $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    if (is_numeric($value)) {
        return (int) $value;
    }

    $stmt = $pdo->prepare('SELECT request_id FROM Request WHERE requestId = :value1 OR CONCAT("RQ-", request_id) = :value2 LIMIT 1');
    $stmt->execute([
        ':value1' => (string) $value,
        ':value2' => (string) $value,
    ]);
    $row = $stmt->fetch();

    return $row ? (int) $row['request_id'] : null;
}

function createNotification(PDO $pdo, string $userId, string $message): void
{
    $userIdInt = resolveUserId($pdo, $userId);
    if ($userIdInt === null) {
        return;
    }

    $stmt = $pdo->prepare('INSERT INTO Notification (user_id, donation_id, message, is_read, created_at, notificationId, userId, isRead, createdAt) VALUES (:user_id, NULL, :message, 0, NOW(), :notificationId, :userId, 0, NOW())');
    $stmt->execute([
        ':user_id' => $userIdInt,
        ':message' => $message,
        ':notificationId' => generateNextId($pdo, 'Notification', 'N', 'notificationId'),
        ':userId' => $userId,
    ]);
}

function createAuditLog(PDO $pdo, string $userName, string $action, string $entity, string $description): void
{
    $logId = generateNextId($pdo, 'AuditLog', 'AL', 'logId');
    $stmt = $pdo->prepare('INSERT INTO AuditLog (logId, timestamp, userName, action, entity, description) VALUES (:id, :ts, :userName, :action, :entity, :description)');
    $stmt->execute([
        ':id' => $logId,
        ':ts' => date('Y-m-d\TH:i:s'),
        ':userName' => $userName,
        ':action' => $action,
        ':entity' => $entity,
        ':description' => $description,
    ]);
}
