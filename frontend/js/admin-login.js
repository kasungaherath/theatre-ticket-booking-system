const adminLoginForm =
    document.getElementById("admin-login-form");

const loginMessage =
    document.getElementById("login-message");

adminLoginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            document
                .getElementById("admin-email")
                .value
                .trim();

        const password =
            document
                .getElementById("admin-password")
                .value;

        loginMessage.textContent =
            "Logging in...";

        try {

            const response =
                await fetch(
                    "/api/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                loginMessage.textContent =
                    result.message ||
                    "Login failed";

                return;
            }


            // Save admin information
            sessionStorage.setItem(
                "admin",
                JSON.stringify(
                    result.admin
                )
            );


            // Save JWT token
            sessionStorage.setItem(
                "adminToken",
                result.token
            );


            // Go to dashboard
            window.location.href =
                "/admin-dashboard.html";

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            loginMessage.textContent =
                "Unable to login. Please try again.";
        }
    }
);