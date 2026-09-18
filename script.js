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
    loadFixtures();
    loadNews();
});

/* ---------- SUPABASE ---------- */

const SUPABASE_URL = "https://qwftlxobrdhthpfkbhqh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ayuGaIFLxTUE8Htw329SAw_8w7XiskU";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

/* ---------- SQUAD ---------- */

async function loadSquad() {
    const grid = document.getElementById("playersGrid");
    if (!grid) return;

    try {
        const { data, error } = await supabaseClient
            .from("players")
            .select("*")
            .order("number", { ascending: true, nullsFirst: false });

        if (error) throw error;

        const players = (data || []).map(function (p) {
            return {
                id: p.id,
                name: p.name,
                position: p.position,
                number: p.number,
                photo: p.photo || "",
                stats: {
                    appearances: p.appearances || 0,
                    goals: p.goals || 0,
                    assists: p.assists || 0
                }
            };
        });

        if (players.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No players added yet.</p>';
            return;
        }

        grid.innerHTML = players.map(renderPlayerCard).join("");
    } catch (err) {
        console.error("Supabase squad load error:", err);

        /* Keep the existing player.json as a fallback. */
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
            .catch(function (fallbackError) {
                console.error("Squad fallback error:", fallbackError);
                grid.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">Squad data unavailable.</p>';
            });
    }
}

/* ---------- FIXTURES ---------- */

function loadFixtures() {
    const list = document.getElementById("fixturesList");
    if (!list) return;

    fetch("fixtures.json")
        .then(function (response) {
            if (!response.ok) throw new Error("Could not load fixtures.json");
            return response.json();
        })
        .then(function (fixtures) {
            if (!Array.isArray(fixtures) || fixtures.length === 0) {
                list.innerHTML = '<p style="text-align:center;color:var(--gray);">No fixtures scheduled yet.</p>';
                return;
            }
            list.innerHTML = fixtures.map(renderFixtureCard).join("");
        })
        .catch(function (err) {
            console.error("Fixtures load error:", err);
            list.innerHTML = '<p style="text-align:center;color:var(--gray);">Fixture data unavailable.</p>';
        });
}

function renderFixtureCard(fixture) {
    const homeTeam = escapeHtml(fixture.homeTeam || "TBC");
    const awayTeam = escapeHtml(fixture.awayTeam || "TBC");
    const date = escapeHtml(fixture.date || "--");
    const time = escapeHtml(fixture.time || "--:--");

    return '' +
      '<article class="fixture-card">' +
        '<div class="fixture-date"><span>DATE</span><strong>' + date + '</strong></div>' +
        '<div class="fixture-teams">' +
          '<div><strong>' + homeTeam + '</strong><small>HOME</small></div>' +
          '<span class="vs">VS</span>' +
          '<div><strong>' + awayTeam + '</strong><small>AWAY</small></div>' +
        '</div>' +
        '<div class="fixture-time">' + time + '</div>' +
      '</article>';
}

/* ---------- NEWS ---------- */

function loadNews() {
    const list = document.getElementById("newsList");
    if (!list) return;

    fetch("news.json")
        .then(function (response) {
            if (!response.ok) throw new Error("Could not load news.json");
            return response.json();
        })
        .then(function (news) {
            if (!Array.isArray(news) || news.length === 0) {
                list.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No news posted yet.</p>';
                return;
            }
            list.innerHTML = news.map(renderNewsCard).join("");
        })
        .catch(function (err) {
            console.error("News load error:", err);
            list.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">News unavailable.</p>';
        });
}

function renderNewsCard(item) {
    const title = escapeHtml(item.title || "Untitled");
    const date = escapeHtml(item.date || "");
    const content = escapeHtml(item.content || "");
    const image = item.image
        ? '<img class="news-image" src="' + escapeHtml(item.image) + '" alt="' + title + '" loading="lazy" decoding="async" width="400" height="160">'
        : '';

    return '' +
      '<article class="news-card">' +
        image +
        (date ? '<div class="news-date">' + date + '</div>' : '') +
        '<h3>' + title + '</h3>' +
        '<p>' + content + '</p>' +
      '</article>';
}

/* ---------- SHARED ---------- */

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
