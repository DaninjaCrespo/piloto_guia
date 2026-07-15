// --- GERENCIAMENTO DE TELAS ---
function mudarTela(telaOcultar, telaMostrar) {
    document.getElementById(telaOcultar).classList.add('hidden');
    document.getElementById(telaMostrar).classList.remove('hidden');
}

function iniciarMissao() {
    mudarTela('tela-intro', 'tela-investigacao');
}

// --- LÓGICA DO ZOOM E DA NÉVOA ---
let canvas, ctx, mapaImg;
let pontosEncontrados = 0;

function ativarZoom() {
    document.getElementById('mapa-full-container').classList.add('hidden');
    document.getElementById('mapa-zoom-container').classList.remove('hidden');
    document.getElementById('controles-radar').classList.remove('hidden');
    
    document.getElementById('status-missao').innerText = "Sinal: Ponto Inicial (Largo dos Padeiros). Caminhe.";
    
    inicializarNevoa();
}

function inicializarNevoa() {
    canvas = document.getElementById('fog-canvas');
    ctx = canvas.getContext('2d');
    mapaImg = document.getElementById('mapa-fundo');

    canvas.width = mapaImg.clientWidth;
    canvas.height = mapaImg.clientHeight;

    // 1. Pinta a tela inteira com Névoa Escura
    ctx.fillStyle = "rgba(15, 20, 20, 0.98)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Limpa o canto inferior esquerdo (Largo dos Padeiros)
    apagarNevoa(0.1, 0.9, canvas.width * 0.6); 
}

// Função que age como BORRACHA (Apaga a névoa)
function apagarNevoa(pctX, pctY, raio) {
    const eixoX = canvas.width * pctX;
    const eixoY = canvas.height * pctY;

    ctx.globalCompositeOperation = 'destination-out'; // Modo Borracha
    const gradient = ctx.createRadialGradient(eixoX, eixoY, raio * 0.1, eixoX, eixoY, raio);
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); 
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); 

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(eixoX, eixoY, raio, 0, Math.PI * 2, false);
    ctx.fill();
    
    // TODA VEZ que apagamos uma área, nós forçamos o ponto cego a reaparecer!
    manterPontoCego();
}

// A NÉVOA PERSISTENTE DO CASTELINHO (A Anomalia)
function manterPontoCego() {
    // Coordenadas aproximadas do número 18 no seu mapa_zoom
    const eixoX = canvas.width * 0.52; 
    const eixoY = canvas.height * 0.55; 
    const raio = canvas.width * 0.18; // O tamanho exato da "bola vermelha" que você desenhou

    ctx.globalCompositeOperation = 'source-over'; // Modo Pincel normal (desenha por cima)
    
    // Cria uma nuvem espessa e preta
    const gradient = ctx.createRadialGradient(eixoX, eixoY, raio * 0.3, eixoX, eixoY, raio);
    gradient.addColorStop(0, 'rgba(10, 10, 10, 1)'); // Centro 100% escuro e impenetrável
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0)'); // Borda esfumaçada misturando com o fundo

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(eixoX, eixoY, raio, 0, Math.PI * 2, false);
    ctx.fill();
}

// --- GATILHOS DO GPS E OSCILOSCÓPIO ---
function ativarGatilho(setor) {
    const statusText = document.getElementById('status-missao');
    const ondaVisual = document.getElementById('onda');
    
    tocarBipeRadar(); 
    pontosEncontrados++;

    if(setor === 'fox') {
        document.getElementById('btn-pt1').disabled = true;
        document.getElementById('btn-pt1').innerText = "✅ Setor Norte Limpo";
        apagarNevoa(0.2, 0.1, canvas.width * 0.6); 
        statusText.innerText = "Sinal: Moderado (33%) - Interferência caindo.";
    } 
    else if(setor === 'lyra') {
        document.getElementById('btn-pt2').disabled = true;
        document.getElementById('btn-pt2').innerText = "✅ Setor Leste Limpo";
        apagarNevoa(0.9, 0.3, canvas.width * 0.7); 
        statusText.innerText = "Sinal: Forte (66%) - Frequência estabilizando.";
    }
    else if(setor === 'sul') {
        document.getElementById('btn-pt3').disabled = true;
        document.getElementById('btn-pt3').innerText = "✅ Setor Sul Limpo";
        apagarNevoa(0.8, 0.9, canvas.width * 0.6); 
    }

    // CLÍMAX
    if(pontosEncontrados === 3) {
        statusText.style.color = "#ff4444";
        statusText.innerText = "ALERTA: Ponto Cego detectado no centro do mapa!";
        ondaVisual.className = "wave stable"; 
        
        setTimeout(() => {
            mudarTela('tela-investigacao', 'tela-cadeado');
        }, 3500);
    }
}

// Motor de Áudio
function tocarBipeRadar() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 900;
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
}

// --- VALIDADOR DE SENHA ---
function verificarSenha() {
    const inputSenha = document.getElementById('senha-maleta').value;
    const msgErro = document.getElementById('erro-senha');

    if(inputSenha === "1898") {
        msgErro.classList.add('hidden');
        mudarTela('tela-cadeado', 'tela-escolha');
    } else {
        msgErro.classList.remove('hidden');
        document.getElementById('senha-maleta').value = ""; 
    }
}
