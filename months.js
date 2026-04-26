// ========= Storage Helpers =========

function getStorageKey(user, month) {
    return `glucose:${user}:${month}`;
}

async function loadMonthAverage(user, month) {
    try {
        const res = await fetch(`https://glucose-tracker-api-vpm0.onrender.com/api/users/${user}/months/${month}/entries`);
        const data = await res.json();

        return data.average ?? null;
    } catch (error) {
        console.error(`Error loading ${month}`, error);
        return null;
    }
}

// ========= Page Logic =========

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("currentUser");

    // ----- Safety Check -----
    if (!user) {
        window.location.href = "users.html";
        return;
    }

    // ----- Update Page Title -----
    const title = document.getElementById("months-title");
    if (title) {
        title.textContent = `${user}'s Monthly Overview`;
    }

    // ----- Populate Monthly Averages -----
document.querySelectorAll(".month-card").forEach(async card => {
    const month = card.dataset.month;
    const averageSpan = card.querySelector(".month-average");

    if (!averageSpan) {
        console.warn(`Missing .month-average span for ${month}`);
        return;
    }

    const avg = await loadMonthAverage(user, month);

    if (avg === null) {
        averageSpan.textContent = "Avg: N/A";
    } else {
        averageSpan.textContent = `Avg: ${avg}`;
    }
});

    // ----- Month Navigation -----
    document.querySelectorAll(".month-card").forEach(card => {
        card.addEventListener("click", () => {
            const selectedMonth = card.dataset.month;
            localStorage.setItem("currentMonth", selectedMonth);
            window.location.href = "month_detail.html";
        });
    });

    // ----- Back to Users -----
    const backButton = document.getElementById("back-to-users");
    if (backButton) {
        backButton.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("currentMonth");
            window.location.href = "users.html";
        });
    }
});
``