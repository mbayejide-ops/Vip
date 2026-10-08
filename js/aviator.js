// Dynamic History Rendering according to new color logic
function renderHistory() {
    const histContainer = document.getElementById("history");
    histContainer.innerHTML = "";
    historyData.slice(-15).reverse().forEach(val => {
        const span = document.createElement("span");
        const num = parseFloat(val);
        
        let colorClass = "badge-blue";
        if (num >= 2.00 && num < 10.00) {
            colorClass = "badge-purple";
        } else if (num >= 10.00) {
            colorClass = "badge-red";
        }

        span.className = `badge ${colorClass}`;
        span.innerText = val;
        histContainer.appendChild(span);
    });
}

// Multiplier Color Updater inside Flight Loop
function updateMultiplierColor(mult) {
    const multText = document.getElementById("multiplier");
    
    if (mult >= 10.00) {
        multText.className = "overlay-multiplier mult-red";
    } else if (mult >= 2.00) {
        multText.className = "overlay-multiplier mult-purple";
    } else {
        multText.className = "overlay-multiplier mult-blue";
    }
}

// startFlight() Function-er animation block-e eivabe replace korun:
function startFlight() {
    isPlaying = true;
    currentMultiplier = 1.00;
    progress = 0;
    
    targetMultiplier = (Math.random() * (100.00 - 3.00) + 3.00).toFixed(2);

    const multText = document.getElementById("multiplier");
    const btn = document.getElementById("main-btn");

    if (hasBetted) {
        btn.innerText = "CASH OUT";
        btn.className = "btn-main btn-cashout";
        btn.style.opacity = "1";
    }

    function animate() {
        if (!isPlaying) return;

        currentMultiplier += 0.02;
        progress = Math.min(1, progress + 0.005);

        multText.innerText = currentMultiplier.toFixed(2) + "x";

        // Dynamic Color Switcher Execution
        updateMultiplierColor(currentMultiplier);

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
