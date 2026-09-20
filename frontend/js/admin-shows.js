const adminData =
    sessionStorage.getItem("admin");

const adminToken =
    sessionStorage.getItem("adminToken");


if (!adminData || !adminToken) {

    window.location.href =
        "/admin-login.html";
}


// ======================================================
// ELEMENTS
// ======================================================

const showForm =
    document.getElementById(
        "show-form"
    );

const showIdInput =
    document.getElementById(
        "show-id"
    );

const titleInput =
    document.getElementById(
        "show-title"
    );

const descriptionInput =
    document.getElementById(
        "show-description"
    );

const dateInput =
    document.getElementById(
        "show-date"
    );

const timeInput =
    document.getElementById(
        "show-time"
    );

const priceInput =
    document.getElementById(
        "show-price"
    );

const formTitle =
    document.getElementById(
        "form-title"
    );

const saveButton =
    document.getElementById(
        "save-show-btn"
    );

const cancelEditButton =
    document.getElementById(
        "cancel-edit-btn"
    );

const showMessage =
    document.getElementById(
        "show-message"
    );

const showsContainer =
    document.getElementById(
        "admin-shows-container"
    );

const logoutButton =
    document.getElementById(
        "logout-btn"
    );


let currentShows = [];


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadShows();

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
// LOAD SHOWS
// ======================================================

async function loadShows() {

    showsContainer.innerHTML =
        "<p>Loading shows...</p>";


    try {

        const response =
            await fetch(
                "/api/shows"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load shows"
            );

        }


        currentShows =
            await response.json();


        displayShows();

    } catch (error) {

        console.error(
            "Error loading shows:",
            error
        );


        showsContainer.innerHTML =
            "<p>Unable to load shows.</p>";
    }
}


// ======================================================
// DISPLAY SHOWS
// ======================================================

function displayShows() {

    showsContainer.innerHTML = "";


    if (currentShows.length === 0) {

        showsContainer.innerHTML =
            "<p>No shows available.</p>";

        return;
    }


    currentShows.forEach(
        (show) => {

            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "admin-show-item"
            );


            const showDate =
                new Date(
                    show.show_date
                );


            const formattedDate =
                showDate
                    .toLocaleDateString();


            card.innerHTML = `
                <div>

                    <h3>
                        ${show.title}
                    </h3>

                    <p>
                        ${
                            show.description ||
                            "No description"
                        }
                    </p>

                    <p>
                        <strong>
                            Date:
                        </strong>

                        ${formattedDate}
                    </p>

                    <p>
                        <strong>
                            Time:
                        </strong>

                        ${show.show_time}
                    </p>

                    <p>
                        <strong>
                            Price:
                        </strong>

                        Rs. ${
                            Number(
                                show.price
                            ).toFixed(2)
                        }
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


            showsContainer
                .appendChild(
                    card
                );
        }
    );
}


// ======================================================
// ADD OR UPDATE SHOW
// ======================================================

showForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const showData = {

            title:
                titleInput
                    .value
                    .trim(),

            description:
                descriptionInput
                    .value
                    .trim(),

            show_date:
                dateInput.value,

            show_time:
                timeInput.value,

            price:
                Number(
                    priceInput.value
                )
        };


        // Basic validation
        if (
            !showData.title ||
            !showData.show_date ||
            !showData.show_time ||
            Number.isNaN(
                showData.price
            )
        ) {

            showMessage.textContent =
                "Please complete all required fields.";

            return;
        }


        const showId =
            showIdInput.value;


        try {

            let response;


            // ------------------------------------------
            // UPDATE EXISTING SHOW
            // ------------------------------------------

            if (showId) {

                response =
                    await fetch(
                        `/api/admin/shows/${showId}`,
                        {
                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${adminToken}`
                            },

                            body:
                                JSON.stringify(
                                    showData
                                )
                        }
                    );

            } else {

                // --------------------------------------
                // ADD NEW SHOW
                // --------------------------------------

                response =
                    await fetch(
                        "/api/admin/shows",
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${adminToken}`
                            },

                            body:
                                JSON.stringify(
                                    showData
                                )
                        }
                    );
            }


            const result =
                await response.json();


            // Admin session expired
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


// ======================================================
// START EDIT
// ======================================================

function startEdit(showId) {

    const show =
        currentShows.find(
            (item) =>
                item.id === showId
        );


    if (!show) {
        return;
    }


    showIdInput.value =
        show.id;


    titleInput.value =
        show.title;


    descriptionInput.value =
        show.description || "";


    // Format date for HTML date input
    const date =
        new Date(
            show.show_date
        );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.value =
        `${year}-${month}-${day}`;


    timeInput.value =
        show.show_time
            .substring(
                0,
                5
            );


    priceInput.value =
        Number(
            show.price
        );


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


// ======================================================
// CANCEL EDIT
// ======================================================

cancelEditButton.addEventListener(
    "click",
    () => {

        resetForm();


        showMessage.textContent =
            "Edit cancelled.";
    }
);


// ======================================================
// RESET FORM
// ======================================================

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


// ======================================================
// DELETE SHOW
// ======================================================

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
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }
                }
            );


        const result =
            await response.json();


        // Token expired
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

            alert(
                result.message ||
                "Unable to delete show"
            );

            return;
        }


        alert(
            result.message
        );


        await loadShows();

    } catch (error) {

        console.error(
            "Error deleting show:",
            error
        );


        alert(
            "Unable to delete show."
        );
    }
}