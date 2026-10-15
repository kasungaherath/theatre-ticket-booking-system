document.addEventListener("DOMContentLoaded", () => {
    loadShows();
});

function loadShows() {
    const showsContainer = document.getElementById("shows-container");

    showsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading upcoming shows...</p>
        </div>
    `;

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
                "<p class='error-message'>Unable to load shows. Please try again later.</p>";
        });
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function displayShows(shows) {
    const showsContainer = document.getElementById("shows-container");

    showsContainer.innerHTML = "";

    if (shows.length === 0) {
        showsContainer.innerHTML = "<p>No shows are currently available.</p>";
        return;
    }

    shows.forEach((show) => {
        const showCard = document.createElement("article");
        showCard.classList.add("show-card");
        showCard.setAttribute("data-show-id", show.id);

        const showDate = new Date(show.show_date);
        const formattedDate = showDate.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        // Never use another movie's artwork as a fallback.
        const posterUrl = show.poster_url || "";

        showCard.innerHTML = `
            <img class="show-card-bg" alt="" loading="lazy" decoding="async">
            <div class="show-card-overlay"></div>
            <div class="show-card-content">
                <div class="show-card-top">
                    <span class="show-badge">Cinema</span>
                </div>

                <div class="show-card-body">
                    <h3 class="show-title">${escapeHtml(show.title)}</h3>

                    <p class="show-description">
                        ${escapeHtml(show.description || "Experience this cinematic production in high fidelity sound and projection.")}
                    </p>

                    <div class="show-meta-tags">
                        <span class="meta-tag date-tag">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${formattedDate}
                        </span>

                        <span class="meta-tag time-tag">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${show.show_time.substring(0, 5)}
                        </span>
                    </div>
                </div>

                <div class="show-card-footer">
                    <div class="show-price-box">
                        <span class="price-label">Ticket Price</span>
                        <span class="show-price">Rs. ${Number(show.price).toFixed(2)}</span>
                    </div>

                    <button
                        type="button"
                        class="book-btn"
                        onclick="selectShow(${show.id})"
                        aria-label="Book tickets for ${escapeHtml(show.title)}"
                    >
                        <span>Book Tickets</span>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const poster = showCard.querySelector(".show-card-bg");
        poster.addEventListener("error", () => { poster.hidden = true; });
        try {
            const url = new URL(posterUrl, window.location.href);
            if (posterUrl && ["http:", "https:"].includes(url.protocol)) poster.src = url.href;
            else poster.hidden = true;
        } catch {
            poster.hidden = true;
        }
        showsContainer.appendChild(showCard);
    });
}

function selectShow(showId) {
    window.location.href = `seat-selection.html?showId=${showId}`;
}
