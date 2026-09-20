# Theatre Ticket Booking System

A full-stack web-based theatre ticket booking system developed using Node.js, Express.js, MySQL, HTML, CSS, and JavaScript.

The system allows customers to browse available theatre shows, select seats, enter their details, and reserve tickets online. It also includes an admin panel for managing shows and viewing customer bookings.

Repository:

https://github.com/kasungaherath/theatre-ticket-booking-system

## Features

### Customer Features

* View available theatre shows
* View show title, description, date, time, and ticket price
* Select a theatre show
* View available and booked seats
* Select multiple seats
* Automatically calculate the total ticket price
* Enter customer information
* Create theatre ticket bookings
* Prevent already-booked seats from being booked again
* View booking confirmation
* Responsive interface for desktop and mobile devices

### Admin Features

* Secure admin login
* Password verification using bcrypt
* JWT-based admin authentication
* Admin dashboard
* Add new theatre shows
* Edit existing theatre shows
* Delete shows
* Prevent deletion of shows that already have bookings
* View customer bookings
* View customer names and email addresses
* View selected seats
* View show information associated with each booking
* Admin logout

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Authentication and Security

* bcrypt
* JSON Web Tokens (JWT)
* dotenv
* Parameterized SQL queries

### Other Packages

* mysql2
* cors
* nodemon

## Project Structure

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
│   │
│   ├── css/
│   │   └── style.css
│   │
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
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Database Structure

The system uses the following MySQL tables:

* `users`
* `shows`
* `seats`
* `bookings`
* `booking_seats`

### Users Table

Stores customer and administrator information.

Main columns:

```text
id
name
email
password
role
```

### Shows Table

Stores theatre show information.

Main columns:

```text
id
title
description
show_date
show_time
price
```

### Seats Table

Stores physical theatre seat numbers.

Example:

```text
A1
A2
A3
...
B1
B2
...
C10
```

### Bookings Table

Stores booking information and connects users with shows.

Main columns:

```text
id
user_id
show_id
booking_date
```

### Booking Seats Table

Connects bookings with the seats selected by customers.

Main columns:

```text
id
booking_id
seat_id
```

## Database Relationships

The main database relationships are:

```text
USERS
  │
  │ one-to-many
  ▼
BOOKINGS
  │
  │ one-to-many
  ▼
BOOKING_SEATS
  │
  │ many-to-one
  ▼
SEATS
```

Shows are also connected to bookings:

```text
SHOWS
  │
  │ one-to-many
  ▼
BOOKINGS
```

A seat is not permanently marked as booked.

Seat availability is calculated separately for each show. This allows the same physical seat to be booked for different shows while preventing duplicate bookings for the same show.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kasungaherath/theatre-ticket-booking-system.git
```

### 2. Open the Project Folder

```bash
cd theatre-ticket-booking-system
```

### 3. Install Dependencies

Run:

```bash
npm install
```

This installs all packages listed in `package.json`.

### 4. Install and Start MySQL

Make sure MySQL Server is installed and running.

MySQL Workbench can be used to manage the database.

### 5. Create the Database

Open MySQL Workbench and run:

```sql
CREATE DATABASE theatre_ticket_booking;
```

Then select the database:

```sql
USE theatre_ticket_booking;
```

### 6. Create the Required Tables

The application requires the following tables:

```text
users
shows
seats
bookings
booking_seats
```

The database should contain the seat records required by the theatre, such as:

```text
A1 - A10
B1 - B10
C1 - C10
```

### 7. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=theatre_ticket_booking
JWT_SECRET=YOUR_SECRET_KEY
```

Replace `YOUR_MYSQL_PASSWORD` with your local MySQL password.

Replace `YOUR_SECRET_KEY` with a private JWT secret.

The `.env` file should never be uploaded to GitHub.

The `.gitignore` file should include:

```text
node_modules/
.env
```

## Running the Application

### Development Mode

Run:

```bash
npm run dev
```

This starts the application using Nodemon.

### Normal Mode

Run:

```bash
npm start
```

### Open the Website

Open:

```text
http://localhost:3000
```

## Customer Booking Flow

The customer booking process is:

```text
Homepage
   ↓
View Shows
   ↓
Select Show
   ↓
View Available Seats
   ↓
Select Seats
   ↓
Continue Booking
   ↓
Enter Customer Details
   ↓
Confirm Booking
   ↓
Booking Saved in MySQL
   ↓
Booking Confirmation
```

After a seat has been booked for a particular show, the seat is displayed as unavailable for that show.

The same seat can still be booked for another show.

## Admin Access

Start the application:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/admin-login.html
```

If the default values in `backend/create-admin.js` have not been changed, the admin login is:

```text
Email: admin@theatre.com
Password: Admin123
```

After successful login, the administrator is redirected to:

```text
http://localhost:3000/admin-dashboard.html
```

The admin dashboard provides access to:

* Manage Shows
* View Bookings
* Logout

### Creating the Admin Account

If the admin account has not already been created, run:

```bash
node backend/create-admin.js
```

The script creates the admin account and stores the password as a bcrypt hash in MySQL.

If the account already exists, MySQL may return a duplicate email error. In that case, the existing admin account can be used.

For a production system, the default admin password should be changed and real credentials should never be published.

## Admin Show Management

The administrator can perform CRUD operations on theatre shows.

CRUD means:

```text
Create
Read
Update
Delete
```

The admin can:

```text
Add Show
Edit Show
Delete Show
View Shows
```

Shows that already have customer bookings cannot be deleted because of database foreign-key protection.

## Admin Booking Management

The administrator can view customer reservations.

The booking management page displays information such as:

```text
Booking ID
Customer Name
Customer Email
Show
Show Date
Show Time
Selected Seats
Booking Date
```

## Main API Endpoints

### General / Customer APIs

#### Test Database Connection

```text
GET /api/test-db
```

Checks whether the Node.js backend can communicate with MySQL.

#### Get Shows

```text
GET /api/shows
```

Returns all theatre shows.

#### Get Seat Availability

```text
GET /api/shows/:showId/seats
```

Returns all theatre seats and determines whether each seat is available or booked for the selected show.

Example:

```text
GET /api/shows/1/seats
```

#### Create Booking

```text
POST /api/bookings
```

Creates a customer booking and stores the selected seats.

### Admin APIs

#### Admin Login

```text
POST /api/admin/login
```

Authenticates an administrator and returns a JWT token.

#### Add Show

```text
POST /api/admin/shows
```

Creates a new theatre show.

Requires admin authentication.

#### Update Show

```text
PUT /api/admin/shows/:id
```

Updates an existing theatre show.

Requires admin authentication.

#### Delete Show

```text
DELETE /api/admin/shows/:id
```

Deletes a show if it has no associated bookings.

Requires admin authentication.

#### View Bookings

```text
GET /api/admin/bookings
```

Returns customer booking information.

Requires admin authentication.

## Security Features

The project includes several security measures.

### Password Hashing

Passwords are hashed using:

```text
bcrypt
```

Plain-text passwords are not intentionally stored in the database.

### JWT Authentication

Admin routes are protected using JSON Web Tokens.

After a successful admin login, the backend generates a temporary JWT.

Protected requests use:

```text
Authorization: Bearer TOKEN
```

### Environment Variables

Sensitive information is stored in:

```text
.env
```

Examples include:

```text
MySQL password
JWT secret
Database configuration
```

### Parameterized SQL Queries

Database queries use placeholders such as:

```sql
WHERE email = ?
```

This reduces the risk of SQL injection.

### Backend Validation

The backend validates:

* Required booking information
* Email format
* Password length
* Show IDs
* Seat IDs
* Duplicate seat IDs
* Existing shows
* Existing seats
* Seat availability
* Show ticket prices

## Seat Booking Protection

Before creating a booking, the backend checks whether the selected seats are already booked for the requested show.

If a seat is already booked, the request is rejected.

Example response:

```text
One or more selected seats are already booked
```

This prevents customers from intentionally booking an already reserved seat through the API.

## Git and GitHub

Git was used throughout development.

Repository:

https://github.com/kasungaherath/theatre-ticket-booking-system

Example workflow:

```bash
git status
git add .
git commit -m "Describe the changes"
git push
```

Example project commits include:

```text
Initial project setup
Add database connection and shows API
Add frontend and display shows
Complete customer booking flow
Add admin show and booking management
Improve responsive UI and validation
Add project documentation
Finalize theatre ticket booking system
```

Sensitive files such as `.env` and large dependency folders such as `node_modules` are excluded from Git.

## Responsive Design

The interface includes responsive CSS for smaller screens.

Mobile improvements include:

* Single-column show cards
* Responsive navigation
* Smaller theatre seat buttons
* Five-column seat layout on smaller screens
* Responsive customer forms
* Responsive admin cards
* Responsive booking information

## Future Improvements

Possible future improvements include:

* Customer registration and login
* Customer booking history
* Booking cancellation
* Online payment integration
* Email booking confirmations
* QR-code ticket generation
* Multiple theatre halls
* Multiple seat categories
* VIP seat pricing
* Search and filtering
* Show posters/images
* Admin analytics dashboard
* Revenue reports
* Customer profile management
* Password reset functionality
* Refresh-token authentication
* Deployment to a cloud platform

## Project Summary

The Theatre Ticket Booking System demonstrates the development of a full-stack web application using:

```text
Frontend
HTML
CSS
JavaScript

Backend
Node.js
Express.js

Database
MySQL

Security
bcrypt
JWT
dotenv

Version Control
Git
GitHub
```

The system provides both customer and administrator functionality and demonstrates frontend/backend communication, REST API development, relational database design, authentication, validation, responsive web design, and version control.

## Author

Kasunga Herath