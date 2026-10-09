// Supabase Credentials
const SUPABASE_URL = "https://gyqzwqcprlksidsicsvj.supabase.co";
const SUPABASE_ANON_KEY = "Sb_publishable_EJ_JT0Z3_5RFxyBWDGfPNg_7QdwaWTD";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let activeWalletAction = "deposit";

function toggleAuthMode(mode) {
    document.getElementById("error-msg").innerText = "";
    if (mode === 'signup') {
        document.getElementById("login-box").classList.add("hidden");
        document.getElementById("signup-box").classList.remove("hidden");
    } else {
        document.getElementById("signup-box").classList.add("hidden");
        document.getElementById("login-box").classList.remove("hidden");
    }
}

// Session Initialization
document.addEventListener("DOMContentLoaded", async () => {
    const activeUser = localStorage.getItem("loggedInUser");
    if (activeUser) {
        await syncUserData(activeUser);
        showDashboard();
    }
});

// Fetch Real-time Balance and Luck from Supabase
async function syncUserData(username) {
    const { data, error } = await supabase
        .from('users')
        .select('money, luck')
        .eq('username', username)
        .single();

    if (data && !error) {
        localStorage.setItem("userLuck", data.luck);
        localStorage.setItem("userBalance", data.money);
        updateBalanceDisplay();
    }
}

// LOGIN Logic
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', usernameInput)
        .eq('password', passwordInput)
        .single();

    if (data && !error) {
        localStorage.setItem("loggedInUser", data.username);
        localStorage.setItem("userLuck", data.luck);
        localStorage.setItem("userBalance", data.money);
        showDashboard();
    } else {
        document.getElementById("error-msg").innerText = "ভুল ইউজারনেম অথবা পাসওয়ার্ড!";
    }
});

// REGISTRATION Logic (Default Luck = 'low')
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const regUser = document.getElementById("reg-username").value.trim();
    const regPass = document.getElementById("reg-password").value.trim();

    // Check existing username
    const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', regUser)
        .single();

    if (existingUser) {
        return document.getElementById("error-msg").innerText = "এই ইউজারনেম দিয়ে অলরেডি অ্যাকাউন্ট আছে!";
    }

    // Insert new registered user with default LOW luck
    const { data, error } = await supabase
        .from('users')
        .insert([
            { username: regUser, password: regPass, money: 0, luck: "low" }
        ])
        .select()
        .single();

    if (error) {
        return document.getElementById("error-msg").innerText = "রেজিস্ট্রেশন ব্যর্থ হয়েছে, আবার চেষ্টা করুন!";
    }

    localStorage.setItem("loggedInUser", data.username);
    localStorage.setItem("userLuck", data.luck);
    localStorage.setItem("userBalance", data.money);

    alert("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");
    showDashboard();
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

// Wallet Functions
function openModal(action) {
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
}

function closeModal() {
    document.getElementById("wallet-modal").classList.add("hidden");
}

async function handleWalletAction() {
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

    // Record Transaction in Supabase
    const { error: txErr } = await supabase
        .from('transactions')
        .insert([
            { username: username, type: activeWalletAction, amount: amount, method: method, account_number: account }
        ]);

    if (txErr) {
        return alert("লেনদেন জমা দেওয়া যায়নি, আবার চেষ্টা করুন!");
    }

    if (activeWalletAction === "deposit") {
        currentBal += amount;
    } else {
        currentBal -= amount;
    }

    // Update User Balance in Supabase
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
}

function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userLuck");
    localStorage.removeItem("userBalance");
    window.location.reload();
                                                        }
