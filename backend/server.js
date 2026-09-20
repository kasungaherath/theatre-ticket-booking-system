require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// ======================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ======================================================

function verifyAdmin(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Admin authentication required"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Invalid authentication token"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Session expired or invalid"
        });
    }
}


// ======================================================
// TEST DATABASE CONNECTION
// ======================================================

app.get("/api/test-db", (req, res) => {

    db.query(
        "SELECT NOW() AS currentTime",
        (err, results) => {

            if (err) {

                console.error(
                    "Database error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Database connection failed"
                });
            }

            res.json({
                message:
                    "Database connected successfully",

                databaseTime:
                    results[0].currentTime
            });
        }
    );
});


// ======================================================
// GET ALL SHOWS
// ======================================================

app.get("/api/shows", (req, res) => {

    const sql = `
        SELECT *
        FROM shows
        ORDER BY show_date, show_time
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching shows:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to fetch shows"
            });
        }

        res.json(results);
    });
});


// ======================================================
// GET SEATS FOR A SPECIFIC SHOW
// ======================================================

app.get(
    "/api/shows/:showId/seats",
    (req, res) => {

        const showId = req.params.showId;

        if (
            !Number.isInteger(Number(showId)) ||
            Number(showId) <= 0
        ) {
            return res.status(400).json({
                message: "Invalid show ID"
            });
        }

        const sql = `
            SELECT
                s.id,
                s.seat_number,

                CASE
                    WHEN booked.seat_id IS NOT NULL
                    THEN 'booked'
                    ELSE 'available'
                END AS status

            FROM seats s

            LEFT JOIN (

                SELECT bs.seat_id

                FROM booking_seats bs

                INNER JOIN bookings b
                    ON bs.booking_id = b.id

                WHERE b.show_id = ?

            ) AS booked

                ON s.id = booked.seat_id

            ORDER BY s.id;
        `;

        db.query(
            sql,
            [showId],
            (err, results) => {

                if (err) {

                    console.error(
                        "Error fetching seats:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch seats"
                    });
                }

                res.json(results);
            }
        );
    }
);


// ======================================================
// CREATE CUSTOMER BOOKING
// ======================================================

app.post(
    "/api/bookings",
    async (req, res) => {

        const {
            name,
            email,
            password,
            showId,
            seatIds
        } = req.body;


        // ----------------------------------------------
        // BASIC VALIDATION
        // ----------------------------------------------

        if (
            !name ||
            !email ||
            !password ||
            !showId ||
            !Array.isArray(seatIds) ||
            seatIds.length === 0
        ) {

            return res.status(400).json({
                message:
                    "All booking details are required"
            });
        }


        // ----------------------------------------------
        // NAME VALIDATION
        // ----------------------------------------------

        if (!name.trim()) {

            return res.status(400).json({
                message:
                    "Customer name is required"
            });
        }


        // ----------------------------------------------
        // PASSWORD VALIDATION
        // ----------------------------------------------

        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters long"
            });
        }


        // ----------------------------------------------
        // EMAIL VALIDATION
        // ----------------------------------------------

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            return res.status(400).json({
                message:
                    "Please enter a valid email address"
            });
        }


        // ----------------------------------------------
        // SHOW ID VALIDATION
        // ----------------------------------------------

        if (
            !Number.isInteger(Number(showId)) ||
            Number(showId) <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid show ID"
            });
        }


        // ----------------------------------------------
        // SEAT ID VALIDATION
        // ----------------------------------------------

        const invalidSeat =
            seatIds.some(
                (seatId) =>
                    !Number.isInteger(
                        Number(seatId)
                    ) ||
                    Number(seatId) <= 0
            );


        if (invalidSeat) {

            return res.status(400).json({
                message:
                    "Invalid seat selection"
            });
        }


        // Convert all seat IDs to numbers
        const uniqueSeatIds =
            [
                ...new Set(
                    seatIds.map(Number)
                )
            ];


        // Reject duplicate seat IDs
        if (
            uniqueSeatIds.length !==
            seatIds.length
        ) {

            return res.status(400).json({
                message:
                    "Duplicate seats are not allowed"
            });
        }


        try {

            // Hash the password
            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // ------------------------------------------
            // CHECK WHETHER USER EXISTS
            // ------------------------------------------

            const findUserSql = `
                SELECT id
                FROM users
                WHERE email = ?
            `;


            db.query(
                findUserSql,
                [email],
                (findUserErr, users) => {

                    if (findUserErr) {

                        console.error(
                            "Error checking user:",
                            findUserErr
                        );

                        return res
                            .status(500)
                            .json({
                                message:
                                    "Failed to process booking"
                            });
                    }


                    // Existing customer
                    if (users.length > 0) {

                        createBooking(
                            users[0].id
                        );

                    } else {

                        // --------------------------------
                        // CREATE NEW CUSTOMER
                        // --------------------------------

                        const createUserSql = `
                            INSERT INTO users
                            (
                                name,
                                email,
                                password
                            )
                            VALUES (?, ?, ?)
                        `;


                        db.query(
                            createUserSql,
                            [
                                name.trim(),
                                email.trim(),
                                hashedPassword
                            ],
                            (
                                createUserErr,
                                userResult
                            ) => {

                                if (createUserErr) {

                                    console.error(
                                        "Error creating user:",
                                        createUserErr
                                    );

                                    return res
                                        .status(500)
                                        .json({
                                            message:
                                                "Failed to create customer"
                                        });
                                }


                                createBooking(
                                    userResult.insertId
                                );
                            }
                        );
                    }
                }
            );


            // ==================================================
            // CREATE BOOKING
            // ==================================================

            function createBooking(userId) {

                // ----------------------------------------------
                // CHECK WHETHER SHOW EXISTS
                // ----------------------------------------------

                const showCheckSql = `
                    SELECT id
                    FROM shows
                    WHERE id = ?
                `;


                db.query(
                    showCheckSql,
                    [showId],
                    (
                        showErr,
                        showResults
                    ) => {

                        if (showErr) {

                            console.error(
                                "Error checking show:",
                                showErr
                            );

                            return res
                                .status(500)
                                .json({
                                    message:
                                        "Failed to validate show"
                                });
                        }


                        if (
                            showResults.length === 0
                        ) {

                            return res
                                .status(404)
                                .json({
                                    message:
                                        "Selected show does not exist"
                                });
                        }


                        checkSeatsExist();
                    }
                );


                // ----------------------------------------------
                // CHECK WHETHER ALL SELECTED SEATS EXIST
                // ----------------------------------------------

                function checkSeatsExist() {

                    const seatCheckSql = `
                        SELECT id
                        FROM seats
                        WHERE id IN (?)
                    `;


                    db.query(
                        seatCheckSql,
                        [uniqueSeatIds],
                        (
                            seatCheckErr,
                            seatResults
                        ) => {

                            if (seatCheckErr) {

                                console.error(
                                    "Error checking seats:",
                                    seatCheckErr
                                );

                                return res
                                    .status(500)
                                    .json({
                                        message:
                                            "Failed to validate selected seats"
                                    });
                            }


                            if (
                                seatResults.length !==
                                uniqueSeatIds.length
                            ) {

                                return res
                                    .status(400)
                                    .json({
                                        message:
                                            "One or more selected seats do not exist"
                                    });
                            }


                            checkSeatAvailability();
                        }
                    );
                }


                // ----------------------------------------------
                // CHECK SEAT AVAILABILITY
                // ----------------------------------------------

                function checkSeatAvailability() {

                    const availabilitySql = `
                        SELECT bs.seat_id

                        FROM booking_seats bs

                        JOIN bookings b
                            ON bs.booking_id = b.id

                        WHERE b.show_id = ?

                        AND bs.seat_id IN (?)
                    `;


                    db.query(
                        availabilitySql,
                        [
                            showId,
                            uniqueSeatIds
                        ],
                        (
                            availabilityErr,
                            bookedSeats
                        ) => {

                            if (availabilityErr) {

                                console.error(
                                    "Error checking seat availability:",
                                    availabilityErr
                                );

                                return res
                                    .status(500)
                                    .json({
                                        message:
                                            "Failed to check seat availability"
                                    });
                            }


                            if (
                                bookedSeats.length > 0
                            ) {

                                return res
                                    .status(409)
                                    .json({
                                        message:
                                            "One or more selected seats are already booked"
                                    });
                            }


                            insertBooking();
                        }
                    );
                }


                // ----------------------------------------------
                // INSERT BOOKING
                // ----------------------------------------------

                function insertBooking() {

                    const bookingSql = `
                        INSERT INTO bookings
                        (
                            user_id,
                            show_id
                        )
                        VALUES (?, ?)
                    `;


                    db.query(
                        bookingSql,
                        [
                            userId,
                            showId
                        ],
                        (
                            bookingErr,
                            bookingResult
                        ) => {

                            if (bookingErr) {

                                console.error(
                                    "Error creating booking:",
                                    bookingErr
                                );

                                return res
                                    .status(500)
                                    .json({
                                        message:
                                            "Failed to create booking"
                                    });
                            }


                            const bookingId =
                                bookingResult.insertId;


                            saveBookingSeats(
                                bookingId
                            );
                        }
                    );
                }


                // ----------------------------------------------
                // SAVE BOOKED SEATS
                // ----------------------------------------------

                function saveBookingSeats(
                    bookingId
                ) {

                    const bookingSeatValues =
                        uniqueSeatIds.map(
                            (seatId) => [
                                bookingId,
                                seatId
                            ]
                        );


                    const bookingSeatsSql = `
                        INSERT INTO booking_seats
                        (
                            booking_id,
                            seat_id
                        )
                        VALUES ?
                    `;


                    db.query(
                        bookingSeatsSql,
                        [
                            bookingSeatValues
                        ],
                        (seatErr) => {

                            if (seatErr) {

                                console.error(
                                    "Error saving booked seats:",
                                    seatErr
                                );

                                return res
                                    .status(500)
                                    .json({
                                        message:
                                            "Failed to save booked seats"
                                    });
                            }


                            return res
                                .status(201)
                                .json({
                                    message:
                                        "Booking created successfully",

                                    bookingId:
                                        bookingId
                                });
                        }
                    );
                }
            }

        } catch (error) {

            console.error(
                "Booking error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Failed to process booking"
                });
        }
    }
);


// ======================================================
// ADMIN LOGIN
// ======================================================

app.post(
    "/api/admin/login",
    (req, res) => {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }


        const sql = `
            SELECT
                id,
                name,
                email,
                password,
                role

            FROM users

            WHERE email = ?
        `;


        db.query(
            sql,
            [email],
            async (err, results) => {

                if (err) {

                    console.error(
                        "Admin login error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Login failed"
                    });
                }


                if (results.length === 0) {

                    return res.status(401).json({
                        message:
                            "Invalid email or password"
                    });
                }


                const user = results[0];


                // Check role
                if (user.role !== "admin") {

                    return res.status(403).json({
                        message:
                            "Access denied"
                    });
                }


                try {

                    const passwordMatches =
                        await bcrypt.compare(
                            password,
                            user.password
                        );


                    if (!passwordMatches) {

                        return res
                            .status(401)
                            .json({
                                message:
                                    "Invalid email or password"
                            });
                    }


                    // Create JWT
                    const token = jwt.sign(
                        {
                            id: user.id,
                            role: user.role
                        },

                        process.env.JWT_SECRET,

                        {
                            expiresIn: "2h"
                        }
                    );


                    return res.json({
                        message:
                            "Admin login successful",

                        token: token,

                        admin: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    });

                } catch (error) {

                    console.error(
                        "Password comparison error:",
                        error
                    );


                    return res
                        .status(500)
                        .json({
                            message:
                                "Login failed"
                        });
                }
            }
        );
    }
);


// ======================================================
// ADMIN - ADD SHOW
// ======================================================

app.post(
    "/api/admin/shows",
    verifyAdmin,
    (req, res) => {

        const {
            title,
            description,
            show_date,
            show_time,
            price
        } = req.body;


        if (
            !title ||
            !show_date ||
            !show_time ||
            price === undefined
        ) {

            return res.status(400).json({
                message:
                    "Required show information is missing"
            });
        }


        if (!title.trim()) {

            return res.status(400).json({
                message:
                    "Show title is required"
            });
        }


        if (
            Number.isNaN(Number(price)) ||
            Number(price) < 0
        ) {

            return res.status(400).json({
                message:
                    "Ticket price must be a valid positive number"
            });
        }


        const sql = `
            INSERT INTO shows
            (
                title,
                description,
                show_date,
                show_time,
                price
            )

            VALUES (?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                title.trim(),
                description
                    ? description.trim()
                    : "",
                show_date,
                show_time,
                Number(price)
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Error adding show:",
                        err
                    );


                    return res.status(500).json({
                        message:
                            "Failed to add show"
                    });
                }


                return res.status(201).json({
                    message:
                        "Show added successfully",

                    showId:
                        result.insertId
                });
            }
        );
    }
);


// ======================================================
// ADMIN - UPDATE SHOW
// ======================================================

app.put(
    "/api/admin/shows/:id",
    verifyAdmin,
    (req, res) => {

        const showId =
            req.params.id;


        const {
            title,
            description,
            show_date,
            show_time,
            price
        } = req.body;


        if (
            !Number.isInteger(Number(showId)) ||
            Number(showId) <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid show ID"
            });
        }


        if (
            !title ||
            !show_date ||
            !show_time ||
            price === undefined
        ) {

            return res.status(400).json({
                message:
                    "Required show information is missing"
            });
        }


        if (!title.trim()) {

            return res.status(400).json({
                message:
                    "Show title is required"
            });
        }


        if (
            Number.isNaN(Number(price)) ||
            Number(price) < 0
        ) {

            return res.status(400).json({
                message:
                    "Ticket price must be a valid positive number"
            });
        }


        const sql = `
            UPDATE shows

            SET
                title = ?,
                description = ?,
                show_date = ?,
                show_time = ?,
                price = ?

            WHERE id = ?
        `;


        db.query(
            sql,
            [
                title.trim(),
                description
                    ? description.trim()
                    : "",
                show_date,
                show_time,
                Number(price),
                showId
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Error updating show:",
                        err
                    );


                    return res.status(500).json({
                        message:
                            "Failed to update show"
                    });
                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Show not found"
                    });
                }


                return res.json({
                    message:
                        "Show updated successfully"
                });
            }
        );
    }
);


// ======================================================
// ADMIN - DELETE SHOW
// ======================================================

app.delete(
    "/api/admin/shows/:id",
    verifyAdmin,
    (req, res) => {

        const showId =
            req.params.id;


        if (
            !Number.isInteger(Number(showId)) ||
            Number(showId) <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid show ID"
            });
        }


        const sql = `
            DELETE FROM shows
            WHERE id = ?
        `;


        db.query(
            sql,
            [showId],
            (err, result) => {

                if (err) {

                    console.error(
                        "Error deleting show:",
                        err
                    );


                    if (
                        err.code ===
                        "ER_ROW_IS_REFERENCED_2"
                    ) {

                        return res
                            .status(409)
                            .json({
                                message:
                                    "This show cannot be deleted because it already has bookings."
                            });
                    }


                    return res
                        .status(500)
                        .json({
                            message:
                                "Failed to delete show"
                        });
                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Show not found"
                    });
                }


                return res.json({
                    message:
                        "Show deleted successfully"
                });
            }
        );
    }
);


// ======================================================
// ADMIN - GET ALL BOOKINGS
// ======================================================

app.get(
    "/api/admin/bookings",
    verifyAdmin,
    (req, res) => {

        const sql = `
            SELECT

                b.id AS booking_id,

                b.booking_date,

                u.name AS customer_name,

                u.email AS customer_email,

                s.title AS show_title,

                s.show_date,

                s.show_time,

                GROUP_CONCAT(
                    st.seat_number
                    ORDER BY st.id
                    SEPARATOR ', '
                ) AS seats

            FROM bookings b

            JOIN users u
                ON b.user_id = u.id

            JOIN shows s
                ON b.show_id = s.id

            JOIN booking_seats bs
                ON b.id = bs.booking_id

            JOIN seats st
                ON bs.seat_id = st.id

            GROUP BY

                b.id,

                b.booking_date,

                u.name,

                u.email,

                s.title,

                s.show_date,

                s.show_time

            ORDER BY
                b.booking_date DESC;
        `;


        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.error(
                        "Error fetching bookings:",
                        err
                    );


                    return res
                        .status(500)
                        .json({
                            message:
                                "Failed to fetch bookings"
                        });
                }


                return res.json(results);
            }
        );
    }
);


// ======================================================
// START SERVER
// ======================================================

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );
    }
);