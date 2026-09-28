# Food Waste Management System

A role-based food redistribution platform for donors, recipients, volunteers, and admins.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: MySQL
- Local server: XAMPP
- Authentication: PHP sessions and MySQL-backed user records

## What the app does

- Donors can create, manage, and track food donations
- Recipients can browse available food and submit requests
- Volunteers can accept assignments and update pickup status
- Admins can monitor users, donations, requests, feedback, reports, and audit logs

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

The frontend uses shared JavaScript modules and role-based pages. It includes a mock fallback for testing, but the live application uses the PHP API and MySQL database.

Main frontend/API configuration files:
- `assets/js/api-config.js`
- `assets/js/auth-demo.js`
- `assets/js/mock-data.js`

Authentication and session handling are done through:
- `api/login.php`
- `api/session.php`
- `api/logout.php`

## Local setup with XAMPP

1. Install XAMPP.
2. Start Apache and MySQL.
3. Copy the project into:
   `C:/xampp/htdocs/food-waste-management`
4. Open phpMyAdmin:
   `http://localhost/phpmyadmin`
5. Import the SQL file:
   `database/schema.sql`
6. This creates the database `food_waste_management` and inserts demo users.
7. Open the app in your browser:
   `http://localhost/food-waste-management/login.html`

## Demo login accounts

After importing the database schema, log in with:

- Donor: `donor@demo.com` / `demo123`
- Recipient: `recipient@demo.com` / `demo123`
- Volunteer: `volunteer@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## Database connection details

The MySQL configuration is stored in:
- `api/config.php`

The PDO database connection is created in:
- `api/db.php`

The app uses MySQL with PHP Data Objects (PDO) and PHP sessions for authentication.

## Notes

- The project is intended to run locally under XAMPP.
- The backend is the source of live application data.
- The project contains a mock fallback for UI-level development and demonstration.
- This repository is meant for local demo and XAMPP-based setup.

## Related documentation

- `README_BACKEND.md` — backend architecture, database connection, and setup
