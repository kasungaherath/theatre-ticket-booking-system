const urlParams = new URLSearchParams(window.location.search);

const showId = urlParams.get("showId");
const seatIdsParam = urlParams.get("seatIds");
const seatNumbersParam = urlParams.get("seatNumbers");

const summaryShowId = document.getElementById("summary-show-id");
const summarySeats = document.getElementById("summary-seats");
const customerForm = document.getElementById("customer-form");

const seatIds = seatIdsParam
    ? seatIdsParam.split(",").map(Number)
    : [];

const seatNumbers = seatNumbersParam
    ? seatNumbersParam.split(",")
    : [];

// Show selected booking information on the page
summaryShowId.textContent = showId || "Not selected";

summarySeats.textContent =
    seatNumbers.length > 0
        ? seatNumbers.join(", ")
        : "No seats selected";

// Handle booking form submission
customerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Basic validation
    if (!showId) {
        alert("No show was selected.");
        return;
    }

    if (seatIds.length === 0) {
        alert("No seats were selected.");
        return;
    }

    if (!name || !email || !password) {
        alert("Please fill in all customer details.");
        return;
    }

    const bookingData = {
        name: name,
        email: email,
        password: password,
        showId: Number(showId),
        seatIds: seatIds
    };

    console.log("Sending booking:", bookingData);

    try {
        const response = await fetch("/api/bookings", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        console.log("Booking response:", result);
        console.log("HTTP status:", response.status);

        // If backend returned an error
        if (!response.ok) {
            alert(result.message || "Booking failed.");
            return;
        }

        // Make sure the backend returned a booking ID
        if (!result.bookingId) {
            alert(
                "Booking was created, but no booking ID was returned."
            );
            return;
        }

        // Go to booking confirmation page
        window.location.href =
            `/booking-confirmation.html?bookingId=${result.bookingId}`;

    } catch (error) {
        console.error("Booking request error:", error);

        alert(
            "Unable to complete the booking. Please try again."
        );
    }
});