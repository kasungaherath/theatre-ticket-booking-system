const urlParams = new URLSearchParams(window.location.search);

const bookingId = urlParams.get("bookingId");

const bookingIdElement = document.getElementById("booking-id");

if (bookingId) {
    bookingIdElement.textContent = bookingId;
} else {
    bookingIdElement.textContent = "Not available";
}