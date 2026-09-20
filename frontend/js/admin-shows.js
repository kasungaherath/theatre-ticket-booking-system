const adminData = sessionStorage.getItem("admin");

if (!adminData) {
    window.location.href = "/admin-login.html";
}

const showForm = document.getElementById("show-form");

const showIdInput = document.getElementById("show-id");
const titleInput = document.getElementById("show-title");
const descriptionInput =
    document.getElementById("show-description");

const dateInput = document.getElementById("show-date");
const timeInput = document.getElementById("show-time");
const priceInput = document.getElementById("show-price");

const formTitle = document.getElementById("form-title");
const saveButton =
    document.getElementById("save-show-btn");

const cancelEditButton =
    document.getElementById("cancel-edit-btn");

const showMessage =
    document.getElementById("show-message");

const showsContainer =
    document.getElementById("admin-shows-container");

const logoutButton =
    document.getElementById("logout-btn");

let currentShows = [];

document.addEventListener("DOMContentLoaded", () => {
    loadShows();
});

logoutButton.addEventListener("click", (event) => {
    event.preventDefault();

    sessionStorage.removeItem("admin");

    window.location.href = "/admin-login.html";
});

async function loadShows() {
    showsContainer.innerHTML =
        "<p>Loading shows...</p>";

    try {
        const response = await fetch("/api/shows");

        if (!response.ok) {
            throw new Error("Failed to load shows");
        }

        currentShows = await response.json();

        displayShows();

    } catch (error) {
        console.error("Error loading shows:", error);

        showsContainer.innerHTML =
            "<p>Unable to load shows.</p>";
    }
}

function displayShows() {
    showsContainer.innerHTML = "";

    if (currentShows.length === 0) {
        showsContainer.innerHTML =
            "<p>No shows available.</p>";

        return;
    }

    currentShows.forEach((show) => {
        const card = document.createElement("div");

        card.classList.add("admin-show-item");

        const showDate = new Date(show.show_date);

        const formattedDate =
            showDate.toLocaleDateString();

        card.innerHTML = `
            <div>
                <h3>${show.title}</h3>

                <p>
                    ${show.description || "No description"}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${formattedDate}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${show.show_time}
                </p>

                <p>
                    <strong>Price:</strong>
                    Rs. ${Number(show.price).toFixed(2)}
                </p>
            </div>

            <div class="admin-show-actions">

                <button
                    class="edit-btn"
                    onclick="startEdit(${show.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteShow(${show.id})"
                >
                    Delete
                </button>

            </div>
        `;

        showsContainer.appendChild(card);
    });
}

showForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const showData = {
            title: titleInput.value.trim(),

            description:
                descriptionInput.value.trim(),

            show_date:
                dateInput.value,

            show_time:
                timeInput.value,

            price:
                Number(priceInput.value)
        };

        const showId = showIdInput.value;

        try {

            let response;

            if (showId) {
                response = await fetch(
                    `/api/admin/shows/${showId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(showData)
                    }
                );
            } else {
                response = await fetch(
                    "/api/admin/shows",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(showData)
                    }
                );
            }

            const result =
                await response.json();

            if (!response.ok) {
                showMessage.textContent =
                    result.message ||
                    "Unable to save show";

                return;
            }

            showMessage.textContent =
                result.message;

            resetForm();

            await loadShows();

        } catch (error) {
            console.error(
                "Error saving show:",
                error
            );

            showMessage.textContent =
                "Unable to save show.";
        }
    }
);

function startEdit(showId) {
    const show = currentShows.find(
        (item) => item.id === showId
    );

    if (!show) {
        return;
    }

    showIdInput.value = show.id;

    titleInput.value =
        show.title;

    descriptionInput.value =
        show.description || "";

    const date =
        new Date(show.show_date);

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    dateInput.value =
        `${year}-${month}-${day}`;

    timeInput.value =
        show.show_time.substring(0, 5);

    priceInput.value =
        Number(show.price);

    formTitle.textContent =
        "Edit Show";

    saveButton.textContent =
        "Update Show";

    cancelEditButton.style.display =
        "inline-block";

    showMessage.textContent = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

cancelEditButton.addEventListener(
    "click",
    () => {
        resetForm();

        showMessage.textContent =
            "Edit cancelled.";
    }
);

function resetForm() {
    showForm.reset();

    showIdInput.value = "";

    formTitle.textContent =
        "Add New Show";

    saveButton.textContent =
        "Add Show";

    cancelEditButton.style.display =
        "none";
}

async function deleteShow(showId) {
    const confirmed =
        confirm(
            "Are you sure you want to delete this show?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/admin/shows/${showId}`,
                {
                    method: "DELETE"
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            alert(
                result.message ||
                "Unable to delete show"
            );

            return;
        }

        alert(result.message);

        await loadShows();

    } catch (error) {
        console.error(
            "Error deleting show:",
            error
        );

        alert("Unable to delete show.");
    }
}