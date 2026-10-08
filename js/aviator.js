let balance = parseFloat(localStorage.getItem("userBalance")) || 0;
let currentMultiplier = 1.00;
let targetMultiplier = 5.09;
let gameInterval = null;
let isPlaying = false;
let hasBetted = false;
let historyData = ["2.05x", "1.37x", "11.20x", "1.01x", "5.50x", "1.18x", "1.71x", "4.44x", "1.91x", "15.77x", "2.17x", "1.17x", "1.00x", "2.46x", "1.23x"];

document.getElementById("bal").innerText = balance.toFixed(2);
renderHistory();

function renderHistory() {
    const histContainer = document.getElementById("history");
    histContainer.innerHTML = "";
    historyData.slice(-15).forEach(val => {
        const span = document.createElement("span");
        const num = parseFloat(val);
        span.className = `history-item ${num >= 10.00 ? 'purple' : 'blue'}`;
        span.innerText = val;
        histContainer.appendChild(span);
    });
}

function handleGameAction() {
    const btn = document.getElementById("main-btn");

    if (!isPlaying && !hasBetted) {
        // Place Bet
        const betVal = parseFloat(document.getElementById("bet-amount").value);
        if (betVal > balance) return alert("পর্যাপ্ত ব্যালেন্স নেই!");

        balance -= betVal;
        updateBalance();
        hasBetted = true;
        btn.innerText = "CASH OUT";
        btn.className = "btn-cashout";
        startGame(betVal);
    } else if (isPlaying && hasBetted) {
        // Cashout
        const betVal = parseFloat(document.getElementById("bet-amount").value);
        const winAmount = betVal * currentMultiplier;
        balance += winAmount;
        updateBalance();
        hasBetted = false;
        alert(`আপনি জিতেছেন: ৳${winAmount.toFixed(2)}`);
        btn.innerText = "BET";
        btn.className = "btn-bet";
    }
}

function startGame(betVal) {
    isPlaying = true;
    currentMultiplier = 1.00;
    
    // মিনিমাম ৫.০৯x এবং ম্যাক্সিমাম ১০০০০x ক্র্যাশ পয়েন্ট সেট করা
    targetMultiplier = (Math.random() * (10000 - 5.09) + 5.09).toFixed(2);

    const multText = document.getElementById("multiplier");
    const plane = document.getElementById("plane");

    plane.style.bottom = "20px";
    plane.style.left = "10px";

    gameInterval = setInterval(() => {
        currentMultiplier += 0.05;
        multText.innerText = currentMultiplier.toFixed(2) + "x";

        // রঙ পরিবর্তন লজিক: ৯.৯৯x পর্যন্ত ব্লু, ১০.০০x থেকে পার্পল
        if (currentMultiplier >= 10.00) {
            multText.className = "multiplier purple";
        } else {
            multText.className = "multiplier blue";
        }

        // প্লেন অ্যানিমেশন
        plane.style.bottom = Math.min(200, 20 + currentMultiplier * 15) + "px";
        plane.style.left = Math.min(280, 10 + currentMultiplier * 20) + "px";

        // ক্র্যাশ লজিক
        if (currentMultiplier >= targetMultiplier) {
            clearInterval(gameInterval);
            isPlaying = false;
            multText.innerText = "CRASHED!";
            multText.style.color = "red";

            historyData.push(targetMultiplier + "x");
            renderHistory();

            const btn = document.getElementById("main-btn");
            if (hasBetted) {
                alert("প্লেন ক্র্যাশ করেছে! আপনি হেরে গেছেন।");
                hasBetted = false;
            }
            btn.innerText = "BET";
            btn.className = "btn-bet";
        }
    }, 100);
}

function updateBalance() {
    localStorage.setItem("userBalance", balance);
    document.getElementById("bal").innerText = balance.toFixed(2);
      }
