// Github-এ ব্যবহারকারীর ডেটা
const mockUserData = {
    username: "jdcek123",
    password: "123456",
    money: 500
};

// সেশন চেক
document.addEventListener("DOMContentLoaded", () => {
    const activeUser = localStorage.getItem("loggedInUser");
    if (activeUser) {
        showDashboard();
    }
});

// লগইন ফর্ম জমা নেওয়া
document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const userIn = document.getElementById("username").value;
    const passIn = document.getElementById("password").value;

    if (userIn === mockUserData.username && passIn === mockUserData.password) {
        if (!localStorage.getItem("userBalance")) {
            localStorage.setItem("userBalance", mockUserData.money);
        }
        localStorage.setItem("loggedInUser", userIn);
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
    window.location.reload();
}
