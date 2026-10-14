let floor = 0;
let progress = 0;
let pity = 0;
let currentMode = "percentage";
let spottedFloors = [];
let lastSpottedFloor = -1;
let isBreakFloor = false;

function playSound(path, volume = 1, currentTime = 0) {
    const sound = new Audio(path);
    sound.volume = volume;
    sound.currentTime = currentTime;
    sound.play().catch(() => {});
}

function getFloorProgress(f) {
    if (f <= 4) return 0;
    if (f <= 9) return 3;
    if (f <= 14) return 7;
    if (f <= 19) return 9;
    if (f > 0 && f % 20 === 0) return 100;
    if (f <= 25) return 12;
    return 15;
}

function getPityProgress(f) {
    let total = 0;
    const start = Math.max(0, lastSpottedFloor + 1);

    for (let i = start; i <= f; i++) {
        total += getFloorProgress(i);
    }

    return total;
}

function updateProgress() {
    pity = getPityProgress(floor);
    progress = currentMode === "pity" ? pity : getFloorProgress(floor);
    progress = Math.min(progress, 100);
}

function changeMode() {
    const tc = document.getElementById("trackerMode");
    if (!tc) return;

    if (currentMode === "percentage") {
        currentMode = "pity";
        tc.innerHTML = "Pity System";
        tc.classList.remove("persys");
        tc.classList.add("pitsys");
    } else {
        currentMode = "percentage";
        tc.innerHTML = "Percentage System";
        tc.classList.add("persys");
        tc.classList.remove("pitsys");
    }

    playSound("./sfx/MM.mp3", 0.3, 0.19);

    // Reset total ao trocar de modo
    floor = 0;
    progress = 0;
    pity = 0;
    spottedFloors = [];
    lastSpottedFloor = -1;
    isBreakFloor = false;

    updateFloorDisplay();

    const historico = document.getElementById("mainSpotted");
    if (historico) {
        historico.innerHTML = "";
        historico.classList.remove("container-css-historico");
    }

    tableVerifier();
    updateProgress();
    updateCapsule();
}

function updateCapsule() {
    const capsuleNumber = document.getElementById("capsuleNumber");
    const bar = document.getElementById("progressBar");

    if (capsuleNumber) {
        capsuleNumber.innerHTML = progress + "%";
    }

    if (bar) {
        const visualProgress = Math.min(progress, 100);
        bar.style.height = (visualProgress * 0.72) + "%";
        bar.classList.toggle("progress-full", progress >= 100);
        bar.classList.toggle("progress-normal", progress < 100);
    }
}

function updateFloorDisplay() {
    const floorEl = document.getElementById("floor");
    if (!floorEl) return;

    floorEl.innerHTML = isBreakFloor ? "Break Floor" : floor;
}

function tableVerifier() {
    const floors = [
        { min: 0, max: 4, id: "f0To4" },
        { min: 5, max: 9, id: "f5To9" },
        { min: 10, max: 14, id: "f10To14" },
        { min: 15, max: 19, id: "f15To19" },
        { condition: f => f > 0 && f % 20 === 0, id: "f20" },
        { min: 21, max: 25, id: "f21To25" },
        { min: 26, max: 26, id: "f26" },
        { condition: f => f >= 27 && f % 20 !== 0, id: "f27Plus" }
    ];

    floors.forEach(({ min, max, condition, id }) => {
        const row = document.getElementById(id);
        if (!row) return;

        const active = !isBreakFloor && (
            condition
                ? condition(floor)
                : floor >= min && floor <= max
        );

        row.classList.toggle("textoVerde", active);
        row.classList.toggle("textoPreto", !active);
    });

    const breakRow = document.getElementById("breakRoomRow");
    if (breakRow) {
        breakRow.classList.toggle("textoVerde", isBreakFloor);
        breakRow.classList.toggle("textoPreto", !isBreakFloor);
    }
}

function removeFutureSpottedFloors() {
    spottedFloors = spottedFloors.filter(spottedFloor => spottedFloor <= floor);
    lastSpottedFloor = spottedFloors.length
        ? Math.max(...spottedFloors)
        : -1;

    const historico = document.getElementById("mainSpotted");
    if (!historico) return;

    Array.from(historico.children).forEach(registro => {
        const spottedFloor = Number(registro.dataset.floor);
        if (spottedFloor > floor) {
            registro.remove();
        }
    });

    if (historico.children.length === 0) {
        historico.classList.remove("container-css-historico");
    }
}

function prevFloor() {
    if (isBreakFloor) {
        isBreakFloor = false;
        removeFutureSpottedFloors();
        updateProgress();
        playSound("./sfx/Tape.mp3", 0.5);
        updateFloorDisplay();
        updateCapsule();
        tableVerifier();
        return;
    }

    if (floor <= 0) {
        playSound("./sfx/Tv_Click.mp3");
        return;
    }

    // Entrando em Break Floor ao voltar de um múltiplo de 25
    if (floor > 25 && (floor - 1) % 25 === 0) {
        floor--;
        isBreakFloor = true;
        removeFutureSpottedFloors();
        updateProgress();
        playSound("./sfx/BT.mp3", 0.5);
        updateFloorDisplay();
        updateCapsule();
        tableVerifier();
        return;
    }

    floor--;
    removeFutureSpottedFloors();
    updateProgress();
    playSound("./sfx/Tape.mp3", 0.5);
    updateFloorDisplay();
    updateCapsule();
    tableVerifier();
}

function forceSpotCurrentFloor() {
    // Só spota se realmente puder
    if (isBreakFloor || floor <= 4 || spottedFloors.includes(floor)) return false;

    playSound("./sfx/VT.mp3");

    spottedFloors.push(floor);
    lastSpottedFloor = floor;

    const historico = document.getElementById("mainSpotted");
    if (historico) {
        const novaLinha = document.createElement("div");
        novaLinha.dataset.floor = floor;

        novaLinha.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
            </svg>
            Main Twisted spotted in Floor ${floor}! <span style="opacity:0.7;">(auto)</span>
        `;

        historico.classList.add("container-css-historico");
        historico.appendChild(novaLinha);

        while (historico.children.length > 10) {
            historico.removeChild(historico.firstChild);
        }
    }

    updateProgress();
    updateCapsule();
    return true;
}

function nextFloor() {
    // Pity Mode ainda trava de verdade em 100%
    if (progress >= 100 && currentMode === "pity") {
        playSound("./sfx/Tv_Click.mp3");
        return;
    }

    // Percentage Mode: se tá em 100% e o player ignorou o spot → força o spot + log
    if (progress >= 100 && currentMode === "percentage" && !spottedFloors.includes(floor)) {
        forceSpotCurrentFloor();
    }

    if (isBreakFloor) {
        isBreakFloor = false;
        floor++;
    } else if (floor > 0 && floor % 25 === 0) {
        isBreakFloor = true;
        playSound("./sfx/BT.mp3", 0.5);
        updateFloorDisplay();
        updateCapsule();
        tableVerifier();
        return;
    } else {
        floor++;
    }

    updateProgress();

    if (floor <= 4) {
        playSound("./sfx/RUI.mp3");
    } else {
        playSound("./sfx/Ichor_Gain.mp3", 0.65);
    }

    if (progress >= 100) {
        progress = 100;
        playSound("./sfx/FM.mp3");
    }

    if (floor >= 5) {
        spawnDrops(12 + Math.floor(Math.random() * 6));
    }

    updateFloorDisplay();
    updateCapsule();
    tableVerifier();
}

function resetFloor() {
    if (floor === 0 && !isBreakFloor) {
        playSound("./sfx/Tv_Click.mp3");
        return;
    }

    floor = 0;
    progress = 0;
    pity = 0;
    spottedFloors = [];
    lastSpottedFloor = -1;
    isBreakFloor = false;

    playSound("./sfx/Tv_Off.mp3");

    updateFloorDisplay();
    updateCapsule();

    const historico = document.getElementById("mainSpotted");
    if (historico) {
        historico.innerHTML = "";
        historico.classList.remove("container-css-historico");
    }

    tableVerifier();
}

function mainSpotted() {
    if (isBreakFloor || progress <= 0 || floor <= 4) {
        playSound("./sfx/Tv_Click.mp3");
        return;
    }

    if (spottedFloors.includes(floor)) {
        playSound("./sfx/Tv_Click.mp3");
        return;
    }

    playSound("./sfx/VT.mp3");

    spottedFloors.push(floor);
    lastSpottedFloor = floor;

    updateProgress();
    updateCapsule();

    const historico = document.getElementById("mainSpotted");
    if (!historico) return;

    const novaLinha = document.createElement("div");
    novaLinha.dataset.floor = floor;

    novaLinha.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
        </svg>
        Main Twisted spotted in Floor ${floor}!
    `;

    historico.classList.add("container-css-historico");
    historico.appendChild(novaLinha);

    while (historico.children.length > 10) {
        historico.removeChild(historico.firstChild);
    }
}

function clearHistory() {
    const historico = document.getElementById("mainSpotted");
    if (!historico) return;

    if (historico.innerHTML !== "") {
        playSound("./sfx/SE.mp3", 1, 1.5);

        historico.innerHTML = "";
        historico.classList.remove("container-css-historico");
        spottedFloors = [];
        lastSpottedFloor = -1;

        updateProgress();
        updateCapsule();
    } else {
        playSound("./sfx/Tv_Click.mp3");
    }
}

function spawnDrops(quantidade = 10) {
    const wrapper = document.getElementById("capsuleWrapper");
    if (!wrapper) return;

    wrapper.classList.remove("shake");
    void wrapper.offsetWidth;
    wrapper.classList.add("shake");

    setTimeout(() => {
        wrapper.classList.remove("shake");
    }, 450);

    const originX = wrapper.clientWidth / 2;
    const fillRatio = (Math.min(progress, 100) / 100) * 0.72;
    const originY = wrapper.clientHeight * (1 - fillRatio - 0.12);

    quantidade = Math.min(quantidade, 10); // limite mais baixo pra não virar lag

    for (let i = 0; i < quantidade; i++) {
        const drop = document.createElement("img");
        drop.src = "imgs/Ichor.png";
        drop.className = "drop";
        drop.alt = "";

        const size = 7 + Math.random() * 11;
        drop.style.width = `${size}px`;
        drop.style.height = `${size}px`;
        drop.style.left = `${originX + (Math.random() * 16 - 8)}px`;
        drop.style.top = `${originY + (Math.random() * 12 - 6)}px`;

        const angle = (Math.random() * 150 - 75) * Math.PI / 180;
        const distance = 45 + Math.random() * 85;
        const tx = Math.sin(angle) * distance;
        const ty = -Math.cos(angle) * distance;
        const rot = (Math.random() * 360 - 180) + "deg";

        drop.style.setProperty("--tx", `${tx}px`);
        drop.style.setProperty("--ty", `${ty}px`);
        drop.style.setProperty("--rot", rot);

        const duration = 0.35 + Math.random() * 0.3;
        drop.style.animation = `splash ${duration}s cubic-bezier(.2,.7,.3,1) forwards`;

        wrapper.appendChild(drop);

        drop.addEventListener("animationend", () => {
            drop.remove();
        }, { once: true });
    }
}

// Inicialização
updateFloorDisplay();
updateProgress();
updateCapsule();
tableVerifier();
