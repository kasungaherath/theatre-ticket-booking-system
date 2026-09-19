document.addEventListener("DOMContentLoaded", () => {
    loadShows();
});

function loadShows() {
    const showsContainer = document.getElementById("shows-container");

    showsContainer.innerHTML = "<p>Loading shows...</p>";

    fetch("/api/shows")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch shows");
            }

            return response.json();
        })
        .then((shows) => {
            displayShows(shows);
        })
        .catch((error) => {
            console.error("Error loading shows:", error);

            showsContainer.innerHTML =
                "<p>Unable to load shows. Please try again later.</p>";
        });
}

function displayShows(shows) {
    const showsContainer = document.getElementById("shows-container");

    showsContainer.innerHTML = "";

    if (shows.length === 0) {
        showsContainer.innerHTML = "<p>No shows are currently available.</p>";
        return;
    }

    shows.forEach((show) => {
        const showCard = document.createElement("div");

        showCard.classList.add("show-card");

        const showDate = new Date(show.show_date);

        const formattedDate = showDate.toLocaleDateString();

        showCard.innerHTML = `
            <h3>${show.title}</h3>

            <p class="show-description">
                ${show.description || "No description available."}
            </p>

            <p>
                <strong>Date:</strong> ${formattedDate}
            </p>

            <p>
                <strong>Time:</strong> ${show.show_time}
            </p>

            <p class="show-price">
                Rs. ${Number(show.price).toFixed(2)}
            </p>

            <button
                class="book-btn"
                onclick="selectShow(${show.id})"
            >
                Book Tickets
            </button>
        `;

        showsContainer.appendChild(showCard);
    });
}

function selectShow(showId) {
    console.log("Selected show ID:", showId);

    alert(`You selected show ${showId}. Seat selection will be added next.`);
}