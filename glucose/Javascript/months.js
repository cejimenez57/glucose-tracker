// ========= Storage Helpers =========

function getStorageKey(user, month) {
    return `glucose:${user}:${month}`;
}

function loadMonthAverage(user, month) {
    const key = getStorageKey(user, month);
    const stored = localStorage.getItem(key);

    if (!stored) {
        return null;
    }

    try {
        const data = JSON.parse(stored);
        return data.average ?? null;
    } catch (error) {
        console.error(`Error parsing data for ${month}`, error);
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
    document.querySelectorAll(".month-card").forEach(card => {
        const month = card.dataset.month;
        const averageSpan = card.querySelector(".month-average");

        if (!averageSpan) {
            console.warn(`Missing .month-average span for ${month}`);
            return;
        }

        const avg = loadMonthAverage(user, month);

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