let floor = 0;
let progress = 0;
let lastSpottedFloor = -1;
let twistedSlots = 2;

function getMainChance(currentFloor, slots = twistedSlots) {
    if (currentFloor < 5) return 0;
    if (currentFloor > 0 && currentFloor % 20 === 0) return 100;

    // Community-documented rarity weights.
    const rareWeight = 10 + Math.floor((currentFloor - 3) / 2);
    const mainWeight = 4 * Math.floor(currentFloor / 5);
    const totalWeight = 75 + 25 + rareWeight + mainWeight;
    const chancePerSlot = mainWeight / totalWeight;

    // Probability of at least one Main across N Twisted slots.
    return (1 - Math.pow(1 - chancePerSlot, slots)) * 100;
}

function updateChance() {
    progress = getMainChance(floor);
    const capsuleNumber = document.getElementById("capsuleNumber");
    if (capsuleNumber) capsuleNumber.textContent = progress.toFixed(2).replace(/\.00$/, "") + "%";

    const bar = document.getElementById("progressBar");
    if (bar) {
        bar.style.height = (progress * 0.72) + "%";
        bar.classList.toggle("progress-full", progress >= 100);
        bar.classList.toggle("progress-normal", progress < 100);
    }
    tableVerifier();
}

function addSlotSelector() {
    const floorHeading = document.getElementById("floor")?.closest("h2");
    if (!floorHeading || document.getElementById("twistedSlots")) return;

    const wrapper = document.createElement("div");
    wrapper.style.margin = "12px 0";
    wrapper.className = "twisted-slots-control";

    const label = document.createElement("label");
    label.htmlFor = "twistedSlots";
    label.textContent = "Twisted slots on this Floor: ";
    label.style.marginRight = "8px";

    const select = document.createElement("select");
    select.id = "twistedSlots";
    select.className = "form-select d-inline-block";
    select.style.width = "auto";
    select.style.minWidth = "80px";
    select.setAttribute("aria-label", "Number of Twisted slots on this floor");

    for (let amount = 2; amount <= 8; amount++) {
        const option = document.createElement("option");
        option.value = String(amount);
        option.textContent = String(amount);
        if (amount === twistedSlots) option.selected = true;
        select.appendChild(option);
    }

    select.addEventListener("change", () => {
        twistedSlots = Number(select.value);
        updateChance();
    });

    wrapper.append(label, select);
    floorHeading.insertAdjacentElement("afterend", wrapper);
}

function tableVerifier() {
    const floors = [
        { min: 0, max: 4, id: "f0To4" },
        { min: 5, max: 9, id: "f5To9" },
        { min: 10, max: 14, id: "f10To14" },
        { min: 15, max: 19, id: "f15To19" },
        { condition: f => f > 0 && f % 20 === 0, id: "f20" },
        { min: 21, max: 24, id: "f21To24" },
        { condition: f => f >= 25 && f % 20 !== 0, id: "f25Plus" }
    ];

    floors.forEach(({ min, max, condition, id }) => {
        const row = document.getElementById(id);
        if (!row) return;
        const active = condition ? condition(floor) : floor >= min && floor <= max;
        row.classList.toggle("textoVerde", active);
        row.classList.toggle("textoPreto", !active);
    });

    const setCell = (id, value) => {
        const cell = document.getElementById(id)?.querySelector("td");
        if (cell) cell.textContent = value;
    };
    const range = (start, end) =>
        getMainChance(start).toFixed(2) + "% – " + getMainChance(end).toFixed(2) + "%";

    setCell("f0To4", "0%");
    setCell("f5To9", range(5, 9));
    setCell("f10To14", range(10, 14));
    setCell("f15To19", range(15, 19));
    setCell("f20", "100% (guaranteed)");
    setCell("f21To24", range(21, 24));
    setCell("f25Plus", "Varies by Floor — see capsule");
}

function prevFloor() {
    if (floor <= 0) {
        const Tv_Click = new Audio("./sfx/Tv_Click.mp3");
        Tv_Click.play();
        return;
    }

    floor--;
    const Tape = new Audio("./sfx/Tape.mp3");
    Tape.volume = 0.5;
    Tape.play();
    document.getElementById("floor").textContent = floor;
    updateChance();
}

function nextFloor() {
    floor++;
    document.getElementById("floor").textContent = floor;

    if (floor <= 4) {
        const RUI = new Audio("./sfx/RUI.mp3");
        RUI.play();
    } else {
        const Ichor_Gain = new Audio("./sfx/Ichor_Gain.mp3");
        Ichor_Gain.volume = 0.65;
        Ichor_Gain.play();
        spawnDrops(16 + Math.floor(Math.random() * 10));
    }

    if (floor > 0 && floor % 20 === 0) {
        const FM = new Audio("./sfx/FM.mp3");
        FM.play();
    }
    updateChance();
}

function resetFloor() {
    if (floor === 0) {
        const Tv_Click = new Audio("./sfx/Tv_Click.mp3");
        Tv_Click.play();
        return;
    }

    floor = 0;
    lastSpottedFloor = -1;
    const Tv_Off = new Audio("./sfx/Tv_Off.mp3");
    Tv_Off.play();

    document.getElementById("floor").textContent = floor;
    const historico = document.getElementById("mainSpotted");
    if (historico) {
        historico.innerHTML = "";
        historico.classList.remove("container-css-historico");
    }
    updateChance();
}

function mainSpotted() {
    if (floor === lastSpottedFloor) {
        const Tv_Click = new Audio("./sfx/Tv_Click.mp3");
        Tv_Click.play();
        return;
    }

    if (floor <= 4) {
        const Tv_Click = new Audio("./sfx/Tv_Click.mp3");
        Tv_Click.play();
        document.getElementById("mainSpotted").innerHTML = "";
        return;
    }

    const VT = new Audio("./sfx/VT.mp3");
    VT.play();
    lastSpottedFloor = floor;

    // The probability describes this Floor, so spotting a Main doesn't reset it.
    const historico = document.getElementById("mainSpotted");
    const novaLinha = document.createElement("div");
    novaLinha.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
        </svg> Main Twisted spotted in Floor ${floor}!
    `;

    historico.classList.add("container-css-historico");
    historico.appendChild(novaLinha);
    while (historico.children.length > 10) {
        historico.removeChild(historico.firstChild);
    }
}

function clearHistory() {
    const historico = document.getElementById("mainSpotted");
    if (historico && historico.innerHTML !== "") {
        const SE = new Audio("./sfx/SE.mp3");
        SE.currentTime = 1.5;
        SE.play();
        historico.innerHTML = "";
        historico.classList.remove("container-css-historico");
    } else {
        const Tv_Click = new Audio("./sfx/Tv_Click.mp3");
        Tv_Click.play();
    }
}

function spawnDrops(quantidade = 10) {
    const wrapper = document.getElementById("capsuleWrapper");
    if (!wrapper) return;

    // ===== SHAKE DA CÁPSULA =====
    wrapper.classList.remove("shake");
    void wrapper.offsetWidth;
    wrapper.classList.add("shake");

    setTimeout(() => {
        wrapper.classList.remove("shake");
    }, 450);

    // ===== ORIGEM DO RESPINGO =====
    const originX = wrapper.clientWidth / 2;
    const fillRatio = (progress / 100) * 0.72;

    const originY =
        wrapper.clientHeight * (1 - fillRatio - 0.12);

    // Menos partículas = efeito mais leve
    quantidade = Math.min(quantidade, 12);

    for (let i = 0; i < quantidade; i++) {
        const drop = document.createElement("img");

        drop.src = "imgs/Ichor.png";
        drop.className = "drop";
        drop.alt = "";

        // Tamanhos pequenos e variados
        const size = 7 + Math.random() * 11;

        drop.style.width = `${size}px`;
        drop.style.height = `${size}px`;

        // Todas nascem próximas umas das outras
        drop.style.left = `${originX + (Math.random() * 16 - 8)}px`;
        drop.style.top = `${originY + (Math.random() * 12 - 6)}px`;

        // Direção: espalha para os lados e para cima
        const angle =
            (Math.random() * 150 - 75) * Math.PI / 180;

        const distance = 45 + Math.random() * 85;

        const tx = Math.sin(angle) * distance;
        const ty = -Math.cos(angle) * distance;

        const rot = (Math.random() * 360 - 180) + "deg";

        drop.style.setProperty("--tx", `${tx}px`);
        drop.style.setProperty("--ty", `${ty}px`);
        drop.style.setProperty("--rot", rot);

        // Cada gota tem seu próprio ritmo
        const duration = 0.35 + Math.random() * 0.3;

        drop.style.animation =
            `splash ${duration}s cubic-bezier(.2,.7,.3,1) forwards`;

        wrapper.appendChild(drop);

        // Remove a partícula após a animação
        drop.addEventListener("animationend", () => {
            drop.remove();
        }, { once: true });
    }
}


addSlotSelector();
updateChance();
