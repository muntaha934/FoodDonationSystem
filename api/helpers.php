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
        'userId' => $row['userId'] ?? null,
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
        'registeredAt' => $row['created_at'] ?? null,
    ];
}

function normalizeDonationRow(array $row): array
{
    return [
        'donationId' => $row['donationId'] ?? null,
        'donorId' => $row['donorId'] ?? null,
        'donorName' => $row['donorName'] ?? null,
        'title' => $row['title'] ?? null,
        'categoryId' => $row['categoryId'] ?? null,
        'description' => $row['description'] ?? null,
        'quantity' => (int) ($row['quantity'] ?? 0),
        'unit' => $row['unit'] ?? null,
        'preparedAt' => $row['preparedAt'] ?? null,
        'expiresAt' => $row['expiresAt'] ?? null,
        'pickupAddress' => $row['pickupAddress'] ?? null,
        'contact' => $row['contact'] ?? null,
        'notes' => $row['notes'] ?? null,
        'status' => $row['status'] ?? 'available',
        'createdAt' => $row['createdAt'] ?? null,
        'requestCount' => (int) ($row['requestCount'] ?? 0),
    ];
}

function normalizeRequestRow(array $row): array
{
    return [
        'requestId' => $row['requestId'] ?? null,
        'donationId' => $row['donationId'] ?? null,
        'recipientId' => $row['recipientId'] ?? null,
        'recipientName' => $row['recipientName'] ?? null,
        'requestedQuantity' => (int) ($row['requestedQuantity'] ?? 0),
        'peopleToServe' => (int) ($row['peopleToServe'] ?? 0),
        'notes' => $row['notes'] ?? null,
        'status' => $row['status'] ?? 'pending',
        'createdAt' => $row['createdAt'] ?? null,
    ];
}

function generateNextId(PDO $pdo, string $table, string $prefix, string $column): string
{
    $stmt = $pdo->prepare("SELECT {$column} FROM {$table} WHERE {$column} LIKE :prefix ORDER BY {$column} DESC LIMIT 1");
    $stmt->execute([':prefix' => $prefix . '-%']);
    $row = $stmt->fetch();

    if (!$row) {
        return $prefix . '-1';
    }

    $lastNumber = preg_replace('/^' . preg_quote($prefix, '/') . '-/', '', (string) $row[$column]);
    return $prefix . '-' . ((int) $lastNumber + 1);
}

function createNotification(PDO $pdo, string $userId, string $message): void
{
    $notificationId = generateNextId($pdo, 'Notification', 'N', 'notificationId');
    $stmt = $pdo->prepare('INSERT INTO Notification (notificationId, userId, message, isRead, createdAt) VALUES (:id, :userId, :message, :isRead, :createdAt)');
    $stmt->execute([
        ':id' => $notificationId,
        ':userId' => $userId,
        ':message' => $message,
        ':isRead' => 0,
        ':createdAt' => date('Y-m-d\TH:i:s'),
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
