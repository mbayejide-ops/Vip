// Strict Symbol Generator based on REALTIME LocalStorage
function getRandomSymbol(colIndex = 0) {
    // প্রতিটা সিম্বল জেনারেট হওয়ার সময় সরাসরি LocalStorage থেকে রিড করবে
    const currentLuck = localStorage.getItem("userLuck") || "normal";
    let rand = Math.random() * 100;

    if (currentLuck === "low") {
        // Low Luck Pattern: A, K, Q এমনভাবে সাজানো যাতে ৩টা ম্যাচিং রিলে না আসে
        if (colIndex === 0) return SYMBOLS[3]; // A
        if (colIndex === 1) return SYMBOLS[4]; // K
        if (colIndex === 2) return SYMBOLS[5]; // Q
        if (colIndex === 3) return SYMBOLS[3]; // A
        return SYMBOLS[4];                     // K
    } else if (currentLuck === "high") {
        if (rand < 25) return SYMBOLS[7];  // Scatter 25%
        if (rand < 50) return SYMBOLS[6];  // Wild 25%
        if (rand < 75) return SYMBOLS[0];  // Cherry 25%
        return SYMBOLS[1];                 // Lemon
    } else {
        if (rand < 5) return SYMBOLS[7];   // Scatter 5%
        if (rand < 12) return SYMBOLS[6];  // Wild 7%
        if (rand < 24) return SYMBOLS[0];
        if (rand < 38) return SYMBOLS[1];
        if (rand < 54) return SYMBOLS[2];
        if (rand < 70) return SYMBOLS[3];
        if (rand < 85) return SYMBOLS[4];
        return SYMBOLS[5];
    }
}

// Start Spin Function
async function startSpin() {
    const betVal = parseFloat(document.getElementById("bet-amount").value);

    // স্পিন শুরু করার সময় আবার জোরপূর্বক চেক করবে
    const activeLuck = localStorage.getItem("userLuck");
    console.log("Current Active Luck for this Spin:", activeLuck);

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

// Low Luck থাকলে কোনো জয় হবে না
function checkWinningCombinations() {
    const currentLuck = localStorage.getItem("userLuck") || "normal";
    
    // Low Luck ইউজারের জন্য পুরোপুরি উইন ব্লক
    if (currentLuck === "low") {
        return { winAmount: 0, winningPositions: [] };
    }

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
