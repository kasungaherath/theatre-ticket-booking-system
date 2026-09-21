# 🎭 Theatre Ticket Booking System

A full-stack web application for browsing theatre shows, selecting seats, making bookings, and managing shows and reservations through an admin panel.

🔗 Repository:
https://github.com/kasungaherath/theatre-ticket-booking-system

## ✨ Features

### Customer

* Browse available theatre shows
* View show details, date, time, and ticket price
* Select available seats
* View booked and available seats
* Select multiple seats
* Automatically calculate total price
* Enter customer details
* Confirm bookings
* Prevent duplicate seat bookings
* Responsive interface for desktop and mobile

### Admin

* Secure admin login
* JWT-based authentication
* Admin dashboard
* Add, edit, and delete shows
* View customer bookings
* View booked seats and customer details
* Logout functionality

## 🛠️ Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Node.js
* Express.js

**Database**

* MySQL

**Security & Packages**

* bcrypt
* JSON Web Tokens
* mysql2
* dotenv
* cors
* nodemon

## 📁 Project Structure

```text
theatre-ticket-booking-system/
│
├── backend/
│   ├── server.js
│   ├── db.js
│   └── create-admin.js
│
├── frontend/
│   ├── index.html
│   ├── seat-selection.html
│   ├── customer-details.html
│   ├── booking-confirmation.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── admin-shows.html
│   ├── admin-bookings.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── script.js
│       ├── seat-selection.js
│       ├── customer-details.js
│       ├── booking-confirmation.js
│       ├── admin-login.js
│       ├── admin-dashboard.js
│       ├── admin-shows.js
│       └── admin-bookings.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 🗄️ Database

The system uses these MySQL tables:

* `users`
* `shows`
* `seats`
* `bookings`
* `booking_seats`

Main relationships:

```text
USERS
  ↓
BOOKINGS
  ↓
BOOKING_SEATS
  ↓
SEATS

SHOWS
  ↓
BOOKINGS
```

Seat availability is calculated per show, allowing the same physical seat to be used for different performances.

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/kasungaherath/theatre-ticket-booking-system.git
```

### 2. Open the project

```bash
cd theatre-ticket-booking-system
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the database

```sql
CREATE DATABASE theatre_ticket_booking;
USE theatre_ticket_booking;
```

Create the required tables and add theatre seats such as:

```text
A1 - A10
B1 - B10
C1 - C10
```

### 5. Configure environment variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=theatre_ticket_booking
JWT_SECRET=YOUR_SECRET_KEY
```

Make sure `.gitignore` contains:

```text
node_modules/
.env
```

### 6. Start the application

Development mode:

```bash
npm run dev
```

Or:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## 🔐 Admin Access

Open:

```text
http://localhost:3000/admin-login.html
```

If the default values in `backend/create-admin.js` are unchanged:

```text
Email: admin@theatre.com
Password: Admin123
```

If the admin account has not been created yet, run:

```bash
node backend/create-admin.js
```

After login, the admin can manage shows and view bookings.

> For real deployment, change the default admin password and never publish production credentials.

## 🔌 Main API Endpoints

### Customer

```text
GET  /api/shows
GET  /api/shows/:showId/seats
POST /api/bookings
```

### Admin

```text
POST   /api/admin/login
POST   /api/admin/shows
PUT    /api/admin/shows/:id
DELETE /api/admin/shows/:id
GET    /api/admin/bookings
```

Admin routes require JWT authentication.

## 🛡️ Security

The project includes:

* Password hashing with bcrypt
* JWT-protected admin routes
* Environment variables for sensitive configuration
* Parameterized SQL queries
* Backend validation
* Seat availability checks
* Duplicate booking prevention

## 📱 Responsive Design

The interface is responsive and supports:

* Mobile-friendly navigation
* Responsive show cards
* Mobile seat layouts
* Responsive forms
* Admin pages that adapt to smaller screens

## 🔮 Future Improvements

* Customer login and booking history
* Online payments
* Email confirmations
* QR-code tickets
* Booking cancellation
* Multiple theatre halls
* Search and filtering
* Admin analytics dashboard

## 👨‍💻 Author

Kasunga Herath
