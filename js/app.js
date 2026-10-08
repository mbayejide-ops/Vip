const gamesList = [
    {
        id: "aviator",
        name: "এভিয়েটর",
        icon: "https://raw.githubusercontent.com/bayejidgamingff1/Image/main/aviator.jpg",
        link: "games/aviator.html"
    },
    {
        id: "superace",
        name: "সুপার এস",
        icon: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Super+Ace",
        link: "#"
    },
    {
        id: "highflyer",
        name: "হাই ফ্লায়ার",
        icon: "https://via.placeholder.com/150/0000FF/FFFFFF?text=High+Flyer",
        link: "#"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("games-grid");
    if (grid) {
        gamesList.forEach(game => {
            const card = document.createElement("div");
            card.className = "game-card";
            card.innerHTML = `
                <img src="${game.icon}" alt="${game.name}">
                <p>${game.name}</p>
            `;
            card.onclick = () => {
                if (game.link !== "#") {
                    window.location.href = game.link;
                } else {
                    alert("এই গেমটি শীঘ্রই আসছে!");
                }
            };
            grid.appendChild(card);
        });
    }
});
