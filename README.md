# Theatre Ticket Booking System

A full-stack web-based theatre ticket booking system developed using Node.js, Express.js, MySQL, HTML, CSS, and JavaScript.

## Features

### Customer Features
- View available theatre shows
- View show date, time, description, and ticket price
- Select available seats
- View booked and available seats
- Select multiple seats
- Calculate total ticket price
- Enter customer details
- Create theatre bookings
- View booking confirmation

### Admin Features
- Secure admin login
- JWT-based admin authentication
- Admin dashboard
- Add theatre shows
- Edit theatre shows
- Delete theatre shows
- View customer bookings
- View booked seats and customer information
- Admin logout

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Other Packages
- mysql2
- bcrypt
- jsonwebtoken
- cors
- dotenv
- nodemon

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

## Database Tables

The system uses the following MySQL tables:

- users
- shows
- seats
- bookings
- booking_seats

### Relationships

- One user can have many bookings.
- One show can have many bookings.
- One booking can contain multiple seats.
- Seat availability is calculated separately for each show.

## Installation

### 1. Clone the repository
### 2. Open the project folder
### 3. Install dependencies
### 4. Create the MySQL database
### 5. Configure environment variables
Create a `.env` file in the project root.
### 6. Start the application
### 7. Open the application
http://localhost:3000

## Main API Endpoints
GET  /api/shows
GET  /api/shows/:showId/seats
POST /api/bookings

POST   /api/admin/login
POST   /api/admin/shows
PUT    /api/admin/shows/:id
DELETE /api/admin/shows/:id
GET    /api/admin/bookings

## Security

- Passwords are hashed using bcrypt.
- Admin routes are protected using JSON Web Tokens.
- Database credentials are stored using environment variables.
- SQL queries use parameterized values.
- Backend validation is used for booking and show data.

## Future Improvements

Possible future improvements include:

- Customer account login
- Online payment integration
- Email booking confirmation
- Multiple theatre halls
- Different seat pricing categories
- Booking cancellation
- QR-code tickets
- Search and filtering
- Admin analytics dashboard

## Author

Kasunga Herath 