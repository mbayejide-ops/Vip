const canvas = document.getElementById("slotCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const stage = document.getElementById("stage-box");
    canvas.width = stage.clientWidth || 400;
    canvas.height = stage.clientHeight || 320;
    drawGrid();
}

let balance = parseFloat(localStorage.getItem("userBalance")) || 500;
let isSpinning = false;
let freeSpinsLeft = 0;
let currentCascadeStep = 0;

const COLS = 5;
const ROWS = 4;
let grid = [];

const SYMBOLS = [
    { id: 'CHERRY', icon: '🍒', pay: [0, 0, 0, 1.0, 2.5, 10.0] },
    { id: 'LEMON',  icon: '🍋', pay: [0, 0, 0, 0.8, 2.0, 8.0] },
    { id: 'BELL',   icon: '🔔', pay: [0, 0, 0, 0.5, 1.5, 5.0] },
    { id: 'CARD_A', icon: 'A',  pay: [0, 0, 0, 0.3, 1.0, 3.0] },
    { id: 'CARD_K', icon: 'K',  pay: [0, 0, 0, 0.2, 0.8, 2.0] },
    { id: 'CARD_Q', icon: 'Q',  pay: [0, 0, 0, 0.1, 0.5, 1.0] },
    { id: 'WILD',   icon: '🃏', pay: [0, 0, 0, 0, 0, 0] },
    { id: 'SCATTER',icon: '⭐', pay: [0, 0, 0, 0, 0, 0] }
];

document.getElementById("bal").innerText = balance.toFixed(2);

function adjustBet(val) {
    if (isSpinning) return;
    const input = document.getElementById("bet-amount");
    let curr = parseInt(input.value) || 10;
    let nextVal = curr + val;
    if (nextVal >= 10 && nextVal <= 10000) {
        input.value = nextVal;
    }
}

// Rigged Luck Probability Algorithm
function getRandomSymbol() {
    const userLuck = localStorage.getItem("userLuck") || "normal";
    let rand = Math.random() * 100;

    if (userLuck === "low") {
        // Strict Low Luck: 0% Scatter, 0% Wild, 0% High Multipliers
        // Generates completely broken sequence so matching never forms
        const lowSymbols = [SYMBOLS[3], SYMBOLS[4], SYMBOLS[5]]; // A, K, Q only
        return lowSymbols[Math.floor(Math.random() * lowSymbols.length)];
    } else if (userLuck === "high") {
        if (rand < 25) return SYMBOLS[7];  // Scatter 25%
        if (rand < 45) return SYMBOLS[6];  // Wild 20%
        if (rand < 75) return SYMBOLS[0];  // Cherry 30%
        return SYMBOLS[1];                 // Lemon
    } else {
        if (rand < 4) return SYMBOLS[7];   // Scatter 4%
        if (rand < 10) return SYMBOLS[6];  // Wild 6%
        if (rand < 22) return SYMBOLS[0];
        if (rand < 36) return SYMBOLS[1];
        if (rand < 52) return SYMBOLS[2];
        if (rand < 68) return SYMBOLS[3];
        if (rand < 84) return SYMBOLS[4];
        return SYMBOLS[5];
    }
}

function initGrid() {
    grid = [];
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            row.push({ ...getRandomSymbol(), opacity: 1, scale: 1 });
        }
        grid.push(row);
    }
}

function drawRoundedRect(x, y, width, height, radius, fillStyle, strokeStyle) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!grid[r] || !grid[r][c]) continue;
            const sym = grid[r][c];

            const x = c * cellW + cellW / 2;
            const y = r * cellH + cellH / 2;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(sym.scale, sym.scale);
            ctx.globalAlpha = sym.opacity;

            drawRoundedRect(-cellW / 2 + 4, -cellH / 2 + 4, cellW - 8, cellH - 8, 8, "#181a26", "#2b2e42");

            if (sym.id === 'WILD') {
                ctx.fillStyle = "#ffb400";
            } else if (sym.id === 'SCATTER') {
                ctx.fillStyle = "#ff3366";
            } else {
                ctx.fillStyle = "#ffffff";
            }

            ctx.font = `bold ${cellH * 0.45}px Segoe UI, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(sym.icon, 0, 2);

            ctx.restore();
        }
    }
}

function updateMultiplierUI(step) {
    document.querySelectorAll(".mult-step").forEach(el => el.classList.remove("mult-active"));
    if (step === 0) document.getElementById("m1").classList.add("mult-active");
    else if (step === 1) document.getElementById("m2").classList.add("mult-active");
    else if (step === 2) document.getElementById("m3").classList.add("mult-active");
    else document.getElementById("m5").classList.add("mult-active");
}

function getMultiplierValue(step) {
    if (step === 0) return 1;
    if (step === 1) return 2;
    if (step === 2) return 3;
    return 5;
}

async function startSpin() {
    const betVal = parseFloat(document.getElementById("bet-amount").value);

    // Fetch Live Github state strictly without any caching delay
    const user = localStorage.getItem("loggedInUser");
    if (typeof fetchLiveUserData === "function" && user) {
        await fetchLiveUserData(user);
    }

    if (freeSpinsLeft === 0) {
        if (betVal > balance) return alert("পর্যাপ্ত ব্যালেন্স নেই!");
        balance -= betVal;
        updateBalance();
    } else {
        freeSpinsLeft--;
        updateFreeSpinUI();
    }

    isSpinning = true;
    document.getElementById("spin-btn").disabled = true;
    currentCascadeStep = 0;
    updateMultiplierUI(0);

    await animateSpinRoll();
    await processCascades(betVal);

    isSpinning = false;
    document.getElementById("spin-btn").disabled = false;

    if (freeSpinsLeft > 0) {
        setTimeout(startSpin, 1000);
    }
}

function animateSpinRoll() {
    return new Promise(resolve => {
        let frames = 0;
        const interval = setInterval(() => {
            initGrid();
            drawGrid();
            frames++;
            if (frames > 10) {
                clearInterval(interval);
                resolve();
            }
        }, 40);
    });
}

async function processCascades(betVal) {
    let continueCascade = true;
    let maxCascadeSafetyLimit = 0; // Infinite loop and extreme payout protection

    while (continueCascade && maxCascadeSafetyLimit < 5) {
        let winInfo = checkWinningCombinations();

        if (winInfo.winAmount > 0) {
            const mult = getMultiplierValue(currentCascadeStep);
            const totalCascadeWin = winInfo.winAmount * betVal * mult;

            balance += totalCascadeWin;
            updateBalance();
            showWinText(`+৳${totalCascadeWin.toFixed(2)} (${mult}x)`);

            await animateDisappear(winInfo.winningPositions);
            applyCascadeGravity();
            drawGrid();
            await sleep(200);

            currentCascadeStep++;
            maxCascadeSafetyLimit++;
            updateMultiplierUI(currentCascadeStep);
        } else {
            continueCascade = false;
        }
    }

    await checkScatters();
}

function checkWinningCombinations() {
    let winningPositions = [];
    let baseWinRatio = 0;

    SYMBOLS.forEach(sym => {
        if (sym.id === 'WILD' || sym.id === 'SCATTER') return;

        let matchCols = 0;
        let positions = [];

        for (let c = 0; c < COLS; c++) {
            let colHasMatch = false;
            for (let r = 0; r < ROWS; r++) {
                let cellSym = grid[r][c];
                if (cellSym && (cellSym.id === sym.id || cellSym.id === 'WILD')) {
                    colHasMatch = true;
                    positions.push({ r, c });
                }
            }
            if (colHasMatch) matchCols++;
            else break;
        }

        if (matchCols >= 3) {
            baseWinRatio += sym.pay[matchCols];
            winningPositions = winningPositions.concat(positions);
        }
    });

    return { winAmount: baseWinRatio, winningPositions };
}

function animateDisappear(positions) {
    return new Promise(resolve => {
        let steps = 0;
        const interval = setInterval(() => {
            positions.forEach(pos => {
                if (grid[pos.r] && grid[pos.r][pos.c]) {
                    grid[pos.r][pos.c].scale -= 0.1;
                    grid[pos.r][pos.c].opacity -= 0.1;
                }
            });
            drawGrid();
            steps++;
            if (steps >= 10) {
                clearInterval(interval);
                positions.forEach(pos => {
                    if (grid[pos.r]) grid[pos.r][pos.c] = null;
                });
                resolve();
            }
        }, 30);
    });
}

function applyCascadeGravity() {
    for (let c = 0; c < COLS; c++) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r][c] === null) {
                for (let above = r - 1; above >= 0; above--) {
                    if (grid[above][c] !== null) {
                        grid[r][c] = grid[above][c];
                        grid[above][c] = null;
                        break;
                    }
                }
            }
        }
        for (let r = 0; r < ROWS; r++) {
            if (grid[r][c] === null) {
                grid[r][c] = { ...getRandomSymbol(), opacity: 1, scale: 1 };
            }
        }
    }
}

async function checkScatters() {
    const userLuck = localStorage.getItem("userLuck") || "normal";
    if (userLuck === "low") return; // Completely disable bonus for low luck

    let scatterCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r] && grid[r][c] && grid[r][c].id === 'SCATTER') scatterCount++;
        }
    }

    let wonSpins = 0;
    if (scatterCount >= 5) wonSpins = 20;
    else if (scatterCount === 4) wonSpins = 10;
    else if (scatterCount === 3) wonSpins = 5;

    if (wonSpins > 0) {
        freeSpinsLeft += wonSpins;
        await showAnimatedBonusBanner(scatterCount, wonSpins);
    }

    updateFreeSpinUI();
}

function showAnimatedBonusBanner(scatters, spins) {
    return new Promise(resolve => {
        const overlay = document.getElementById("bonus-overlay");
        const titleElem = document.getElementById("bonus-scatters-count");
        const spinsElem = document.getElementById("bonus-spins-val");

        titleElem.innerText = `🎉 ${scatters} SCATTERS!`;
        spinsElem.innerText = `${spins} FREE SPINS`;

        overlay.classList.add("active");

        setTimeout(() => {
            overlay.classList.remove("active");
            setTimeout(resolve, 400);
        }, 2000);
    });
}

function updateFreeSpinUI() {
    const bar = document.getElementById("freespin-bar");
    const count = document.getElementById("fs-count");
    if (freeSpinsLeft > 0) {
        bar.style.display = "block";
        count.innerText = freeSpinsLeft;
    } else {
        bar.style.display = "none";
    }
}

function showWinText(text) {
    const elem = document.getElementById("win-text");
    elem.innerText = text;
    elem.style.opacity = "1";
    setTimeout(() => { elem.style.opacity = "0"; }, 1200);
}

function updateBalance() {
    localStorage.setItem("userBalance", balance);
    document.getElementById("bal").innerText = balance.toFixed(2);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

window.addEventListener("resize", resizeCanvas);
initGrid();
setTimeout(resizeCanvas, 100);
