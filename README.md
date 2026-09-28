# Sufra — Food Waste Management System

Sufra is a food redistribution platform that connects donors, recipients, volunteers, and admins to reduce food waste and improve food access.

The project combines:
- Frontend: HTML, CSS, and vanilla JavaScript
- Backend: PHP
- Database: MySQL
- Local environment: XAMPP

This README explains what is used to build the frontend, how the backend works, how the database connection is established, and how to set the project up locally.

## Project structure

```text
food-waste-management/
├── index.html
├── login.html
├── register.html
├── README.md
├── README_BACKEND.md
├── API_INTEGRATION.md
├── admin/
├── donor/
├── recipient/
├── volunteer/
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── api/
├── database/
└── .git/
```

## Frontend technology

The frontend is built with:
- HTML for page layout
- CSS for design system and responsive pages
- JavaScript for dynamic behavior
- Local browser storage as a fallback for demo mode

Main frontend files:
- `index.html` — landing page
- `login.html` — login form and demo role login buttons
- `register.html` — user registration page
- `assets/css/style.css` — base design system
- `assets/css/dashboard.css` — dashboard layout styles
- `assets/css/responsive.css` — mobile/tablet responsiveness
- `assets/js/app.js` — shared UI behavior
- `assets/js/auth-demo.js` — login/session logic
- `assets/js/mock-data.js` — mock data and app data access layer
- `assets/js/api-config.js` — backend API configuration

The app is split by role:
- Donor pages in `donor/`
- Recipient pages in `recipient/`
- Volunteer pages in `volunteer/`
- Admin pages in `admin/`

These pages all use shared script modules and behave similarly, but each role has their own dashboard and workflow.

## Frontend behavior

The frontend follows a simple pattern:
1. A page loads its HTML.
2. JavaScript runs and attaches events.
3. Page logic calls a shared data layer.
4. Data is retrieved as either:
   - mock/localStorage data during local demo mode, or
   - JSON from the PHP API when backend mode is enabled

This makes the app easy to develop in stages without rewriting the pages every time the backend is introduced.

## Backend technology

The backend is built with:
- PHP
- MySQL database
- PDO for database connections
- JSON API endpoints
- PHP sessions for authentication

Main backend files:
- `api/config.php` — database connection settings and request headers
- `api/db.php` — database connection code
- `api/helpers.php` — JSON responses, session helpers, data normalization
- `api/login.php` — login endpoint
- `api/register.php` — registration endpoint
- `api/session.php` — current logged-in user
- `api/logout.php` — logout endpoint
- `api/donations.php` — donation routes
- `api/requests.php` — request routes
- `api/pickup-assignments.php` — volunteer assignment routes
- `api/notifications.php` — notifications routes
- `api/feedback.php` — feedback routes
- `api/users.php` — user/profile management
- `api/waste-logs.php` — waste log data
- `api/audit-logs.php` — admin audit data

## How the database connection works

The database connection is handled in a very simple and clean way:

### 1) Database constants
In `api/config.php`, the app sets the database connection values:
- database host: `localhost`
- database name: `food_waste_management`
- database user: `root`
- database password: empty string for default XAMPP setup
- charset: `utf8mb4`

This file also starts the session and sets CORS headers for browser requests.

### 2) PDO connection
In `api/db.php`, the app creates a MySQL connection using PHP Data Objects (PDO):

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

This means each API file can call `getDb()` and get a reusable database connection object.

### 3) Session-based authentication
The app uses PHP sessions to remember the logged-in user:
- `login.php` validates the credentials
- if successful, it sets `$_SESSION['user_id']`
- `session.php` reads the session and returns the current user
- `logout.php` destroys the session

### 4) Shared helper functions
`api/helpers.php` contains helper functions such as:
- `jsonResponse()` — sends JSON responses with status codes
- `readJsonBody()` — reads the request body
- `currentUser()` — loads the current user from the session
- `requireAuth()` — protects private endpoints
- `normalizeUserRow()`, `normalizeDonationRow()`, `normalizeRequestRow()` — convert database records into frontend-friendly formats

This keeps the API files consistent and reduces repeated code.

## How to set up the project

### Option 1: Local setup with XAMPP (recommended)

1. Install XAMPP.
2. Start Apache and MySQL from the XAMPP Control Panel.
3. Copy the project folder into:
   `C:/xampp/htdocs/food-waste-management`
4. Open phpMyAdmin at:
   `http://localhost/phpmyadmin`
5. Import the SQL file:
   `database/schema.sql`
6. This creates the database `food_waste_management` and inserts demo data.
7. Open the app in the browser:
   `http://localhost/food-waste-management/index.html`

### Option 2: Run only the frontend (demo mode)

If you only want to test the UI without the database:
- open `index.html` directly in a browser, or
- run a simple local static server

The app can still run in mock/demo mode, but the live backend is the version used for the final implementation.

## Demo login accounts

The seeded demo users are:
- Donor: `donor@demo.com` / `demo123`
- Recipient: `recipient@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## Important notes

- The frontend checks `assets/js/api-config.js` to decide whether to use mock data or the live backend.
- In live backend mode, the frontend sends `fetch()` requests to `api/*.php` endpoints.
- The app is designed so pages do not need a huge rewrite when moving from mock data to real database data.

## Summary

This project uses a layered architecture:
- Frontend pages drive the experience
- JavaScript handles page logic and API calls
- PHP handles business logic and authentication
- MySQL stores the core data
- XAMPP provides the local web and database environment

That gives a clean and realistic full-stack setup for a food waste management system.
