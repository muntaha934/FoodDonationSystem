# Sufra — Food Waste Management System

Sufra is a full-stack food redistribution platform for donors, recipients, volunteers, and admins. The application allows surplus food to be posted, claimed, assigned, delivered, and reviewed while reducing waste and improving access to food.

This project is built with:
- Frontend: HTML, CSS, and JavaScript
- Backend: PHP
- Database: MySQL
- Local development environment: XAMPP
- Authentication: PHP session-based login

## Features

- Donor dashboard to create and manage food donations
- Recipient dashboard to browse and request available food
- Volunteer dashboard to accept pickups and update delivery status
- Admin dashboard to monitor users, requests, donations, logs, and reports
- Role-based authentication and protected routes
- Live API-driven data access with mock fallback during development

## Project structure

```text
food-waste-management/
├── index.html
├── login.html
├── register.html
├── README.md
├── README_BACKEND.md
├── admin/
├── donor/
├── recipient/
├── volunteer/
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── api/
│   ├── config.php
│   ├── db.php
│   ├── helpers.php
│   ├── login.php
│   ├── register.php
│   ├── session.php
│   ├── logout.php
│   ├── donations.php
│   ├── requests.php
│   ├── pickup-assignments.php
│   ├── notifications.php
│   ├── feedback.php
│   ├── users.php
│   ├── waste-logs.php
│   └── audit-logs.php
├── database/
│   ├── schema.sql
│   └── hash_demo_password.php
├── .git/
└── .gitignore
```

## Stack and architecture

### Frontend
The frontend is a role-based web app with reusable components and page-specific logic in the JavaScript files under `assets/js/`.

### Backend
The backend is implemented in PHP and uses MySQL through PDO for data access. Session-based authentication is handled through PHP session cookies.

### Database
The live database structure is stored in `database/schema.sql`. This file contains only the table definitions.

Optional demo/mock data is stored separately in `database/extramockdata.sql` and can be imported after the schema is created.

## XAMPP setup

1. Install XAMPP.
2. Start Apache and MySQL.
3. Copy the project into:
   `C:/xampp/htdocs/food-waste-management`
4. Open phpMyAdmin at:
   `http://localhost/phpmyadmin`
5. Import the schema file:
   `database/schema.sql`
6. If you want the demo/mock data set, import:
   `database/extramockdata.sql`
7. Open the app in the browser:
   `http://localhost/food-waste-management/login.html`

## Database configuration

The database connection settings are stored in `api/config.php`.

Example:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'food_waste_management';
const DB_USER = 'root';
const DB_PASS = '';
```

The actual PDO connection is built in `api/db.php`.

## Demo login accounts

After importing the schema, the app includes these demo accounts:

- Donor: `donor@demo.com` / `demo123`
- Recipient: `recipient@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## How authentication works

The login flow is:
1. Browser sends email and password to `api/login.php`
2. PHP validates credentials against the MySQL database
3. On success, PHP stores the user ID in the session
4. `api/session.php` fetches the current logged-in user
5. `api/logout.php` clears the session

## Live verification status

The project has been validated locally under XAMPP with the PHP + MySQL backend:
- PHP syntax checks passed for all API files
- login pages load successfully from localhost
- demo login flows return successful role-based JSON responses
- session-based authentication works for a logged-in donor
- protected endpoints for donor, recipient, volunteer, and admin roles return valid data

## Main docs

- `README.md` — overview and setup
- `README_BACKEND.md` — backend, MySQL, and authentication details

## Notes

- The app includes a mock fallback for local UI testing, but the real data layer is the PHP + MySQL backend.
- The project is designed to run as a local XAMPP application.
- The repository is ready for local development, demo use, and backend deployment under XAMPP.
