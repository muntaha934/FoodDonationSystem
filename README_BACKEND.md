# Backend Setup Guide

This project uses a PHP + MySQL backend under XAMPP.

## Technology used

### Frontend
- HTML
- CSS
- JavaScript
- Role-based pages under admin/, donor/, recipient/, and volunteer/

### Backend
- PHP
- PDO for MySQL access
- JSON responses
- PHP sessions for login state

### Database
- MySQL via XAMPP
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

## Database configuration

The database settings are defined in `api/config.php`.

Example:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'food_waste_management';
const DB_USER = 'root';
const DB_PASS = '';
```

Then `api/db.php` creates the PDO connection:

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

## Authentication flow

1. The browser sends email and password to `api/login.php`
2. PHP checks the user in the `AppUser` table
3. The password is validated with `password_verify()`
4. On success, the app stores `$_SESSION['user_id']`
5. `api/session.php` returns the current authenticated user
6. `api/logout.php` destroys the session

## Shared helper functions

`api/helpers.php` provides common functions used by the API:

- `jsonResponse()`
- `readJsonBody()`
- `currentUser()`
- `requireAuth()`
- `requireRole()`
- `normalizeUserRow()`
- `normalizeDonationRow()`
- `normalizeRequestRow()`

## Schema and seed data

The database schema is in:
- `database/schema.sql`

It creates the tables and inserts demo accounts for:
- donor
- recipient
- volunteer
- admin

## Full setup steps

### 1) Install XAMPP
- Install XAMPP
- Start Apache
- Start MySQL

### 2) Place project in htdocs

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

### 4) Run the app

```text
http://localhost/food-waste-management/login.html
```

## Demo users

- Donor: `donor@demo.com` / `demo123`
- Recipient: `recipient@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## Troubleshooting

### Database connection failed
Check:
- MySQL is running in XAMPP
- the database `food_waste_management` exists
- credentials in `api/config.php` are correct

### API route not found
Check:
- the project is inside `htdocs`
- Apache is running
- the URL matches `/food-waste-management/api/...`

### Frontend not loading live data
Check `assets/js/api-config.js` and make sure the app is pointed to the backend rather than mock mode.

## Final note

The app uses a hybrid pattern during development:
- mock data is useful for testing UI flow
- PHP + MySQL is the real production data layer

This backend structure is the correct setup for the project under XAMPP.
