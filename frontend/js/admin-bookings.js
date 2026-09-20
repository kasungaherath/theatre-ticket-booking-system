const adminData =
    sessionStorage.getItem("admin");

if (!adminData) {
    window.location.href =
        "/admin-login.html";
}

const bookingsContainer =
    document.getElementById(
        "bookings-container"
    );

const logoutButton =
    document.getElementById(
        "logout-btn"
    );

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadBookings();
    }
);

logoutButton.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        sessionStorage.removeItem(
            "admin"
        );

        window.location.href =
            "/admin-login.html";
    }
);

async function loadBookings() {

    bookingsContainer.innerHTML =
        "<p>Loading bookings...</p>";

    try {

        const response = await fetch(
            "/api/admin/bookings"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch bookings"
            );
        }

        const bookings =
            await response.json();

        displayBookings(bookings);

    } catch (error) {

        console.error(
            "Error loading bookings:",
            error
        );

        bookingsContainer.innerHTML =
            "<p>Unable to load bookings.</p>";
    }
}

function displayBookings(bookings) {

    bookingsContainer.innerHTML = "";

    if (bookings.length === 0) {

        bookingsContainer.innerHTML =
            "<p>No bookings found.</p>";

        return;
    }

    bookings.forEach((booking) => {

        const bookingCard =
            document.createElement("div");

        bookingCard.classList.add(
            "admin-booking-card"
        );

        const showDate =
            new Date(
                booking.show_date
            );

        const formattedShowDate =
            showDate.toLocaleDateString();

        const bookingDate =
            new Date(
                booking.booking_date
            );

        const formattedBookingDate =
            bookingDate.toLocaleString();

        bookingCard.innerHTML = `
            <div class="booking-card-header">

                <h3>
                    Booking #${booking.booking_id}
                </h3>

                <span>
                    ${formattedBookingDate}
                </span>

            </div>

            <div class="booking-details-grid">

                <div>
                    <strong>
                        Customer
                    </strong>

                    <p>
                        ${booking.customer_name}
                    </p>
                </div>

                <div>
                    <strong>
                        Email
                    </strong>

                    <p>
                        ${booking.customer_email}
                    </p>
                </div>

                <div>
                    <strong>
                        Show
                    </strong>

                    <p>
                        ${booking.show_title}
                    </p>
                </div>

                <div>
                    <strong>
                        Show Date
                    </strong>

                    <p>
                        ${formattedShowDate}
                    </p>
                </div>

                <div>
                    <strong>
                        Show Time
                    </strong>

                    <p>
                        ${booking.show_time}
                    </p>
                </div>

                <div>
                    <strong>
                        Seats
                    </strong>

                    <p>
                        ${booking.seats}
                    </p>
                </div>

            </div>
        `;

        bookingsContainer.appendChild(
            bookingCard
        );
    });
}