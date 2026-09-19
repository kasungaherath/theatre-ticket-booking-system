const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Theatre Ticket Booking System API is running!");
});

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
app.get("/api/shows", (req, res) => {
    const sql = "SELECT * FROM shows ORDER BY show_date, show_time";

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
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});