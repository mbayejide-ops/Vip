const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let balance = parseFloat(localStorage.getItem("userBalance")) || 500;
let currentMultiplier = 1.00;
let targetMultiplier = 3.00;
let animationId = null;
let isPlaying = false;
let hasBetted = false;
let progress = 0;

let historyData = ["2.05x", "1.37x", "11.20x", "1.01x", "5.50x", "1.18x", "1.71x", "4.44x", "1.91x", "15.77x", "2.17x", "1.17x", "1.00x", "2.46x", "1.23x"];
let fakePlayers = [];

document.getElementById("bal").innerText = balance.toFixed(2);
renderHistory();
generateFakePlayers();
drawStaticStage();

function renderHistory() {
    const histContainer = document.getElementById("history");
    histContainer.innerHTML = "";
    historyData.slice(-15).reverse().forEach(val => {
        const span = document.createElement("span");
        const num = parseFloat(val);
        span.className = `badge ${num >= 10.00 ? 'purple' : 'blue'}`;
        span.innerText = val;
        histContainer.appendChild(span);
    });
}

function adjustBet(val) {
    const input = document.getElementById("bet-amount");
    let curr = parseInt(input.value) || 10;
    let nextVal = curr + val;
    if (nextVal >= 1 && nextVal <= 10000) {
        input.value = nextVal;
    }
}

// Generate 50+ Fake Users
function generateFakePlayers() {
    fakePlayers = [];
    for (let i = 0; i < 55; i++) {
        let randSuffix = Math.floor(100 + Math.random() * 900);
        let uname = `b*****f${randSuffix}`;
        let betAmount = Math.floor(Math.random() * (10000 - 50 + 1)) + 50;
        let cashoutAt = (Math.random() * (targetMultiplier - 1.10) + 1.10).toFixed(2);

        fakePlayers.push({
            username: uname,
            bet: betAmount,
            cashoutAt: parseFloat(cashoutAt),
            hasCashedOut: false,
            winAmount: 0
        });
    }
    renderFakePlayers();
}

function renderFakePlayers() {
    const list = document.getElementById("bets-list");
    list.innerHTML = "";

    fakePlayers.forEach(p => {
        const row = document.createElement("div");
        row.className = "bet-item";
        
        let winCol = p.hasCashedOut 
            ? `<span class="win-val">৳${p.winAmount.toFixed(2)}</span>` 
            : `<span class="pending-val">-</span>`;

        row.innerHTML = `
            <span class="user-name">${p.username}</span>
            <span class="bet-val">৳${p.bet}</span>
            ${winCol}
        `;
        list.appendChild(row);
    });
}

function updateFakePlayersLive() {
    fakePlayers.forEach(p => {
        if (!p.hasCashedOut && currentMultiplier >= p.cashoutAt && currentMultiplier < targetMultiplier) {
            p.hasCashedOut = true;
            p.winAmount = p.bet * p.cashoutAt;
        }
    });
    renderFakePlayers();
}

function drawPlane(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#e50914";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-25, -8);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-25, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(3, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawStage(px, py) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = 20;
    const startY = canvas.height - 20;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (px - startX) / 2, startY, px, py);
    ctx.strokeStyle = "#e50914";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.lineTo(px, startY);
    ctx.lineTo(startX, startY);
    ctx.fillStyle = "rgba(229, 9, 20, 0.15)";
    ctx.fill();

    drawPlane(px, py);
}

function drawStaticStage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlane(30, canvas.height - 30);
}

function handleGameAction() {
    const btn = document.getElementById("main-btn");
    const betVal = parseFloat(document.getElementById("bet-amount").value);

    if (betVal > 10000) {
        return alert("সর্বোচ্চ বেট সীমা ১০,০০০ টাকা!");
    }

    if (!isPlaying && !hasBetted) {
        if (betVal > balance) return alert("পর্যাপ্ত ব্যালেন্স নেই!");

        balance -= betVal;
        updateBalance();
        hasBetted = true;
        btn.innerText = "CASH OUT";
        btn.className = "btn-main btn-cashout";
        startFlight(betVal);
    } else if (isPlaying && hasBetted) {
        const winAmount = betVal * currentMultiplier;
        balance += winAmount;
        updateBalance();
        hasBetted = false;
        alert(`জিতলেন: ৳${winAmount.toFixed(2)}`);
        btn.innerText = "BET";
        btn.className = "btn-main btn-bet";
    }
}

function startFlight(betVal) {
    isPlaying = true;
    currentMultiplier = 1.00;
    progress = 0;
    document.getElementById("flewText").style.display = "none";
    
    // Minimum 3.00x and Maximum 100.00x range calculation
    targetMultiplier = (Math.random() * (100.00 - 3.00) + 3.00).toFixed(2);

    generateFakePlayers();

    const multText = document.getElementById("multiplier");
    multText.className = "overlay-multiplier mult-blue";

    function animate() {
        if (!isPlaying) return;

        currentMultiplier += 0.02;
        progress = Math.min(1, progress + 0.005);

        multText.innerText = currentMultiplier.toFixed(2) + "x";

        if (currentMultiplier >= 10.00) {
            multText.className = "overlay-multiplier mult-purple";
        }

        updateFakePlayersLive();

        const endX = canvas.width - 40;
        const currentX = 20 + (endX - 20) * progress;
        const currentY = (canvas.height - 20) - ((canvas.height - 60) * Math.pow(progress, 2));

        drawStage(currentX, currentY);

        if (currentMultiplier >= targetMultiplier) {
            crashGame();
        } else {
            animationId = requestAnimationFrame(animate);
        }
    }

    animationId = requestAnimationFrame(animate);
}

function crashGame() {
    isPlaying = false;
    cancelAnimationFrame(animationId);

    const multText = document.getElementById("multiplier");
    multText.className = "overlay-multiplier mult-crashed";
    document.getElementById("flewText").style.display = "block";

    historyData.push(targetMultiplier + "x");
    renderHistory();

    const btn = document.getElementById("main-btn");
    if (hasBetted) {
        hasBetted = false;
    }
    btn.innerText = "BET";
    btn.className = "btn-main btn-bet";

    setTimeout(() => {
        drawStaticStage();
    }, 2000);
}

function updateBalance() {
    localStorage.setItem("userBalance", balance);
    document.getElementById("bal").innerText = balance.toFixed(2);
}
