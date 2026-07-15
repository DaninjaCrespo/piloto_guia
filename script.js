// --- UTILITÁRIOS ---
function mudarTela(telaOcultar, telaMostrar) {
    document.getElementById(telaOcultar).classList.add('hidden');
    document.getElementById(telaMostrar).classList.remove('hidden');
}

// --- FLUXO DO JOGO ---
function iniciarRadar() {
    mudarTela('tela-intro', 'tela-radar');
}

// --- LÓGICA DE TRIANGULAÇÃO (RADAR) ---
let pontosEncontrados = 0;

function capturarPonto(ponto) {
    // 1. Desativa o botão clicado
    const btn = document.getElementById('btn-pt' + ponto);
    btn.disabled = true;
    btn.innerHTML = `✅ Ponto ${ponto} Sintonizado`;

    // 2. Toca o "Bipe" de Radar
    tocarBipeRadar();

    // 3. Atualiza o status visual
    pontosEncontrados++;
    const statusText = document.getElementById('status-sinal');
    const ondaVisual = document.getElementById('onda');

    if(pontosEncontrados === 1) {
        statusText.innerText = "Sinal: Fraco (33%)";
        ondaVisual.style.height = "20px";
    } else if (pontosEncontrados === 2) {
        statusText.innerText = "Sinal: Moderado (66%)";
        ondaVisual.style.height = "10px";
    } else if (pontosEncontrados === 3) {
        statusText.innerText = "Sinal: Perfeito (100%) - Analisando...";
        ondaVisual.className = "wave stable"; // Transforma em linha reta!
        
        // Espera 2 segundos de suspense e muda para o Mapa
        setTimeout(() => {
            mudarTela('tela-radar', 'tela-mapa');
            iniciarAnimacaoMapa();
        }, 2000);
    }
}

// Motor de Áudio Simples (Feedback de Sucesso)
function tocarBipeRadar() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 1200; // Tom agudo de radar
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); // Efeito de fade out
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// --- ANIMAÇÃO DRAW-TO-REVEAL ---
function iniciarAnimacaoMapa() {
    // Pega a linha do SVG e aciona a animação CSS
    const linhaRota = document.getElementById('rota-caminhada');
    linhaRota.classList.add('animar-rota');

    // Depois que a seta terminar de desenhar (3s), revela a mensagem
    setTimeout(() => {
        document.getElementById('mensagem-decodificada').classList.remove('hidden');
    }, 3500);
}

// --- VALIDADOR DE SENHA ---
function verificarSenha() {
    const inputSenha = document.getElementById('senha-maleta').value;
    const msgErro = document.getElementById('erro-senha');

    // Senha = 1898 (Ano de fundação do Relógio/Vila)
    if(inputSenha === "1898") {
        msgErro.classList.add('hidden');
        mudarTela('tela-mapa', 'tela-escolha');
    } else {
        msgErro.classList.remove('hidden');
        document.getElementById('senha-maleta').value = ""; 
    }
}
