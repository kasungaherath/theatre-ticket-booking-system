const urlParams = new URLSearchParams(window.location.search);
const showId = urlParams.get("showId");

const showInfo = document.getElementById("show-info");
const seatsContainer = document.getElementById("seats-container");
const selectedSeatsText = document.getElementById("selected-seats");
const totalPriceText = document.getElementById("total-price");
const continueButton = document.getElementById("continue-btn");

let selectedSeats = [];
let ticketPrice = 0;

document.addEventListener("DOMContentLoaded", () => {
    if (!showId) {
        showInfo.textContent = "No show selected.";
        seatsContainer.innerHTML = "<p>Unable to load seats.</p>";
        return;
    }

    loadShowDetails();
    loadSeats();
});

function loadShowDetails() {
    fetch("/api/shows")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch shows");
            }

            return response.json();
        })
        .then((shows) => {
            const selectedShow = shows.find(
                (show) => String(show.id) === String(showId)
            );

            if (!selectedShow) {
                showInfo.textContent = "Show not found.";
                return;
            }

            ticketPrice = Number(selectedShow.price);

            const showDate = new Date(selectedShow.show_date);
            const formattedDate = showDate.toLocaleDateString();

            showInfo.textContent =
                `${selectedShow.title} | ${formattedDate} | ${selectedShow.show_time} | Rs. ${ticketPrice.toFixed(2)} per seat`;
        })
        .catch((error) => {
            console.error("Error loading show:", error);
            showInfo.textContent = "Unable to load show information.";
        });
}

function loadSeats() {
    seatsContainer.innerHTML = "<p>Loading seats...</p>";

    fetch(`/api/shows/${showId}/seats`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch seats");
            }

            return response.json();
        })
        .then((seats) => {
            displaySeats(seats);
        })
        .catch((error) => {
            console.error("Error loading seats:", error);
            seatsContainer.innerHTML =
                "<p>Unable to load seats. Please try again later.</p>";
        });
}

function displaySeats(seats) {
    seatsContainer.innerHTML = "";

    seats.forEach((seat) => {
        const seatButton = document.createElement("button");

        seatButton.textContent = seat.seat_number;

        seatButton.classList.add("seat");
        seatButton.classList.add(seat.status);

        seatButton.dataset.seatId = seat.id;
        seatButton.dataset.seatNumber = seat.seat_number;

        if (seat.status === "booked") {
            seatButton.disabled = true;
        } else {
            seatButton.addEventListener("click", () => {
                toggleSeat(seatButton);
            });
        }

        seatsContainer.appendChild(seatButton);
    });
}

function toggleSeat(seatButton) {
    const seatId = Number(seatButton.dataset.seatId);
    const seatNumber = seatButton.dataset.seatNumber;

    const existingSeatIndex = selectedSeats.findIndex(
        (seat) => seat.id === seatId
    );

    if (existingSeatIndex === -1) {
        selectedSeats.push({
            id: seatId,
            seat_number: seatNumber
        });

        seatButton.classList.remove("available");
        seatButton.classList.add("selected");
    } else {
        selectedSeats.splice(existingSeatIndex, 1);

        seatButton.classList.remove("selected");
        seatButton.classList.add("available");
    }

    updateBookingSummary();
}

function updateBookingSummary() {
    if (selectedSeats.length === 0) {
        selectedSeatsText.textContent = "None";
        totalPriceText.textContent = "0.00";
        continueButton.disabled = true;
        return;
    }

    const seatNumbers = selectedSeats.map(
        (seat) => seat.seat_number
    );

    selectedSeatsText.textContent = seatNumbers.join(", ");

    const totalPrice = selectedSeats.length * ticketPrice;

    totalPriceText.textContent = totalPrice.toFixed(2);

    continueButton.disabled = false;
}
continueButton.addEventListener("click", () => {
    if (selectedSeats.length === 0) {
        return;
    }

    const seatIds = selectedSeats.map(
        (seat) => seat.id
    );

    const seatNumbers = selectedSeats.map(
        (seat) => seat.seat_number
    );

    const url =
        `customer-details.html?showId=${showId}` +
        `&seatIds=${seatIds.join(",")}` +
        `&seatNumbers=${encodeURIComponent(seatNumbers.join(","))}`;

    window.location.href = url;
});