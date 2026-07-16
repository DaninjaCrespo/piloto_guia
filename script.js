const STAGE_DATA = {
    fox: {
        label: 'Ato I: Casa Fox',
        fog: { x: 0.22, y: 0.62, radius: 0.28 },
        hint: "Digite: 1902 (Ex: 3 anomalias + 1899)"
    },
    patio: {
        label: 'Ato II: Pátio Ferroviário',
        fog: { x: 0.52, y: 0.46, radius: 0.32 },
        hint: "Pare o Slider em 40, 145 e 305 por 3s. Senha: 1045"
    },
    lyra: {
        label: 'Ato III: Clube Lyra',
        fog: { x: 0.78, y: 0.38, radius: 0.28 },
        hint: "Corra! V1=28, V2=64, V3=82"
    },
    future: {
        label: 'O Ponto Cego',
        fog: { x: 0.50, y: 0.50, radius: 1.5 },
        hint: "Instagram Bot: 1867"
    }
};

const FINAL_PASSWORD = '1867';
const ORIENTATION_TARGETS = [40, 145, 305];
const ORIENTATION_TOLERANCE = 15;
const VALVE_TARGETS = { 1: 28, 2: 64, 3: 82 };
const VALVE_TOLERANCE = 5; // Mais rigoroso no hardcore

let stageSolved = { fox: false, patio: false, lyra: false };

// Variáveis Ato II (Competitivo)
let orientationAngle = 0;
let orientationReadings = [false, false, false];
let captureProgress = 0;
let capturingIndex = -1;
let gyroInterval = null;

// Variáveis Ato III (Hardcore Timer)
let valveState = { 1: 14, 2: 18, 3: 12 };
let activeKnob = null;
let timerInterval = null;
let timeLeft = 180; // 3 minutos

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-start')?.addEventListener('click', iniciarMissao);
    document.getElementById('btn-fox-submit')?.addEventListener('click', submitFoxPassword);
    document.getElementById('btn-patio-submit')?.addEventListener('click', submitPatioPassword);
    document.getElementById('btn-lyra-submit')?.addEventListener('click', completeLyraPuzzle);
    document.getElementById('btn-final-screen')?.addEventListener('click', () => mudarTela('tela-investigacao', 'tela-cadeado'));
    document.getElementById('btn-final')?.addEventListener('click', checkFinalPassword);
    
    document.getElementById('gyro-debug-slider')?.addEventListener('input', ({ target }) => {
        orientationAngle = Number(target.value);
        document.getElementById('gyro-hint').textContent = `Bússola: ${orientationAngle}°`;
    });

    const knobs = document.querySelectorAll('.knob');
    knobs.forEach(knob => {
        knob.addEventListener('pointerdown', event => {
            event.preventDefault();
            const valveId = Number(knob.parentElement?.getAttribute('data-valve'));
            activeKnob = { element: knob, id: valveId, startY: event.clientY, startValue: valveState[valveId] };
            knob.setPointerCapture(event.pointerId);
        });
    });
    document.addEventListener('pointermove', handleValvePointerMove);
    document.addEventListener('pointerup', () => (activeKnob = null));
});

function iniciarMissao() {
    mudarTela('tela-intro', 'tela-investigacao');
    document.getElementById('debug-menu')?.classList.remove('hidden');
    updateStageUI();
    updateGyroTargets();
    
    // Inicia o loop de leitura do Giroscópio para o Ato II
    gyroInterval = setInterval(checkGyroCapture, 100); 
}

function mudarTela(hideId, showId) {
    document.getElementById(hideId)?.classList.replace('active', 'hidden');
    document.getElementById(showId)?.classList.replace('hidden', 'active');
}

function updateStageUI() {
    const nextStage = stageSolved.lyra ? 'future' : (stageSolved.patio ? 'lyra' : (stageSolved.fox ? 'patio' : 'fox'));
    
    document.getElementById('map-stage').textContent = STAGE_DATA[nextStage].label;
    
    ['fox', 'patio', 'lyra', 'future'].forEach(stage => {
        document.getElementById(`puzzle-${stage}`).classList.add('hidden');
    });
    document.getElementById(`puzzle-${nextStage}`).classList.remove('hidden');
    document.getElementById('debug-hint-text').textContent = STAGE_DATA[nextStage].hint;

    // Dispara eventos específicos da fase
    if (nextStage === 'lyra' && !timerInterval) iniciarTimerHardcore();
}

// ================= ATO 1: CASUAL =================
function submitFoxPassword() {
    const input = document.getElementById('input-fox');
    const error = document.getElementById('fox-error');
    if (input.value.trim() === '1902') {
        error.classList.add('hidden');
        stageSolved.fox = true;
        updateStageUI();
    } else {
        error.classList.remove('hidden');
        shakeElement(input);
        if (navigator.vibrate) navigator.vibrate(200);
    }
}

// ================= ATO 2: COMPETITIVO (HOLD CAPTURE) =================
function updateGyroTargets() {
    const container = document.getElementById('gyro-targets');
    container.innerHTML = '';
    ORIENTATION_TARGETS.forEach(() => {
        const span = document.createElement('span');
        span.textContent = '✖ SINAL';
        container.appendChild(span);
    });
}

function checkGyroCapture() {
    if (stageSolved.patio || stageSolved.fox === false) return;

    let foundTargetIndex = -1;
    const targets = document.querySelectorAll('#gyro-targets span');

    // Verifica se está apontando para algum alvo não descoberto
    ORIENTATION_TARGETS.forEach((target, index) => {
        if (orientationReadings[index]) return; 
        const delta = Math.abs(Math.min(360 - Math.abs(orientationAngle - target), Math.abs(orientationAngle - target)));
        if (delta <= ORIENTATION_TOLERANCE) {
            foundTargetIndex = index;
        }
    });

    const progressBar = document.getElementById('capture-bar');
    const statusText = document.getElementById('capture-status');

    if (foundTargetIndex !== -1) {
        // Está no alvo! Aumenta a barra de captura (3 segundos = 30 ticks de 100ms)
        if (capturingIndex !== foundTargetIndex) {
            capturingIndex = foundTargetIndex;
            captureProgress = 0;
        }
        captureProgress += (100 / 30); 
        progressBar.style.width = `${captureProgress}%`;
        statusText.textContent = "Alvo localizado! Mantenha imóvel...";
        statusText.style.color = "#ffaa00";

        if (captureProgress >= 100) {
            // Capturado!
            orientationReadings[foundTargetIndex] = true;
            targets[foundTargetIndex].textContent = '✔ MEMÓRIA';
            targets[foundTargetIndex].style.color = '#00ff00';
            capturingIndex = -1;
            captureProgress = 0;
            progressBar.style.width = `0%`;
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Haptic Feedback
            checkAllMemoriesCaptured();
        }
    } else {
        // Saiu do alvo, zera a barra
        capturingIndex = -1;
        captureProgress = 0;
        progressBar.style.width = `0%`;
        statusText.textContent = "Gire para procurar os 3 ecos no ambiente.";
        statusText.style.color = "#b2b09a";
    }
}

function checkAllMemoriesCaptured() {
    const count = orientationReadings.filter(Boolean).length;
    if (count === ORIENTATION_TARGETS.length) {
        document.getElementById('patio-deduction-area').classList.remove('locked');
        document.getElementById('input-patio').disabled = false;
        document.getElementById('btn-patio-submit').disabled = false;
        document.getElementById('capture-status').textContent = "Todas as memórias capturadas!";
        document.getElementById('capture-status').style.color = "#00ff00";
    }
}

function submitPatioPassword() {
    const input = document.getElementById('input-patio');
    if (input.value.trim() === '1045') {
        stageSolved.patio = true;
        clearInterval(gyroInterval);
        updateStageUI();
    } else {
        shakeElement(input);
        if (navigator.vibrate) navigator.vibrate(200);
    }
}

// ================= ATO 3: HARDCORE (TIMER + VÁLVULAS) =================
function iniciarTimerHardcore() {
    const display = document.getElementById('hardcore-timer');
    timerInterval = setInterval(() => {
        timeLeft--;
        let minutos = Math.floor(timeLeft / 60);
        let segundos = timeLeft % 60;
        display.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        // Efeito de tensão final
        if (timeLeft <= 30) {
            display.classList.add('critical');
            if (timeLeft % 2 === 0 && navigator.vibrate) navigator.vibrate(50); // Batimento cardíaco
        }

        if (timeLeft <= 0) {
            vazamentoCritico();
        }
    }, 1000);
}

function vazamentoCritico() {
    clearInterval(timerInterval);
    const box = document.getElementById('puzzle-lyra');
    box.classList.add('shake');
    box.style.background = "rgba(100, 0, 0, 0.9)";
    document.getElementById('valve-note').textContent = "VAZAMENTO CRÍTICO! O SISTEMA REINICIOU.";
    document.getElementById('valve-note').style.color = "#ff0000";
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
    
    // Penalidade e Reset
    setTimeout(() => {
        box.classList.remove('shake');
        box.style.background = "";
        valveState = { 1: 14, 2: 18, 3: 12 };
        resetValveUI();
        timeLeft = 180; // Reseta o tempo (pode ajustar como quiser)
        iniciarTimerHardcore();
        document.getElementById('valve-note').textContent = "As pressões devem ser exatas. Risco de colapso.";
        document.getElementById('valve-note').style.color = "#b2b09a";
        document.getElementById('hardcore-timer').classList.remove('critical');
    }, 3000);
}

function handleValvePointerMove(event) {
    if (!activeKnob) return;
    const delta = activeKnob.startY - event.clientY;
    const newValue = Math.min(100, Math.max(0, activeKnob.startValue + Math.round(delta / 2)));
    valveState[activeKnob.id] = newValue;
    document.getElementById(`valve-value-${activeKnob.id}`).textContent = `${newValue} PSI`;
    activeKnob.element.style.transform = `rotate(${newValue * 2.5}deg)`;
}

function resetValveUI() {
    Object.entries(valveState).forEach(([id, value]) => {
        const el = document.getElementById(`valve-value-${id}`);
        if(el) el.textContent = `${value} PSI`;
        const knob = document.getElementById(`valve-knob-${id}`);
        if(knob) knob.style.transform = `rotate(${value * 2.5}deg)`;
    });
}

function completeLyraPuzzle() {
    const valid = Object.entries(VALVE_TARGETS).every(([id, target]) => {
        return Math.abs(valveState[id] - target) <= VALVE_TOLERANCE;
    });
    if (valid) {
        clearInterval(timerInterval); // Salvo pelo gongo!
        stageSolved.lyra = true;
        updateStageUI();
    } else {
        shakeElement(document.getElementById('valve-bank'));
        if (navigator.vibrate) navigator.vibrate(200);
        document.getElementById('valve-note').textContent = 'Pressão instável! Ajuste imediatamente!';
        document.getElementById('valve-note').style.color = '#ffaa00';
    }
}

// ================= FINAL =================
function checkFinalPassword() {
    const input = document.getElementById('final-password');
    if (input.value.trim() === FINAL_PASSWORD) {
        alert('MALETA ABERTA! Parabéns, você sobreviveu ao Guia Detetive!');
    } else {
        shakeElement(input);
    }
}

function toggleDebugPanel() {
    document.getElementById('debug-content').classList.toggle('minimized');
}

function shakeElement(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 360);
}
