// 1. Music Player
let isPlaying = false;
const audio = document.getElementById("bg-music");
audio.volume = 0.2;
const btn = document.getElementById("music-btn");

function toggleMusic() {
    if (isPlaying) {
        audio.pause();
        btn.innerText = "🎵 Play Music";
        isPlaying = false;
    } else {
        audio.play().then(() => {
            btn.innerText = "⏸ Pause";
            isPlaying = true;
        }).catch(error => {
            console.log("Playback failed:", error);
        });
    }
}

function tryAutoPlay() {
    audio.play().then(() => {
        isPlaying = true;
        btn.innerText = "⏸ Pause";
    }).catch(error => {
        console.log("Audio autoplay failed, waiting for interaction:", error);
        // Fallback: Play on first interaction
        const enableAudio = (e) => {
            // Remove listener on first interaction (whether it's the button or elsewhere)
            document.removeEventListener('click', enableAudio);

            // If the user clicked the music button, let the button's own handler do the work
            if (e.target.closest('#music-btn')) return;

            if (!isPlaying) {
                toggleMusic();
            }
        };
        document.addEventListener('click', enableAudio);
    });
}

// Try to play immediately when loaded
window.addEventListener('load', tryAutoPlay);

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".timeline");
    const svg = document.querySelector(".wavy-svg");
    const path = document.getElementById("wave-path");
    const heart = document.getElementById("flying-heart");

    // 1. Get the mathematical length of the path
    const pathLength = path.getTotalLength();

    // 2. Define the SVG ViewBox dimensions manually (Must match your HTML viewBox="0 0 100 1200")
    const viewBoxWidth = 100;
    const viewBoxHeight = 1200;

    function moveHeart() {
        // A. Calculate how far we scrolled through the timeline section
        const containerRect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Start animation when section enters viewport, end when it leaves
        const startOffset = windowHeight / 2;
        const scrollDist = (windowHeight - containerRect.top) - startOffset;
        const totalDist = containerRect.height; // Height of the physical container on screen

        let percentage = scrollDist / totalDist;
        percentage = Math.max(0, Math.min(1, percentage)); // Clamp between 0 and 1

        // B. Get the x,y coordinates on the raw SVG path
        const point = path.getPointAtLength(percentage * pathLength);

        // C. Calculate the Scaling Factors
        // (How much did the browser stretch the SVG compared to the 0-100 viewBox?)
        const svgRect = svg.getBoundingClientRect();
        const scaleX = svgRect.width / viewBoxWidth;
        const scaleY = svgRect.height / viewBoxHeight;

        // D. Calculate Final Positions
        // 1. Convert SVG coordinate to Pixel coordinate
        let pixelX = point.x * scaleX;
        let pixelY = point.y * scaleY;

        // 2. Adjust for the fact that the SVG is centered in the screen
        // Container Center - Half SVG Width + The Point's X
        const offsetFromLeft = (container.offsetWidth / 2) - (svgRect.width / 2);

        // 3. Subtract half the heart's size (20px) to center the icon
        const heartCenterX = offsetFromLeft + pixelX - 20;
        const heartCenterY = pixelY - 20;

        // Apply
        heart.style.transform = `translate(${heartCenterX}px, ${heartCenterY}px)`;
    }

    // Run on scroll
    window.addEventListener("scroll", moveHeart);
    // Run on resize (in case phone orientation changes)
    window.addEventListener("resize", moveHeart);

    /* =========================================
       5. TOGGLE FIELDS (PLUS ONE & KIDS)
       ========================================= */
    function setupToggle(checkboxId, fieldId) {
        const checkbox = document.getElementById(checkboxId);
        const field = document.getElementById(fieldId);

        if (checkbox && field) {
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    field.classList.add('open');
                    // Делаем поля обязательными, если галочка стоит
                    const inputs = field.querySelectorAll('input');
                    // inputs.forEach(input => input.required = true); // Можно включить, если нужно строго
                } else {
                    field.classList.remove('open');
                    // Убираем обязательность и очищаем
                    const inputs = field.querySelectorAll('input');
                    inputs.forEach(input => {
                        // input.required = false;
                        input.value = ''; // Очистить, если передумали брать
                    });
                }
            });
        }
    }

    // Запускаем логику для обоих переключателей
    setupToggle('check-plus-one', 'field-plus-one');
    setupToggle('check-children', 'field-children');

    /* =========================================
       8. HIDDEN WISH FORM TOGGLE
       ========================================= */
    const commentBtn = document.getElementById('open-comment-btn');
    const rsvpComment = document.getElementById('field-comment');

    if (commentBtn && rsvpComment) {
        commentBtn.addEventListener('click', function (e) {
            e.preventDefault();
            rsvpComment.classList.toggle('open');
        });
    }

    /* =========================================
       9. GIF TO IMAGE SWAP (TOP-BIRDS)
       ========================================= */
    const topGif = document.getElementById('topBirdsGif');
    const topImg = document.getElementById('topBirdsImg');

    if (topGif && topImg) {
        // Function to perform the swap
        const swapBirds = () => {
            topGif.style.display = 'none';
            topImg.style.display = 'block';
        };

        // Play and swap only when visible
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start 3-second timer for GIF swap
                    setTimeout(swapBirds, 5200);

                    // Stop observing once triggered
                    videoObserver.unobserve(topGif);
                }
            });
        }, { threshold: 0.6 }); // Trigger when 50% visible

        videoObserver.observe(topGif);
    }

    /* =========================================
       10. GIF VISIBILITY TRIGGER (BIRDS)
       ========================================= */
    const hugGif = document.getElementById('hugBirdsGif');

    if (hugGif) {
        // Play only when visible (restart GIF by resetting src)
        const gifObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Resetting src restarts the GIF animation from the beginning
                    const currentSrc = hugGif.src;
                    hugGif.src = '';
                    hugGif.src = currentSrc;

                    // We only want to trigger this once
                    gifObserver.unobserve(hugGif);
                }
            });
        }, { threshold: 0.6 }); // Trigger when 50% visible

        gifObserver.observe(hugGif);
    }
});

/* =========================================
   3. SCROLL REVEAL ANIMATION (TEXT EMERGE)
   ========================================= */
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2 // Trigger when 20% visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const items = document.querySelectorAll('.timeline-item');
items.forEach(item => {
    observer.observe(item);
});

// 2. Form Handling
document.getElementById('rsvpForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Gather data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    // Handle checkboxes manually if multiple selected
    data.alcohol = [...document.querySelectorAll('input[name="alcohol"]:checked')].map(e => e.value);

    try {
        // Use relative URL for the backend
        const response = await fetch('/submit-rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            e.target.querySelector('button[type="submit"]').style.display = 'none';
            document.getElementById('form-message').innerText = "Благодарим! Ваш ответ сохранен.";
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
/* =========================================
   6. PROCEDURAL VINES (SCROLLING LIANAS)
   ========================================= */
function initVines() {
    const vineContainer = document.getElementById("vines-container");
    if (!vineContainer) return;

    const container = document.querySelector('.mobile-container') || document.body;
    const height = container.scrollHeight;
    const width = vineContainer.clientWidth || window.innerWidth;
    const centerX = width / 2;

    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", height);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    vineContainer.style.height = height + "px";
    vineContainer.appendChild(svg);

    // defs (градиенты + фильтр)
    const defs = document.createElementNS(xmlns, "defs");
    function makeGradient(id, color, lighter) {
        const lg = document.createElementNS(xmlns, "linearGradient");
        lg.setAttribute("id", id);
        lg.setAttribute("x1", "0");
        lg.setAttribute("y1", "0");
        lg.setAttribute("x2", "0");
        lg.setAttribute("y2", "1");
        const stop1 = document.createElementNS(xmlns, "stop"); stop1.setAttribute("offset", "0%"); stop1.setAttribute("stop-color", lighter);
        const stop2 = document.createElementNS(xmlns, "stop"); stop2.setAttribute("offset", "100%"); stop2.setAttribute("stop-color", color);
        lg.appendChild(stop1); lg.appendChild(stop2);
        return lg;
    }
    defs.appendChild(makeGradient("vineGrad0", "#7a4e2a", "#c79a72"));
    defs.appendChild(makeGradient("vineGrad1", "#6f4a26", "#b68658"));
    const filter = document.createElementNS(xmlns, "filter"); filter.setAttribute("id", "blurShadow");
    const fe = document.createElementNS(xmlns, "feGaussianBlur"); fe.setAttribute("stdDeviation", "2"); fe.setAttribute("result", "blur");
    filter.appendChild(fe); defs.appendChild(filter); svg.appendChild(defs);

    const vineColor = "#8B5A2B";
    const leafColors = ["#6B8E23", "#556B2F", "#A4B494", "#7FB06A"];
    const mainStrokeWidth = 3;

    const pathMeta = [];
    const sides = [
        { startX: 10, amp: 20, grad: "vineGrad0", normalSign: -1 },
        { startX: width - 10, amp: -20, grad: "vineGrad1", normalSign: 1 }
    ];

    sides.forEach((side, pathIndex) => {
        // 1. генерируем d
        let d = `M ${side.startX},0`;
        let currentX = side.startX;
        const stepY = 100;
        for (let y = 0; y < height; y += stepY) {
            const targetX = side.startX + (Math.random() * 40 - 20) + side.amp;
            const midY = y + stepY / 2;
            d += ` Q ${currentX},${midY} ${targetX},${y + stepY}`;
            currentX = targetX;
        }

        // Shadow path (синхронизируем dash)
        const shadowPath = document.createElementNS(xmlns, "path");
        shadowPath.setAttribute("d", d);
        shadowPath.setAttribute("stroke", "#000");
        shadowPath.setAttribute("stroke-width", mainStrokeWidth + 4);
        shadowPath.setAttribute("fill", "none");
        shadowPath.setAttribute("opacity", "0.08");
        shadowPath.setAttribute("filter", "url(#blurShadow)");
        shadowPath.setAttribute("stroke-linecap", "round");
        svg.appendChild(shadowPath);

        // Main vine path
        const path = document.createElementNS(xmlns, "path");
        path.setAttribute("d", d);
        path.setAttribute("stroke", `url(#${side.grad})`);
        path.setAttribute("stroke-width", mainStrokeWidth);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        svg.appendChild(path);

        // важно: path в DOM до getTotalLength
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.dataset.length = length;
        path.classList.add("vine-path");

        shadowPath.style.strokeDasharray = length;
        shadowPath.style.strokeDashoffset = length;
        shadowPath.dataset.length = length;
        shadowPath.classList.add("vine-shadow");

        pathMeta.push({ path, length, shadowPath });

        // 2. Проходим по длине — создаём twig *перед* листьями
        const leafDensity = 70 + Math.random() * 40;
        for (let pos = 30; pos < length - 20; pos += leafDensity) {
            // точка + тангент
            const point = path.getPointAtLength(pos);
            const delta = 2;
            const prev = path.getPointAtLength(Math.max(0, pos - delta));
            const next = path.getPointAtLength(Math.min(length, pos + delta));
            const tx = next.x - prev.x, ty = next.y - prev.y;
            let nx = -ty, ny = tx;
            const normLen = Math.sqrt(nx * nx + ny * ny) || 1;
            nx /= normLen; ny /= normLen;

            // ИСПРАВЛЕНИЕ: определяем направление от центра
            const toCenter = centerX - point.x;
            // если нормаль направлена к центру, инвертируем её
            if (nx * toCenter > 0) {
                nx = -nx;
                ny = -ny;
            }

            // ---- TWIG ----
            let twigCreated = false;
            let twigEnd = null;

            if (Math.random() < 0.35) {
                const maxTwigLen = 12 + Math.random() * 8;

                // Угол относительно направления наружу
                const baseAngle = Math.atan2(ny, nx);
                // Добавляем небольшой наклон вниз (15-45 градусов)
                const angleVariation = (15 + Math.random() * 30) * Math.PI / 180;
                const finalAngle = baseAngle + angleVariation;

                const dx = Math.cos(finalAngle) * maxTwigLen;
                const dy = Math.sin(finalAngle) * maxTwigLen;

                const ex = point.x + dx;
                const ey = point.y + dy;

                const cx = point.x + dx * 0.4;
                const cy = point.y + dy * 0.4;

                const twig = document.createElementNS(xmlns, "path");
                twig.setAttribute(
                    "d",
                    `M ${point.x},${point.y} Q ${cx},${cy} ${ex},${ey}`
                );
                twig.setAttribute("stroke", `url(#${side.grad})`);
                twig.setAttribute("stroke-width", Math.max(0.9, mainStrokeWidth / 1.8));
                twig.setAttribute("fill", "none");
                twig.setAttribute("stroke-linecap", "round");

                twig.style.opacity = "0";
                twig.dataset.pathIndex = pathIndex;
                twig.dataset.pos = pos;

                svg.insertBefore(twig, path);

                twigCreated = true;
                twigEnd = { x: ex, y: ey, nx: dx / maxTwigLen, ny: dy / maxTwigLen };
            }

            // Создаём листья
            const leavesCount = (Math.random() < 0.5) ? 1 : 2;
            for (let li = 0; li < leavesCount; li++) {
                const leafSize = 8 + Math.random() * 14;
                let leafX, leafY, rotation;

                // ИСПРАВЛЕНИЕ: если есть twig, ВСЕГДА привязываем к нему
                if (twigCreated && twigEnd) {
                    // Размещаем лист на конце веточки с небольшим смещением
                    const offset = 2 + Math.random() * 4;
                    leafX = twigEnd.x + twigEnd.nx * offset;
                    leafY = twigEnd.y + twigEnd.ny * offset;
                    // Поворот вдоль направления веточки
                    const twigAngle = Math.atan2(twigEnd.ny, twigEnd.nx) * 180 / Math.PI;
                    rotation = twigAngle + (Math.random() * 30 - 15);
                } else {
                    // Без twig - размещаем близко к стволу по нормали
                    const offset = 4 + Math.random() * 8;
                    leafX = point.x + nx * offset;
                    leafY = point.y + ny * offset;
                    const normalAngle = Math.atan2(ny, nx) * 180 / Math.PI;
                    rotation = normalAngle + (Math.random() * 40 - 20);
                }

                const color = leafColors[Math.floor(Math.random() * leafColors.length)];

                const g = document.createElementNS(xmlns, "g");
                g.classList.add("vine-leaf");
                g.dataset.pathIndex = pathIndex;
                g.dataset.pos = pos;
                g.setAttribute("transform", `translate(${leafX}, ${leafY}) rotate(${rotation}) scale(0)`);
                g.style.opacity = "0";
                g.style.transition = "transform 0.42s cubic-bezier(0.175,0.885,0.32,1.275), opacity .3s ease";

                // ИСПРАВЛЕНИЕ: petiole (черешок) всегда направлен к точке крепления
                const petiole = document.createElementNS(xmlns, "path");
                // В локальных координатах листа petiole идет от небольшого смещения к (0,0)
                const petioleLen = leafSize * 0.3;
                const petD = `M ${-petioleLen}, 0 L 0, 0`;
                petiole.setAttribute("d", petD);
                petiole.setAttribute("stroke", shadeColor(color, -40));
                petiole.setAttribute("stroke-width", Math.max(0.8, leafSize / 8));
                petiole.setAttribute("fill", "none");
                petiole.setAttribute("stroke-linecap", "round");

                const leafPath = document.createElementNS(xmlns, "path");
                const baseLeaf = "M0,0 C 6,-10 22,-10 32,0 C 22,8 6,8 0,0 Z";
                leafPath.setAttribute("d", baseLeaf);
                leafPath.setAttribute("fill", color);
                leafPath.setAttribute("stroke", shadeColor(color, -25));
                leafPath.setAttribute("stroke-width", "0.45");

                const scale = leafSize / 32;
                const innerG = document.createElementNS(xmlns, "g");
                innerG.setAttribute("transform", `scale(${scale})`);
                innerG.appendChild(petiole);
                innerG.appendChild(leafPath);
                g.appendChild(innerG);

                svg.appendChild(g);
            }
        }
    });

    // Scroll listener
    function onScroll() {
        const scrollTop = window.scrollY;
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const baseProgress = Math.min(1, (scrollTop + winHeight * 0.25) / docHeight + 0.02);

        pathMeta.forEach(({ path, length, shadowPath }, idx) => {
            const progress = baseProgress;
            const drawLength = length * progress;
            const offset = Math.max(0, length - drawLength);
            path.style.strokeDashoffset = offset;
            const shadowLag = 6;
            shadowPath.style.strokeDashoffset = Math.max(0, offset + shadowLag);
        });

        const allElems = svg.querySelectorAll("[data-pos]");
        allElems.forEach(el => {
            const pIndex = parseInt(el.dataset.pathIndex, 10);
            const pos = parseFloat(el.dataset.pos);
            if (Number.isNaN(pIndex) || !pathMeta[pIndex]) return;
            const meta = pathMeta[pIndex];
            const drawLength = meta.length * baseProgress;
            if (drawLength + 4 >= pos) {
                el.style.opacity = "1";
                if (el.classList && el.classList.contains("vine-leaf")) {
                    const cur = el.getAttribute("transform") || "";
                    const shown = cur.replace(/scale\([^\)]+\)/, "scale(1)");
                    el.setAttribute("transform", shown);
                }
            } else {
                el.style.opacity = "0";
                if (el.classList && el.classList.contains("vine-leaf")) {
                    const cur = el.getAttribute("transform") || "";
                    const hidden = cur.replace(/scale\([^\)]+\)/, "scale(0)");
                    el.setAttribute("transform", hidden);
                }
            }
        });
    }

    window.addEventListener("scroll", throttle(onScroll, 16));
    onScroll();

    // ---- утилиты ----
    function shadeColor(hex, percent) {
        const h = hex.replace("#", "");
        const num = parseInt(h, 16);
        let r = (num >> 16) + percent;
        let g = ((num >> 8) & 0x00FF) + percent;
        let b = (num & 0x0000FF) + percent;
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    function throttle(fn, wait) {
        let time = Date.now();
        return function () {
            if ((time + wait - Date.now()) < 0) {
                fn();
                time = Date.now();
            }
        }
    }
}



// Init vines
initVines();

// --- COUNTDOWN TIMER LOGIC ---
function initCountdown() {
    const targetDate = new Date("2026-08-01T17:00:00+06:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const timeLeft = targetDate - now;

        if (timeLeft <= 0) {
            document.getElementById("countdown-container").innerHTML = "Мы Счастливы!";
            return;
        }

        // Time calculations
        const weeks = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 7));
        const days = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Update HTML
        document.getElementById("weeks").innerText = String(weeks).padStart(2, '0');
        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    };

    updateCountdown(); // Run once immediately
    setInterval(updateCountdown, 1000);
}

initCountdown();
