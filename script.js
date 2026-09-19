document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    /* ---------- MOBILE MENU ---------- */

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function () {
            navMenu.classList.toggle("active");
            menuToggle.textContent =
                navMenu.classList.contains("active") ? "✕" : "☰";
        });

        document.querySelectorAll(".nav-menu a").forEach(function (link) {
            link.addEventListener("click", function () {
                navMenu.classList.remove("active");
                menuToggle.textContent = "☰";
            });
        });
    }

    /* ---------- COUNTERS ---------- */

    const counters = document.querySelectorAll(".counter");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                const counter = entry.target;
                const target = Number(counter.dataset.target);
                let current = 0;
                const increment = Math.max(1, Math.ceil(target / 40));

                function updateCounter() {
                    current += increment;

                    if (current >= target) {
                        counter.textContent = target;
                        return;
                    }

                    counter.textContent = current;
                    requestAnimationFrame(updateCounter);
                }

                updateCounter();
                observer.unobserve(counter);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (counter) {
            observer.observe(counter);
        });
    } else {
        counters.forEach(function (counter) {
            counter.textContent = counter.dataset.target || "0";
        });
    }

    /* ---------- YEAR ---------- */

    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    /* ---------- LOAD CONTENT ---------- */

    loadSquad();
    loadFixtures();
    loadNews();
});


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://qwftlxobrdhthpfkbqhq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ayuGaIFLxTUE8Htw329SAw_8w7XiskU";

let supabaseClient = null;


function initSupabase() {

    if (supabaseClient) {
        return supabaseClient;
    }

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {
        console.error("Supabase library was not loaded.");
        return null;
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    return supabaseClient;
}


/* =========================================================
   SQUAD
========================================================= */

async function loadSquad() {

    const grid = document.getElementById("playersGrid");

    if (!grid) {
        return;
    }

    try {

        const client = initSupabase();

        if (!client) {
            throw new Error("Supabase client unavailable.");
        }

        const { data, error } = await client
            .from("players")
            .select("*")
            .order("number", {
                ascending: true,
                nullsFirst: false
            });

        if (error) {
            console.error("Supabase squad error:", error);
            throw error;
        }

        if (!Array.isArray(data) || data.length === 0) {

            grid.innerHTML =
                '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No players added yet.</p>';

            return;
        }

        grid.innerHTML = data.map(function (player, index) {

            return renderPlayerCard(
                {
                    id: player.id,
                    name: player.name,
                    position: player.position,
                    number: player.number,
                    photo: player.photo || "",

                    stats: {
                        appearances:
                            player.appearances || 0,

                        goals:
                            player.goals || 0,

                        assists:
                            player.assists || 0
                    }
                },
                index
            );

        }).join("");

    } catch (error) {

        console.error("Squad load error:", error);

        grid.innerHTML =
            '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">Squad data unavailable.</p>';
    }
}


/* =========================================================
   PLAYER CARD
========================================================= */

function renderPlayerCard(player, index) {

    const number =
        player.number != null
            ? String(player.number).padStart(2, "0")
            : String(index + 1).padStart(2, "0");

    const name =
        escapeHtml(player.name || "Unnamed");

    const position =
        escapeHtml(player.position || "");

    const stats =
        player.stats || {};

    const apps =
        stats.appearances != null
            ? stats.appearances
            : 0;

    const goals =
        stats.goals != null
            ? stats.goals
            : 0;

    const assists =
        stats.assists != null
            ? stats.assists
            : 0;


    const media = player.photo

        ? '<img class="player-photo" src="' +
          escapeHtml(player.photo) +
          '" alt="' +
          name +
          '" loading="lazy" decoding="async">'

        : '<div class="player-placeholder">ES</div>';


    return '' +

        '<article class="player-card">' +

            '<div class="player-number">' +
                number +
            '</div>' +

            media +

            '<div class="player-info">' +

                '<span>PLAYER ' +
                    number +
                '</span>' +

                '<h3>' +
                    name +
                '</h3>' +

                '<p>' +
                    position +
                '</p>' +

                '<div class="player-stats">' +

                    '<div>' +
                        '<strong>' +
                            apps +
                        '</strong>' +
                        '<span>Apps</span>' +
                    '</div>' +

                    '<div>' +
                        '<strong>' +
                            goals +
                        '</strong>' +
                        '<span>Goals</span>' +
                    '</div>' +

                    '<div>' +
                        '<strong>' +
                            assists +
                        '</strong>' +
                        '<span>Assists</span>' +
                    '</div>' +

                '</div>' +

            '</div>' +

        '</article>';
}


/* =========================================================
   FIXTURES
========================================================= */

function loadFixtures() {

    const container =
        document.getElementById("fixturesGrid") ||
        document.getElementById("fixturesContainer") ||
        document.getElementById("fixturesList");

    if (!container) {
        return;
    }

    const client = initSupabase();
    if (!client) {
        container.innerHTML =
            '<p style="text-align:center;color:var(--gray);">Fixtures unavailable.</p>';
        return;
    }

    client
        .from("fixtures")
        .select("*")
        .order("date", { ascending: true, nullsFirst: false })
        .then(function ({ data, error }) {

            if (error) {
                console.error("Fixtures load error:", error);
                throw error;
            }

            if (!Array.isArray(data) || data.length === 0) {

                container.innerHTML =
                    '<p style="text-align:center;color:var(--gray);">No fixtures available.</p>';

                return;
            }

            container.innerHTML =
                data
                    .map(renderFixtureCard)
                    .join("");
        })

        .catch(function (error) {

            console.error("Fixtures load error:", error);

            container.innerHTML =
                '<p style="text-align:center;color:var(--gray);">Fixtures unavailable.</p>';
        });
}


function renderFixtureCard(fixture) {

    const home =
        escapeHtml(fixture.home_team || fixture.home || "Home");

    const away =
        escapeHtml(fixture.away_team || fixture.away || "Away");

    const date =
        escapeHtml(fixture.date || "");

    const time =
        escapeHtml(fixture.time || "");

    const venue =
        escapeHtml(fixture.venue || "");

    return '' +

        '<article class="fixture-card">' +

            '<div class="fixture-date">' +
                date +
            '</div>' +

            '<div class="fixture-teams">' +

                '<strong>' +
                    home +
                '</strong>' +

                '<span>VS</span>' +

                '<strong>' +
                    away +
                '</strong>' +

            '</div>' +

            '<div class="fixture-details">' +

                (time
                    ? '<span>' + time + '</span>'
                    : '') +

                (venue
                    ? '<span>' + venue + '</span>'
                    : '') +

            '</div>' +

        '</article>';
}


/* =========================================================
   NEWS
========================================================= */

function loadNews() {

    const container =
        document.getElementById("newsGrid") ||
        document.getElementById("newsContainer") ||
        document.getElementById("newsList");

    if (!container) {
        return;
    }

    const client = initSupabase();
    if (!client) {
        container.innerHTML =
            '<p style="text-align:center;color:var(--gray);">News unavailable.</p>';
        return;
    }

    client
        .from("news")
        .select("*")
        .order("date", { ascending: false, nullsFirst: false })
        .then(function ({ data, error }) {

            if (error) {
                console.error("News load error:", error);
                throw error;
            }

            if (!Array.isArray(data) || data.length === 0) {

                container.innerHTML =
                    '<p style="text-align:center;color:var(--gray);">No news available.</p>';

                return;
            }

            container.innerHTML =
                data
                    .map(renderNewsCard)
                    .join("");
        })

        .catch(function (error) {

            console.error("News load error:", error);

            container.innerHTML =
                '<p style="text-align:center;color:var(--gray);">News unavailable.</p>';
        });
}


function renderNewsCard(item) {

    const title =
        escapeHtml(item.title || "Elite Stars FC");

    const description =
        escapeHtml(
            item.content ||
            item.description ||
            item.excerpt ||
            ""
        );

    const date =
        escapeHtml(item.date || "");

    const image =
        item.image
            ? '<img src="' +
              escapeHtml(item.image) +
              '" alt="' +
              title +
              '" loading="lazy">'
            : "";


    return '' +

        '<article class="news-card">' +

            image +

            '<div class="news-content">' +

                (date
                    ? '<span class="news-date">' +
                      date +
                      '</span>'
                    : '') +

                '<h3>' +
                    title +
                '</h3>' +

                '<p>' +
                    description +
                '</p>' +

            '</div>' +

        '</article>';
}


/* =========================================================
   SECURITY / HTML ESCAPING
========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}
