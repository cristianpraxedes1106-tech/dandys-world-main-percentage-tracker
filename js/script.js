let floor = 0;

let progress = 0;

let number = parseInt(document.getElementById("capsuleNumber").value);

let lastSpottedFloor = -1;

function tableVerifier() {
    const floors = [
        { min: 0, max: 4, id: "f0To4" },
        { min: 5, max: 9, id: "f5To9" },
        { min: 10, max: 14, id: "f10To14" },
        { min: 15, max: 19, id: "f15To19" },
        { min: 20, max: Infinity, id: "f20Plus" }
    ];

    floors.forEach(({ min, max, id }) => {
        const row = document.getElementById(id);

        if (floor >= min && floor <= max) {
            row.classList.add("textoVerde");
            row.classList.remove("textoPreto");
        } else {
            row.classList.add("textoPreto");
            row.classList.remove("textoVerde");
        }
    });
}

function prevFloor()  {

    let oldFloor = floor;

    floor = floor - 1;

    if (floor < 0) {
        floor = 0;
        
        const Tv_Click = new Audio('./sfx/Tv_Click.mp3');
        Tv_Click.play();
    }
    else {
        const Tape = new Audio('./sfx/Tape.mp3');
        Tape.volume = 0.5;
        Tape.play();

        if (oldFloor >= 5 && oldFloor <= 9) {
            progress -= 3;
        }
        else if (oldFloor >= 10 && oldFloor <= 14) {
            progress -= 7;
        }
        else if (oldFloor >= 15 && oldFloor <= 19) {
            progress -= 9;
        }
        else if (oldFloor >= 20) {
            progress -= 20;
        }

        if (progress < 0) {
            progress = 0;
        }
        
        document.getElementById("capsuleNumber").innerHTML = progress + "%";

        const bar = document.getElementById("progressBar");

        if (progress < 100) {
            bar.classList.remove("progress-full");
            bar.classList.add("progress-normal");
        }

        if (bar) {
            bar.style.height = (progress * 0.72) + "%";
        }
    }

    document.getElementById("floor").innerHTML = floor;

    tableVerifier();
}

function nextFloor() {

    // ========== LOCK ==========
    if (progress >= 100) {
        const Tv_Click = new Audio('./sfx/Tv_Click.mp3');
        Tv_Click.play();
        return;
    }
    // =========================

    
    floor = floor + 1;
    document.getElementById("floor").innerHTML = floor;

    if (floor >= 0 && floor <= 4) {
        progress += 0;

        const RUI = new Audio('./sfx/RUI.mp3');
        RUI.play();
    }

    else{
        const Ichor_Gain = new Audio('./sfx/Ichor_gain.mp3');
        Ichor_Gain.volume = 0.65;
        Ichor_Gain.play();
    }

    if (floor >= 5 && floor <= 9) {
        progress += 3;
    }
    else if (floor >= 10 && floor <= 14) {
        progress += 7;
    }
    else if (floor >= 15 && floor <= 19) {
        progress += 9;
    }
    else if (floor >= 20) {
        progress += 20;
    }

    if (progress >= 100) {
        progress = 100;
        const FM = new Audio('./sfx/FM.mp3');
        FM.play();
    }

    const bar = document.getElementById("progressBar");

    if (bar) {
        bar.style.height = (progress * 0.72) + "%";

        if (progress >= 100) {
            bar.classList.remove("progress-normal");
            bar.classList.add("progress-full");
        } else {
            bar.classList.remove("progress-full");
            bar.classList.add("progress-normal");
        }
    }

    if (floor >= 5) {
        spawnDrops(16 + Math.floor(Math.random() * 10));
    }

    document.getElementById("capsuleNumber").innerHTML = progress + "%";

    tableVerifier();

}

function resetFloor()  {

    if (floor == 0) {      
        const Tv_Click = new Audio('./sfx/Tv_Click.mp3');
        Tv_Click.play();
    }
    else{
        floor = 0;

        progress = 0;

        lastSpottedFloor = -1;

        const Tv_Off = new Audio('./sfx/Tv_Off.mp3');
        Tv_Off.play();
    }

    document.getElementById("floor").innerHTML = floor;
    document.getElementById("capsuleNumber").innerHTML = progress + "%";

    const bar = document.getElementById("progressBar");
    if (bar) {
        bar.style.height = "0%";
        bar.classList.remove("progress-full");
        bar.classList.add("progress-normal");
    }

    const historico = document.getElementById("mainSpotted");

    historico.innerHTML = "";

    historico.classList.remove("container-css-historico");

    tableVerifier();
}

function mainSpotted() {

    // ========== TRAVA POR FLOOR ==========
    if (floor === lastSpottedFloor) {
        const Tv_Click = new Audio('./sfx/Tv_Click.mp3');
        Tv_Click.play();
        return; // já spottou nesse floor, trava
    }
    // ====================================

    if (floor <= 4) {
        const Tv_Click = new Audio('./sfx/Tv_Click.mp3');
        Tv_Click.play();
        document.getElementById("mainSpotted").innerHTML = "";
    }
    else {
        const VT = new Audio('./sfx/VT.mp3');
        VT.play();

        // marca esse floor como já spottado
        lastSpottedFloor = floor;

        // zera a barra
        progress = 0;
        document.getElementById("capsuleNumber").innerHTML = progress + "%";

        const bar = document.getElementById("progressBar");
        if (bar) {
            bar.style.height = "0%";
            bar.classList.remove("progress-full");
            bar.classList.add("progress-normal");
        }

        // ========== HISTÓRICO (máximo 7) ==========
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
        // ==========================================
    }
}

function clearHistory() {

    if (document.getElementById("mainSpotted").innerHTML != "") {
        const SE = new Audio('./sfx/SE.mp3');
        SE.currentTime = 1.5;
        SE.play();

        const historico = document.getElementById("mainSpotted");

        historico.innerHTML = "";

        historico.classList.remove("container-css-historico");

    }

    else{
        const Tv_Click = new Audio('./sfx/Tv_Click.mp3');
        Tv_Click.play();
    }

}

function spawnDrops(quantidade = 18) {
    const wrapper = document.getElementById("capsuleWrapper");
    if (!wrapper) return;

    // ========== TREME A CÁPSULA ==========
    wrapper.classList.remove("shake");
    void wrapper.offsetWidth; // força reiniciar a animação
    wrapper.classList.add("shake");

    setTimeout(() => {
        wrapper.classList.remove("shake");
    }, 400);
    // ====================================

    const originX = wrapper.offsetWidth / 2 - 14;
    const fillRatio = (progress / 100) * 0.72;
    const originY = wrapper.offsetHeight * (1 - fillRatio - 0.12);

    for (let i = 0; i < quantidade; i++) {
        const drop = document.createElement("img");
        drop.src = "imgs/Ichor.png";
        drop.className = "drop";
        drop.style.left = originX + "px";
        drop.style.top = originY + "px";

        // ângulo bem aberto
        const angle = (Math.random() * 170 - 85) * (Math.PI / 180);
        
        // distância bem maior
        const distance = 140 + Math.random() * 220;
        
        const tx = Math.sin(angle) * distance;
        const ty = -Math.cos(angle) * distance - 80;
        
        // rotação maluca
        const rot = (Math.random() * 720 - 360) + "deg";

        drop.style.setProperty("--tx", tx + "px");
        drop.style.setProperty("--ty", ty + "px");
        drop.style.setProperty("--rot", rot);

        // duração aleatória
        const duration = 0.55 + Math.random() * 0.7;
        drop.style.animation = `splash ${duration}s ease-out forwards`;

        // tamanho aleatório das gotas
        const size = 108 + Math.random() * 22;
        drop.style.width = size + "px";
        drop.style.height = size + "px";

        wrapper.appendChild(drop);

        setTimeout(() => {
            drop.remove();
        }, 1400);
    }
}

tableVerifier();
