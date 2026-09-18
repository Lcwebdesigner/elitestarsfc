document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("active");
        menuToggle.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
    });

    document.querySelectorAll(".nav-menu a").forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("active");
            menuToggle.textContent = "☰";
        });
    });

    const counters = document.querySelectorAll(".counter");

    const observer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            const counter = entry.target;
            const target = Number(counter.dataset.target);
            let current = 0;
            const increment = Math.max(1, Math.ceil(target / 40));

            const updateCounter = function () {
                current += increment;

                if (current >= target) {
                    counter.textContent = target;
                    return;
                }

                counter.textContent = current;
                requestAnimationFrame(updateCounter);
            };

            updateCounter();
            observer.unobserve(counter);
        });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
        observer.observe(counter);
    });

    document.getElementById("year").textContent = new Date().getFullYear();

    loadSquad();
});

function loadSquad() {
    const grid = document.getElementById("playersGrid");
    if (!grid) return;

    fetch("player.json")
        .then(function (response) {
            if (!response.ok) throw new Error("Could not load player.json");
            return response.json();
        })
        .then(function (players) {
            if (!Array.isArray(players) || players.length === 0) {
                grid.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No players added yet.</p>';
                return;
            }
            grid.innerHTML = players.map(renderPlayerCard).join("");
        })
        .catch(function (err) {
            console.error("Squad load error:", err);
            grid.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">Squad data unavailable.</p>';
        });
}

function renderPlayerCard(player, index) {
    const number = player.number != null ? String(player.number).padStart(2, "0") : String(index + 1).padStart(2, "0");
    const name = escapeHtml(player.name || "Unnamed");
    const position = escapeHtml(player.position || "");
    const stats = player.stats || {};
    const apps = stats.appearances != null ? stats.appearances : 0;
    const goals = stats.goals != null ? stats.goals : 0;
    const assists = stats.assists != null ? stats.assists : 0;

    const media = player.photo
        ? `<img class="player-photo" src="${escapeHtml(player.photo)}" alt="${name}" loading="lazy" decoding="async" width="300" height="170">`
        : `<div class="player-placeholder">ES</div>`;

    return `
      <article class="player-card">
        <div class="player-number">${number}</div>
        ${media}
        <div class="player-info">
          <span>PLAYER ${number}</span>
          <h3>${name}</h3>
          <p>${position}</p>
          <div class="player-stats">
            <div><strong>${apps}</strong><span>Apps</span></div>
            <div><strong>${goals}</strong><span>Goals</span></div>
            <div><strong>${assists}</strong><span>Assists</span></div>
          </div>
        </div>
      </article>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}