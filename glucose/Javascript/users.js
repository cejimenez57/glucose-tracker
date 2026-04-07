document.addEventListener("DOMContentLoaded", () => {
    const userBoxes = document.querySelectorAll(".user-box");

    userBoxes.forEach(box => {
        box.addEventListener("click", () => {
            const selectedUser = box.getAttribute("data-user");

            // Save selected user
            localStorage.setItem("currentUser", selectedUser);

            // Go to months page
            window.location.href = "months.html";
        });
    });
});
``