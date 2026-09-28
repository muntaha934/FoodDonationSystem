# Food Waste Management System

A role-based food redistribution web application for donors, recipients, volunteers, and admins.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: MySQL
- Local server: XAMPP
- Auth: PHP sessions with MySQL-backed user records

## What this project does

- Donors can create, manage, and track food donations
- Recipients can browse available food and submit requests
- Volunteers can accept assignments and update pickup status
- Admins can review users, donations, requests, feedback, audits, and reports

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
└── .git/
```

## Frontend and backend flow

The frontend is a role-based UI with shared JavaScript modules. The app can run in demo/mock mode for testing, but the live implementation uses the PHP API and MySQL database.

API connection settings are defined in:
- `assets/js/api-config.js`

Authentication and session state are handled through:
- `api/login.php`
- `api/session.php`
- `api/logout.php`

## Local setup with XAMPP

1. Install XAMPP.
2. Start Apache and MySQL.
3. Copy the project to:
   `C:/xampp/htdocs/food-waste-management`
4. Open phpMyAdmin at:
   `http://localhost/phpmyadmin`
5. Import the SQL file:
   `database/schema.sql`
6. This creates the database `food_waste_management` and inserts demo users.
7. Open the app in your browser:
   `http://localhost/food-waste-management/login.html`

## Demo login accounts

After importing the schema, you can log in using:

- Donor: `donor@demo.com` / `demo123`
- Recipient: `recipient@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## Database connection details

The database configuration is stored in:
- `api/config.php`

The actual PDO connection is created in:
- `api/db.php`

The app uses MySQL with PHP Data Objects (PDO) and PHP sessions for authentication.

## Notes

- The project is designed to work locally under XAMPP.
- The backend is the real source of data.
- The app includes a mock fallback layer during development, but the live backend is the final target.
- This repository is meant for local submission/demo/running with XAMPP and MySQL.

## Main documentation

- [README.md](README.md) — project overview and setup
- [README_BACKEND.md](README_BACKEND.md) — backend and database details
