const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// TEST DATABASE CONNECTION

app.get("/api/test-db", (req, res) => {
    db.query("SELECT NOW() AS currentTime", (err, results) => {
        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        res.json({
            message: "Database connected successfully",
            databaseTime: results[0].currentTime
        });
    });
});

// GET ALL SHOWS

app.get("/api/shows", (req, res) => {
    const sql = `
        SELECT *
        FROM shows
        ORDER BY show_date, show_time
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching shows:", err);

            return res.status(500).json({
                message: "Failed to fetch shows"
            });
        }

        res.json(results);
    });
});

// GET SEATS FOR A SPECIFIC SHOW

app.get("/api/shows/:showId/seats", (req, res) => {
    const showId = req.params.showId;

    const sql = `
        SELECT
            s.id,
            s.seat_number,
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM booking_seats bs
                    JOIN bookings b
                        ON bs.booking_id = b.id
                    WHERE bs.seat_id = s.id
                    AND b.show_id = ?
                )
                THEN 'booked'
                ELSE 'available'
            END AS status
        FROM seats s
        ORDER BY s.id;
    `;

    db.query(sql, [showId], (err, results) => {
        if (err) {
            console.error("Error fetching seats:", err);

            return res.status(500).json({
                message: "Failed to fetch seats"
            });
        }

        res.json(results);
    });
});

app.post("/api/bookings", async (req, res) => {
    const { name, email, password, showId, seatIds } = req.body;

    if (!name || !email || !password || !showId || !seatIds || seatIds.length === 0) {
        return res.status(400).json({
            message: "All booking details are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const findUserSql = `
            SELECT id
            FROM users
            WHERE email = ?
        `;

        db.query(findUserSql, [email], (findUserErr, users) => {
            if (findUserErr) {
                console.error("Error checking user:", findUserErr);

                return res.status(500).json({
                    message: "Failed to process booking"
                });
            }

            if (users.length > 0) {
                createBooking(users[0].id);
            } else {
                const createUserSql = `
                    INSERT INTO users (name, email, password)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    createUserSql,
                    [name, email, hashedPassword],
                    (createUserErr, userResult) => {
                        if (createUserErr) {
                            console.error("Error creating user:", createUserErr);

                            return res.status(500).json({
                                message: "Failed to create customer"
                            });
                        }

                        createBooking(userResult.insertId);
                    }
                );
            }
        });

        function createBooking(userId) {
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
                [showId, seatIds],
                (availabilityErr, bookedSeats) => {
                    if (availabilityErr) {
                        console.error("Error checking seat availability:", availabilityErr);

                        return res.status(500).json({
                            message: "Failed to check seat availability"
                        });
                    }

                    if (bookedSeats.length > 0) {
                        return res.status(409).json({
                            message: "One or more selected seats are already booked"
                        });
                    }

                    const bookingSql = `
                        INSERT INTO bookings (user_id, show_id)
                        VALUES (?, ?)
                    `;

                    db.query(
                        bookingSql,
                        [userId, showId],
                        (bookingErr, bookingResult) => {
                            if (bookingErr) {
                                console.error("Error creating booking:", bookingErr);

                                return res.status(500).json({
                                    message: "Failed to create booking"
                                });
                            }

                            const bookingId = bookingResult.insertId;

                            const bookingSeatValues = seatIds.map((seatId) => [
                                bookingId,
                                seatId
                            ]);

                            const bookingSeatsSql = `
                                INSERT INTO booking_seats (booking_id, seat_id)
                                VALUES ?
                            `;

                            db.query(
                                bookingSeatsSql,
                                [bookingSeatValues],
                                (seatErr) => {
                                    if (seatErr) {
                                        console.error("Error saving booked seats:", seatErr);

                                        return res.status(500).json({
                                            message: "Failed to save booked seats"
                                        });
                                    }

                                    res.status(201).json({
                                        message: "Booking created successfully",
                                        bookingId: bookingId
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    } catch (error) {
        console.error("Booking error:", error);

        res.status(500).json({
            message: "Failed to process booking"
        });
    }
});

// START SERVER

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});