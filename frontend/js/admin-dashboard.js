const adminData = sessionStorage.getItem("admin");

if (!adminData) {
    window.location.href = "/admin-login.html";
} else {
    const admin = JSON.parse(adminData);

    document.getElementById("admin-name").textContent =
        admin.name;
}

const logoutButton =
    document.getElementById("logout-btn");

logoutButton.addEventListener("click", (event) => {
    event.preventDefault();

    sessionStorage.removeItem("admin");

    window.location.href = "/admin-login.html";
});