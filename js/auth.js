// GitHub user database with custom luck levels
const mockUserData = [
    {
        username: "jdcek123",  // High Luck (Behi jitbe)
        password: "123456",
        money: 500,
        luck: "high"
    },
    {
        username: "unlucky1",  // Low Luck (Harbe)
        password: "123456",
        money: 200,
        luck: "low"
    },
    {
        username: "normaluser", // Normal Luck
        password: "123456",
        money: 300,
        luck: "normal"
    }
];

// Session Check
document.addEventListener("DOMContentLoaded", () => {
    const activeUser = localStorage.getItem("loggedInUser");
    if (activeUser) {
        showDashboard();
    }
});

// Login Form Event Listener
document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const userIn = document.getElementById("username").value;
    const passIn = document.getElementById("password").value;

    const matchedUser = mockUserData.find(u => u.username === userIn && u.password === passIn);

    if (matchedUser) {
        if (!localStorage.getItem("userBalance")) {
            localStorage.setItem("userBalance", matchedUser.money);
        }
        localStorage.setItem("loggedInUser", matchedUser.username);
        localStorage.setItem("userLuck", matchedUser.luck); // Save user luck state
        showDashboard();
    } else {
        document.getElementById("error-msg").innerText = "ভুল ইউজারনেম অথবা পাসওয়ার্ড!";
    }
});

function showDashboard() {
    document.getElementById("login-section")?.classList.add("hidden");
    document.getElementById("dashboard-section")?.classList.remove("hidden");
    
    document.getElementById("user-display").innerText = localStorage.getItem("loggedInUser");
    updateBalanceDisplay();
}

function updateBalanceDisplay() {
    const bal = localStorage.getItem("userBalance") || 0;
    const balElem = document.getElementById("balance-display");
    if (balElem) balElem.innerText = parseFloat(bal).toFixed(2);
}

function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userLuck");
    window.location.reload();
}
