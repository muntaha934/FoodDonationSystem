# Backend Setup Guide

This project uses a PHP + MySQL backend running locally under XAMPP. The frontend pages communicate with backend endpoints under `api/`, and the database is created and seeded from `database/schema.sql`.

## Stack

### Frontend
- HTML
- CSS
- JavaScript
- Role-based pages under `admin/`, `donor/`, `recipient/`, and `volunteer/`

### Backend
- PHP
- PDO for MySQL database access
- JSON API responses
- PHP sessions for login and role-based access control

### Database
- MySQL via XAMPP
- Database name: `food_waste_management`
- Schema file: `database/schema.sql`

## Backend files

```text
api/
├── config.php
├── db.php
├── helpers.php
├── login.php
├── register.php
├── session.php
├── logout.php
├── donations.php
├── requests.php
├── pickup-assignments.php
├── notifications.php
├── feedback.php
├── users.php
├── waste-logs.php
├── audit-logs.php
```

## Database connection

The database configuration is stored in `api/config.php`.

Example:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'food_waste_management';
const DB_USER = 'root';
const DB_PASS = '';
```

The actual PDO connection is created in `api/db.php`:

```php
$dsn = sprintf(
    'mysql:host=%s;dbname=%s;charset=%s',
    DB_HOST,
    DB_NAME,
    DB_CHARSET
);

$pdo = new PDO($dsn, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);
```

This gives each endpoint a shared database connection for reading and writing user, donation, request, pickup, notification, feedback, and audit data.

## Authentication flow

The authentication system is session-based and works as follows:

1. The browser posts the email and password to `api/login.php`
2. PHP checks the user in the `AppUser` table
3. The submitted password is validated with `password_verify()`
4. On success, the app stores `$_SESSION['user_id']`
5. `api/session.php` returns the current logged-in user
6. `api/logout.php` clears the session and logs the user out

The helpers in `api/helpers.php` provide common functions such as:
- `jsonResponse()`
- `readJsonBody()`
- `currentUser()`
- `requireAuth()`
- `requireRole()`
- normalization helpers for user, donation, and request rows

## Database schema and seed data

The schema is located at:
- `database/schema.sql`

It creates the main tables and inserts demo accounts for:
- donor
- recipient
- volunteer
- admin

## XAMPP setup steps

### 1) Install and start XAMPP
- Install XAMPP
- Start Apache
- Start MySQL

### 2) Place the project in the web root

```text
C:/xampp/htdocs/food-waste-management
```

### 3) Import the database schema
Open phpMyAdmin:

```text
http://localhost/phpmyadmin
```

Then import:

```text
database/schema.sql
```

### 4) Open the app

```text
http://localhost/food-waste-management/login.html
```

## Demo users

After the schema is imported, these accounts are available:

- Donor: `donor@demo.com` / `demo123`
- Recipient: `recipient@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## How the frontend connects to the backend

The frontend uses a backend-aware API configuration under `assets/js/api-config.js` and uses the live PHP API when `useMockData` is disabled.

The project is designed to support a hybrid development pattern:
- mock data can still be used for UI testing and offline work
- the real production data layer is the MySQL-backed PHP API

## Verified local status

This project has been validated locally under XAMPP with the real backend:
- PHP syntax checks passed across the API files
- login pages load successfully from localhost
- role-based login requests return valid JSON responses
- session-based authentication works
- admin and role-specific protected pages load correctly under a valid session

## Troubleshooting

### Database connection failed
Check:
- MySQL is running in XAMPP
- the database `food_waste_management` exists
- the credentials in `api/config.php` are correct

### API route not found
Check:
- the project is inside `C:/xampp/htdocs`
- Apache is running
- the URL matches `/food-waste-management/api/...`

### Frontend not loading real data
Check `assets/js/api-config.js` and confirm the app is configured for backend mode rather than mock mode.

## Final note

The backend implementation is the working data layer for this application. The app runs correctly under XAMPP with PHP + MySQL, and the database schema plus session-based authentication are the core pieces required to run the platform locally.
