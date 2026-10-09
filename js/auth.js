// Supabase Credentials
const SUPABASE_URL = "https://gyqzwqcprlksidsicsvj.supabase.co";
const SUPABASE_ANON_KEY = "Sb_publishable_EJ_JT0Z3_5RFxyBWDGfPNg_7QdwaWTD";

// Supabase Client Initialize
let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let activeWalletAction = "deposit";

// Toggle Between Login & Signup Form (Global Function)
window.toggleAuthMode = function(mode) {
    const errorMsg = document.getElementById("error-msg");
    if (errorMsg) errorMsg.innerText = "";

    const loginBox = document.getElementById("login-box");
    const signupBox = document.getElementById("signup-box");

    if (mode === 'signup') {
        loginBox.classList.add("hidden");
        signupBox.classList.remove("hidden");
    } else {
        signupBox.classList.add("hidden");
        loginBox.classList.remove("hidden");
    }
};

// Session Auto Check on Load
document.addEventListener("DOMContentLoaded", async () => {
    const activeUser = localStorage.getItem("loggedInUser");
    if (activeUser) {
        await syncUserData(activeUser);
        showDashboard();
    }
});

// Direct REST Fallback Helper Function
async function fetchSupabase(table, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    });
    if (!res.ok) throw new Error("API Fetch Error");
    return await res.json();
}

// Sync User Realtime Balance & Luck
async function syncUserData(username) {
    try {
        const users = await fetchSupabase("users", `?username=eq.${username}`);
        if (users && users.length > 0) {
            const data = users[0];
            localStorage.setItem("userLuck", data.luck || "low");
            localStorage.setItem("userBalance", data.money || 0);
            updateBalanceDisplay();
        }
    } catch (err) {
        console.error("Sync Error:", err);
    }
}

// LOGIN Form Handler
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById("error-msg");
    errorMsg.innerText = "যাচাই করা হচ্ছে...";

    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    try {
        const users = await fetchSupabase("users", `?username=eq.${usernameInput}&password=eq.${passwordInput}`);

        if (users && users.length > 0) {
            const data = users[0];
            localStorage.setItem("loggedInUser", data.username);
            localStorage.setItem("userLuck", data.luck || "low");
            localStorage.setItem("userBalance", data.money || 0);
            errorMsg.innerText = "";
            showDashboard();
        } else {
            errorMsg.innerText = "ভুল ইউজারনেম অথবা পাসওয়ার্ড!";
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "লগইন করতে সমস্যা হচ্ছে!";
    }
});

// SIGNUP Form Handler (Default Luck = 'low')
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById("error-msg");
    errorMsg.innerText = "অ্যাকাউন্ট তৈরি হচ্ছে...";

    const regUser = document.getElementById("reg-username").value.trim();
    const regPass = document.getElementById("reg-password").value.trim();

    try {
        // Check Existing User
        const existingUsers = await fetchSupabase("users", `?username=eq.${regUser}`);

        if (existingUsers && existingUsers.length > 0) {
            errorMsg.innerText = "এই ইউজারনেম দিয়ে অলরেডি অ্যাকাউন্ট আছে!";
            return;
        }

        // Insert New User via Direct REST API
        const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify([{ username: regUser, password: regPass, money: 0, luck: "low" }])
        });

        const createdData = await res.json();

        if (!res.ok || !createdData || createdData.length === 0) {
            errorMsg.innerText = "রেজিস্ট্রেশন করতে সমস্যা হয়েছে!";
            return;
        }

        const newUser = createdData[0];
        localStorage.setItem("loggedInUser", newUser.username);
        localStorage.setItem("userLuck", newUser.luck || "low");
        localStorage.setItem("userBalance", newUser.money || 0);

        errorMsg.innerText = "";
        alert("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");
        showDashboard();
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "রেজিস্ট্রেশন ব্যর্থ হয়েছে!";
    }
});

function showDashboard() {
    document.getElementById("auth-container")?.classList.add("hidden");
    document.getElementById("dashboard-section")?.classList.remove("hidden");
    
    document.getElementById("user-display").innerText = localStorage.getItem("loggedInUser");
    updateBalanceDisplay();
}

function updateBalanceDisplay() {
    const bal = localStorage.getItem("userBalance") || 0;
    const balElem = document.getElementById("balance-display");
    if (balElem) balElem.innerText = parseFloat(bal).toFixed(2);
}

// Modal Toggle Functions
window.openModal = function(action) {
    activeWalletAction = action;
    const modal = document.getElementById("wallet-modal");
    const title = document.getElementById("modal-title");
    const btn = document.getElementById("modal-submit-btn");

    if (action === "deposit") {
        title.innerText = "Deposit (টাকা জমা)";
        btn.innerText = "জমা রিকোয়েস্ট পাঠান";
    } else {
        title.innerText = "Withdraw (টাকা উত্তোলন)";
        btn.innerText = "উত্তোলনের আবেদন";
    }

    modal.classList.remove("hidden");
};

window.closeModal = function() {
    document.getElementById("wallet-modal")?.classList.add("hidden");
};

// Handle Wallet Actions
window.handleWalletAction = async function() {
    const amount = parseFloat(document.getElementById("wallet-amount").value);
    const account = document.getElementById("wallet-account").value.trim();
    const method = document.getElementById("payment-method").value;
    const username = localStorage.getItem("loggedInUser");

    if (!amount || amount < 100) return alert("সর্বনিম্ন ১০০ টাকা লিখুন!");
    if (!account) return alert("মোবাইল নম্বর লিখুন!");

    let currentBal = parseFloat(localStorage.getItem("userBalance")) || 0;

    if (activeWalletAction === "withdraw" && amount > currentBal) {
        return alert("পর্যাপ্ত ব্যালেন্স নেই!");
    }

    // Insert Transaction
    await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify([{ username: username, type: activeWalletAction, amount: amount, method: method, account_number: account }])
    });

    if (activeWalletAction === "deposit") {
        currentBal += amount;
    } else {
        currentBal -= amount;
    }

    // Update Balance
    await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${username}`, {
        method: "PATCH",
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ money: currentBal })
    });

    localStorage.setItem("userBalance", currentBal);
    updateBalanceDisplay();

    alert(activeWalletAction === "deposit" 
        ? `৳${amount} ডেপোজিট রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!` 
        : `৳${amount} উইথড্র রিকোয়েস্ট সফলভাবে জমা দেওয়া হয়েছে!`);

    closeModal();
};

window.logout = function() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userLuck");
    localStorage.removeItem("userBalance");
    window.location.reload();
};
