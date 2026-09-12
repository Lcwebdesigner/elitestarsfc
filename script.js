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
});
