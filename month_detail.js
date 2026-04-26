// ========= Block 2: Internal State =========

// Single source of truth
const currentMonthState = {
    user: '',
    month: '',
    entries: [],
    average: null
};

// Create a blank entry
function createEmptyEntry(id) {
    return {
        id: id,
        date: '',
        time: '',
        beforeMeal: null,
        afterMeal: null,
        notes: ''
    };
}

function getStorageKey(user, month) {
    return `glucose:${user}:${month}`;
}


function loadMonthData(user, month) {
    const key = getStorageKey(user, month);
    const stored = localStorage.getItem(key);

    if (!stored) {
        return null;
    }

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error("Failed to parse stored month data", error);
        return null;
    }
}

async function saveMonthData(monthState) {
    if (!monthState.user || !monthState.month) return;

    for (const entry of monthState.entries) {
        // skip blank rows
        if (!entry.date && !entry.time && !entry.beforeMeal && !entry.afterMeal && !entry.notes) {
            continue;
        }

        // only save NEW rows
        if (!String(entry.id).startsWith("entry-")) {
            continue;
        }

        await fetch(`https://glucose-tracker-api-vpm0.onrender.com/api/users/${monthState.user}/months/${monthState.month}/entries`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                date: entry.date,
                time: entry.time,
                beforeMeal: entry.beforeMeal,
                afterMeal: entry.afterMeal,
                notes: entry.notes
            })
        });
    }

    // reload from database so new rows get real database IDs
    await loadEntriesFromDB();
}
// ========= Block 3: Render Table =========

function renderTable() {
    const tbody = document.getElementById("log-rows");
    tbody.innerHTML = "";

    currentMonthState.entries.forEach(entry => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <input type="date"
                       data-id="${entry.id}"
                       data-field="date"
                       value="${entry.date}">
            </td>
            <td>
                <input type="time"
                       data-id="${entry.id}"
                       data-field="time"
                       value="${entry.time}">
            </td>
            <td>
                <input type="number"
                       data-id="${entry.id}"
                       data-field="beforeMeal"
                       value="${entry.beforeMeal ?? ''}">
            </td>
            <td>
                <input type="number"
                       data-id="${entry.id}"
                       data-field="afterMeal"
                       value="${entry.afterMeal ?? ''}">
            </td>
            <td>
                <input type="text"
                       data-id="${entry.id}"
                       data-field="notes"
                       value="${entry.notes}">
            </td>
            <td>
                <button class="delete-row" data-id="${entry.id}">X</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    attachInputListeners();
    attachDeleteListeners();
    updateAverage();
}

// ========= Block 4: Input → State =========

function attachInputListeners() {
    const inputs = document.querySelectorAll("#log-rows input");

    inputs.forEach(input => {
        input.addEventListener("input", event => {
            const entryId = event.target.dataset.id;
            const field = event.target.dataset.field;
            let value = event.target.value;

            if (field === "beforeMeal" || field === "afterMeal") {
                value = value === "" ? null : Number(value);
            }

            const entry = currentMonthState.entries.find(e => String(e.id) === String(entryId));

            if (entry) {
                entry[field] = value;
            }

            updateAverage();
            console.log("Updated state:", currentMonthState);

            // update only rows that already exist in the database
            if (entry && !String(entry.id).startsWith("entry-")) {
                fetch(`https://glucose-tracker-api-vpm0.onrender.com/api/entries/${entry.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        date: entry.date,
                        time: entry.time,
                        beforeMeal: entry.beforeMeal,
                        afterMeal: entry.afterMeal,
                        notes: entry.notes
                    })
                });
            }
        });
    });
}

// ========= Block 5: Delete Row =========
function attachDeleteListeners() {
    const buttons = document.querySelectorAll(".delete-row");

    buttons.forEach(button => {
        button.addEventListener("click", event => {
            const entryId = event.target.dataset.id;

            currentMonthState.entries =
                currentMonthState.entries.filter(e => String(e.id) !== String(entryId));

            console.log("After delete:", currentMonthState.entries);
            renderTable();

            fetch(`https://glucose-tracker-api-vpm0.onrender.com/api/entries/${entryId}`, {
                method: "DELETE"
            });
        });
    });
}

function calculateAverage(entries) {
    let total = 0;
    let count = 0;

    entries.forEach(entry => {
        if (typeof entry.beforeMeal === "number") {
            total += entry.beforeMeal;
            count++;
        }

        if (typeof entry.afterMeal === "number") {
            total += entry.afterMeal;
            count++;
        }
    });

    if (count === 0) {
        return null;
    }

    return Number((total / count).toFixed(1));
}

function updateAverage() {
    const average = calculateAverage(currentMonthState.entries);
    currentMonthState.average = average;

    const averageCell = document.getElementById("average-value");

    if (average === null) {
        averageCell.textContent = "N/A";
    } else {
        averageCell.textContent = average;
    }

    console.log("Updated average:", average);
    //saveMonthData(currentMonthState);
}

function handleAddRow() {
    const newId = `entry-${Date.now()}`;

    const newEntry = createEmptyEntry(newId);
    currentMonthState.entries.push(newEntry);

    console.log("After add:", currentMonthState.entries);

    renderTable();
}
``

// ========= Page Initialization =========

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-row-button")
    .addEventListener("click", handleAddRow);
    const user = localStorage.getItem("currentUser");
    const month = localStorage.getItem("currentMonth");

    if (!user || !month) {
        window.location.href = "months.html";
        return;
    }

    currentMonthState.user = user;
    currentMonthState.month = month;

    const savedData = loadMonthData(user, month);

if (savedData) {
    currentMonthState.entries = savedData.entries || [];
    currentMonthState.average = savedData.average ?? null;
} else {
    for (let i = 1; i <= 4; i++) {
        currentMonthState.entries.push(
            createEmptyEntry(`entry-${i}`)
        );
    }
}
``

    console.log("Month State:", currentMonthState);

    const title = document.getElementById("sheet-title");
    title.textContent = `${month} Blood Sugar Log (${user})`;

    document.getElementById("back-button")
        .addEventListener("click", () => {
            window.location.href = "months.html";
        });
    loadEntriesFromDB();
});

document.getElementById("save-button").addEventListener("click", () => {
    saveMonthData(currentMonthState);
    console.log("Saved to database");
});

async function loadEntriesFromDB() {
    const res = await fetch(`https://glucose-tracker-api-vpm0.onrender.com/api/users/${currentMonthState.user}/months/${currentMonthState.month}/entries`);
    const data = await res.json();

    currentMonthState.entries = data.entries;
    currentMonthState.average = data.average;

    console.log("Loaded from DB:", data);

    renderTable();
}