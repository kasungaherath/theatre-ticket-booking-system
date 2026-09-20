const adminData =
    sessionStorage.getItem("admin");

const adminToken =
    sessionStorage.getItem("adminToken");


if (!adminData || !adminToken) {

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


// ======================================================
// LOGOUT
// ======================================================

logoutButton.addEventListener(
    "click",
    (event) => {

        event.preventDefault();


        sessionStorage.removeItem(
            "admin"
        );

        sessionStorage.removeItem(
            "adminToken"
        );


        window.location.href =
            "/admin-login.html";
    }
);


// ======================================================
// LOAD BOOKINGS
// ======================================================

async function loadBookings() {

    bookingsContainer.innerHTML =
        "<p>Loading bookings...</p>";


    try {

        const response =
            await fetch(
                "/api/admin/bookings",
                {
                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }
                }
            );


        const result =
            await response.json();


        // Token expired or invalid
        if (
            response.status === 401 ||
            response.status === 403
        ) {

            sessionStorage.removeItem(
                "admin"
            );

            sessionStorage.removeItem(
                "adminToken"
            );


            alert(
                result.message ||
                "Your admin session has expired."
            );


            window.location.href =
                "/admin-login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to fetch bookings"
            );

        }


        displayBookings(result);

    } catch (error) {

        console.error(
            "Error loading bookings:",
            error
        );


        bookingsContainer.innerHTML =
            "<p>Unable to load bookings.</p>";
    }
}


// ======================================================
// DISPLAY BOOKINGS
// ======================================================

function displayBookings(bookings) {

    bookingsContainer.innerHTML = "";


    if (bookings.length === 0) {

        bookingsContainer.innerHTML =
            "<p>No bookings found.</p>";

        return;
    }


    bookings.forEach(
        (booking) => {

            const bookingCard =
                document.createElement(
                    "div"
                );


            bookingCard.classList.add(
                "admin-booking-card"
            );


            // Format show date
            const showDate =
                new Date(
                    booking.show_date
                );


            const formattedShowDate =
                showDate
                    .toLocaleDateString();


            // Format booking date
            const bookingDate =
                new Date(
                    booking.booking_date
                );


            const formattedBookingDate =
                bookingDate
                    .toLocaleString();


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


            bookingsContainer
                .appendChild(
                    bookingCard
                );
        }
    );
}