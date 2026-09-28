# Sufra Backend Setup Guide

This project has a real PHP + MySQL backend that powers the app under XAMPP.

## What is used

### Frontend
- HTML
- CSS
- JavaScript
- Browser fetch calls to the API

### Backend
- PHP
- Sessions for user authentication
- JSON responses
- PDO for database access

### Database
- MySQL
- XAMPP MariaDB/MySQL instance
- Schema imported from `database/schema.sql`

## Backend folder overview

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

## How the frontend and backend connect

The frontend uses the file `assets/js/api-config.js` to define the API base URL:

```js
const API_CONFIG = {
  baseUrl: "/food-waste-management/api",
  useMockData: false,
};
```

Then the frontend JavaScript uses `fetch()` or `apiFetch()` to call backend endpoints like:
- `/login.php`
- `/session.php`
- `/donations.php`
- `/requests.php`
- `/pickup-assignments.php`
- `/notifications.php`

The backend returns JSON, and the frontend reads the response and updates the page.

## How the database connection works

The connection starts in `api/config.php`:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'food_waste_management';
const DB_USER = 'root';
const DB_PASS = '';
```

Then `api/db.php` builds the PDO DSN and creates the database connection:

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

Every API file then calls `getDb()` to reuse that connection.

The `api/helpers.php` file centralizes shared logic like:
- `jsonResponse()`
- `readJsonBody()`
- `currentUser()`
- `requireAuth()`
- `normalizeUserRow()`
- `normalizeDonationRow()`
- `normalizeRequestRow()`

This is how the database rows are converted into frontend-friendly JSON.

## Authentication flow

The login flow works like this:
1. Browser sends email + password to `api/login.php`
2. PHP checks the user in the `AppUser` table
3. `password_verify()` validates the password hash
4. On success, PHP stores the user ID in `$_SESSION['user_id']`
5. The frontend later calls `api/session.php` to fetch the logged-in user
6. Logout clears the session with `api/logout.php`

## Database schema

The schema is in:
- `database/schema.sql`

It creates all major tables such as:
- `AppUser`
- `FoodDonation`
- `Request`
- `PickupAssignment`
- `Notification`
- `Feedback`
- `WasteLog`
- `AuditLog`

It also inserts demo data and seeded demo credentials for all user roles.

## Full setup steps

### 1) Install and start XAMPP
- Install XAMPP
- Start Apache
- Start MySQL

### 2) Put the project inside htdocs
Place the project here:

```text
C:/xampp/htdocs/food-waste-management
```

### 3) Import the database schema
Open phpMyAdmin:
- `http://localhost/phpmyadmin`

Then run the SQL from:
- `database/schema.sql`

This creates:
- database: `food_waste_management`
- tables and seeded demo records

### 4) Run the application
Open:

```text
http://localhost/food-waste-management/index.html
```

### 5) Login with demo accounts
- Donor: `donor@demo.com` / `demo123`
- Recipient: `recipient@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## Troubleshooting

### “Database connection failed”
This usually means the database was not created or the MySQL server is not running.

Check:
- XAMPP MySQL is running
- the database `food_waste_management` exists
- `api/config.php` has the correct DB values

### “Not Found” on API routes
Check that:
- the project is inside `htdocs`
- Apache is running
- the file path is correct under `/food-waste-management/api`

### Poor front-end data behavior
If the frontend still looks like mock mode, verify that `assets/js/api-config.js` has:

```js
useMockData: false
```

## Final note

The app is designed with both demo mode and live database mode. In development, the mock layer makes testing easier; in production, the PHP API and MySQL database become the source of truth.

That is the complete setup flow for the Sufra backend in XAMPP.
