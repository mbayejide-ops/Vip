const GITHUB_RAW_URL = "https://raw.githubusercontent.com/bayejidgamingff1/Image/main/users.json";

const defaultUserData = [
    { username: "jdcek123", password: "123456", money: 500, luck: "high" },
    { username: "unlucky1", password: "123456", money: 200, luck: "low" },
    { username: "normaluser", password: "123456", money: 300, luck: "normal" }
];

document.addEventListener("DOMContentLoaded", () => {
    const activeUser = localStorage.getItem("loggedInUser");
    if (activeUser) {
        showDashboard();
    }
});

// Real-time Live GitHub Fetcher (No Cache Allowed)
async function fetchLiveUserData(username) {
    try {
        const uniqueString = Date.now() + "_" + Math.random().toString(36).substring(7);
        const res = await fetch(`${GITHUB_RAW_URL}?nocache=${uniqueString}`, {
            cache: 'no-store',
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (!res.ok) throw new Error("Network issue");
        const users = await res.json();
        const found = users.find(u => u.username === username);
        if (found) {
            localStorage.setItem("userLuck", found.luck);
            return found;
        }
    } catch (err) {
        console.warn("Live fetch error, falling back to cached state", err);
    }
    
    return null;
}

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userIn = document.getElementById("username").value;
    const passIn = document.getElementById("password").value;

    let userList = defaultUserData;
    try {
        const res = await fetch(`${GITHUB_RAW_URL}?nocache=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) userList = await res.json();
    } catch (e) {}

    const matchedUser = userList.find(u => u.username === userIn && u.password === passIn);

    if (matchedUser) {
        localStorage.setItem("loggedInUser", matchedUser.username);
        localStorage.setItem("userLuck", matchedUser.luck);
        if (!localStorage.getItem("userBalance")) {
            localStorage.setItem("userBalance", matchedUser.money);
        }
        showDashboard();
    } else {
        document.getElementById("error-msg").innerText = "ভুল ইউজারনেম অথবা পাসওয়ার্ড!";
    }
});

function showDashboard() {
    document.getElementById("login-section")?.classList.add("hidden");
    document.getElementById("dashboard-section")?.classList.remove("hidden");
    
    const user = localStorage.getItem("loggedInUser");
    document.getElementById("user-display").innerText = user;
    updateBalanceDisplay();

    fetchLiveUserData(user);
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
