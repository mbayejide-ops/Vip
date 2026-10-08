// আপনার GitHub-এর Raw URL এখানে বসাবেন (যেমন users.json ফাইল)
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/bayejidgamingff1/Image/main/users.json";

// ব্যাকআপ / ডিফল্ট ইউজার ডাটা (যদি ইন্টারনেটে রেসপন্স না আসে)
const defaultUserData = [
    { username: "jdcek123", password: "123456", money: 50, luck: "low" },
    { username: "unlucky1", password: "123456", money: 200, luck: "low" },
    { username: "normaluser", password: "123456", money: 300, luck: "normal" }
];

document.addEventListener("DOMContentLoaded", () => {
    const activeUser = localStorage.getItem("loggedInUser");
    if (activeUser) {
        showDashboard();
    }
});

// লাইভ গিটহাব থেকে ইউজারের ডাটা আনবে
async function fetchLiveUserData(username) {
    try {
        // Cache Bypass করার জন্য timestamp যোগ করা হলো যাতে গিটহাবের আপডেট তাৎক্ষণিক পাওয়া যায়
        const res = await fetch(`${GITHUB_RAW_URL}?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error("GitHub Network response was not ok");
        const users = await res.json();
        const found = users.find(u => u.username === username);
        if (found) {
            localStorage.setItem("userLuck", found.luck);
            return found;
        }
    } catch (err) {
        console.warn("GitHub Live Fetch Failed, fallback to local/default logic", err);
    }
    
    // Fallback logic
    const local = defaultUserData.find(u => u.username === username);
    if (local) localStorage.setItem("userLuck", local.luck);
    return local;
}

// লগইন হ্যান্ডলার
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userIn = document.getElementById("username").value;
    const passIn = document.getElementById("password").value;

    let userList = defaultUserData;
    try {
        const res = await fetch(`${GITHUB_RAW_URL}?t=${new Date().getTime()}`);
        if (res.ok) {
            userList = await res.json();
        }
    } catch (e) {
        console.log("Using default fallback accounts");
    }

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

    // ব্যাকগ্রাউন্ডে গিটহাবের লাইভ লাক চেক করবে
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
