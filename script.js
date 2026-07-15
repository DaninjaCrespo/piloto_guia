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
    // Esconde o mapa Full e mostra o mapa Zoom + Botões
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

    // Sincroniza o tamanho do canvas
    canvas.width = mapaImg.clientWidth;
    canvas.height = mapaImg.clientHeight;

    // Pinta a tela inteira com Névoa Escura
    ctx.fillStyle = "rgba(15, 20, 20, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Abre um buraco GIGANTE no canto inferior esquerdo (onde o jogador está)
    // O raio gigante (canvas.width * 0.6) limpa quase metade inferior do mapa!
    apagarNevoa(0.1, 0.9, canvas.width * 0.6); 
}

function apagarNevoa(pctX, pctY, raio) {
    const eixoX = canvas.width * pctX;
    const eixoY = canvas.height * pctY;

    ctx.globalCompositeOperation = 'destination-out';
    const gradient = ctx.createRadialGradient(eixoX, eixoY, raio * 0.1, eixoX, eixoY, raio);
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); 
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); 

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(eixoX, eixoY, raio, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

// --- GATILHOS DO GPS E OSCILOSCÓPIO ---
function ativarGatilho(setor) {
    const statusText = document.getElementById('status-missao');
    const ondaVisual = document.getElementById('onda');
    
    tocarBipeRadar(); // Efeito sonoro do radar
    pontosEncontrados++;

    if(setor === 'fox') {
        document.getElementById('btn-pt1').disabled = true;
        document.getElementById('btn-pt1').innerText = "✅ Setor Norte Limpo";
        // Apaga um quadrante gigante no topo esquerdo do mapa
        apagarNevoa(0.2, 0.1, canvas.width * 0.6); 
        statusText.innerText = "Sinal: Moderado (33%) - Interferência caindo.";
    } 
    else if(setor === 'lyra') {
        document.getElementById('btn-pt2').disabled = true;
        document.getElementById('btn-pt2').innerText = "✅ Setor Leste Limpo";
        // Apaga um quadrante gigante no lado direito
        apagarNevoa(0.9, 0.3, canvas.width * 0.7); 
        statusText.innerText = "Sinal: Forte (66%) - Frequência estabilizando.";
    }
    else if(setor === 'sul') {
        document.getElementById('btn-pt3').disabled = true;
        document.getElementById('btn-pt3').innerText = "✅ Setor Sul Limpo";
        // Apaga a base do mapa
        apagarNevoa(0.8, 0.9, canvas.width * 0.6); 
    }

    // CLÍMAX: Todos os pontos foram encontrados
    if(pontosEncontrados === 3) {
        statusText.style.color = "#ff4444";
        statusText.innerText = "ALERTA: Ponto Cego detectado no centro do mapa!";
        ondaVisual.className = "wave stable"; // Transforma a onda em linha reta!
        
        // Espera 3 segundos para o jogador admirar o mapa limpo e a nuvem no centro
        setTimeout(() => {
            mudarTela('tela-investigacao', 'tela-cadeado');
        }, 3500);
    }
}

// Motor de Áudio do Radar
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

    // Senha Exemplo (Ano de fundação)
    if(inputSenha === "1898") {
        msgErro.classList.add('hidden');
        mudarTela('tela-cadeado', 'tela-escolha');
    } else {
        msgErro.classList.remove('hidden');
        document.getElementById('senha-maleta').value = ""; 
    }
}
