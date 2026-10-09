// Supabase Credentials
const SUPABASE_URL = "https://gyqzwqcprlksidsicsvj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cXp3cWNwcmxrc2lkc2ljc3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Mzk5MzIsImV4cCI6MjEwNzExNTkzMn0.ZZfy3punSEpSnNCt4ehcQpVlnvfmEGKGuHm1xllLvxI";

// Supabase Client Initialize
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Sync User Realtime Balance & Luck from Supabase
async function syncUserData(username) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('money, luck')
            .eq('username', username)
            .maybeSingle();

        if (data && !error) {
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
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', usernameInput)
            .eq('password', passwordInput)
            .maybeSingle();

        if (error) {
            console.error("Supabase Error:", error);
            errorMsg.innerText = "ডাটাবেজ কানেকশনে সমস্যা হয়েছে!";
            return;
        }

        if (data) {
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
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', regUser)
            .maybeSingle();

        if (existingUser) {
            errorMsg.innerText = "এই ইউজারনেম দিয়ে অলরেডি অ্যাকাউন্ট আছে!";
            return;
        }

        // Insert New User with default "low" luck
        const { data, error } = await supabase
            .from('users')
            .insert([
                { username: regUser, password: regPass, money: 0, luck: "low" }
            ])
            .select()
            .single();

        if (error) {
            console.error("Signup Error:", error);
            errorMsg.innerText = "রেজিস্ট্রেশন করতে সমস্যা হয়েছে!";
            return;
        }

        localStorage.setItem("loggedInUser", data.username);
        localStorage.setItem("userLuck", data.luck || "low");
        localStorage.setItem("userBalance", data.money || 0);

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

    // Save transaction to Supabase
    const { error: txErr } = await supabase
        .from('transactions')
        .insert([
            { username: username, type: activeWalletAction, amount: amount, method: method, account_number: account }
        ]);

    if (txErr) {
        return alert("লেনদেন জমা দেওয়া যায়নি!");
    }

    if (activeWalletAction === "deposit") {
        currentBal += amount;
    } else {
        currentBal -= amount;
    }

    // Update user balance in Supabase
    await supabase
        .from('users')
        .update({ money: currentBal })
        .eq('username', username);

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
