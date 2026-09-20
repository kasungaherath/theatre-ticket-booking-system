require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("./db");

const adminName = "System Admin";
const adminEmail = "admin@theatre.com";
const adminPassword = "Admin123";

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const sql = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                adminName,
                adminEmail,
                hashedPassword,
                "admin"
            ],
            (err, result) => {
                if (err) {
                    console.error("Error creating admin:", err);
                    process.exit(1);
                }

                console.log("Admin account created successfully.");
                console.log("Admin ID:", result.insertId);

                process.exit(0);
            }
        );

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

createAdmin();