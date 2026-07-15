// --- GERENCIAMENTO GERAL ---
function mudarTela(telaOcultar, telaMostrar) {
    document.getElementById(telaOcultar).classList.add('hidden');
    document.getElementById(telaMostrar).classList.remove('hidden');
}

function iniciarMissao() {
    mudarTela('tela-intro', 'tela-investigacao');
    // Adiciona um pequeno delay para a imagem carregar antes de criar o Canvas
    setTimeout(inicializarNevoa, 300);
}

// --- LÓGICA DA NÉVOA ORGÂNICA ---
let canvas, ctx, mapaImg;

function inicializarNevoa() {
    canvas = document.getElementById('fog-canvas');
    ctx = canvas.getContext('2d');
    mapaImg = document.getElementById('mapa-fundo');

    canvas.width = mapaImg.clientWidth;
    canvas.height = mapaImg.clientHeight;

    // Pinta a tela com uma névoa cinza esfumaçada e uniforme
    ctx.fillStyle = "rgba(40, 45, 45, 0.96)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Abre apenas a ÁREA VERDE (Largo dos Padeiros - canto inferior esquerdo)
    // O raio é contido, então não afeta o centro (Castelinho)
    apagarNevoaOrgânica(0.2, 0.85, canvas.width * 0.4); 
}

function apagarNevoaOrgânica(pctX, pctY, raio) {
    const eixoX = canvas.width * pctX;
    const eixoY = canvas.height * pctY;

    ctx.globalCompositeOperation = 'destination-out'; 
    
    // Gradiente bem suave para as bordas da névoa se misturarem sem marcas duras
    const gradient = ctx.createRadialGradient(eixoX, eixoY, raio * 0.1, eixoX, eixoY, raio);
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); // Centro limpo
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.5)'); // Meio termo
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Borda imperceptível

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(eixoX, eixoY, raio, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

// --- LÓGICA DAS MISSÕES E CHARADAS ---
function chegouPonto(numeroMissao) {
    // Esconde o botão de "Caminhar" e mostra a Charada correspondente
    document.getElementById(`btn-chegou-${numeroMissao}`).classList.add('hidden');
    document.getElementById(`charada-${numeroMissao}`).classList.remove('hidden');
    tocarBipeRadar();
}

function resolverCharada(numeroMissao, respostaCorreta) {
    const inputUsuário = document.getElementById(`resp-${numeroMissao}`).value.toLowerCase().trim();
    
    // Usamos um truque de "includes" para ignorar acentos facilmente no protótipo (ex: carvao, carvão)
    if(inputUsuário.includes(respostaCorreta)) {
        
        document.getElementById(`erro-${numeroMissao}`).classList.add('hidden');
        document.getElementById(`charada-${numeroMissao}`).classList.add('hidden');
        tocarBipeRadar();

        if(numeroMissao === 1) {
            // ACERTOU A ÁREA LARANJA (Noroeste).
            // Apagamos duas esferas suaves para cobrir a rua de cima, protegendo o centro.
            apagarNevoaOrgânica(0.15, 0.4, canvas.width * 0.35); 
            apagarNevoaOrgânica(0.35, 0.15, canvas.width * 0.35); 
            
            // Avança para Missão 2
            document.getElementById('missao-1').classList.add('hidden');
            document.getElementById('missao-2').classList.remove('hidden');
        } 
        else if(numeroMissao === 2) {
            // ACERTOU A ÁREA VERMELHA (Leste).
            // Apagamos uma esfera gigante na direita.
            apagarNevoaOrgânica(0.9, 0.5, canvas.width * 0.45); 
            
            // Fim do Mapa! O centro (Castelinho) vai ter sobrado naturalmente cinza.
            document.getElementById('onda').className = "wave stable";
            document.getElementById('missao-2').classList.add('hidden');
            document.getElementById('missao-conclusao').classList.remove('hidden');
        }
    } else {
        // Errou a senha
        document.getElementById(`erro-${numeroMissao}`).classList.remove('hidden');
    }
}

// --- ÁUDIO E CADEADO FINAL ---
function tocarBipeRadar() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine'; oscillator.frequency.value = 1000;
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
    oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.5);
}

function abrirMaleta() {
    const inputSenha = document.getElementById('senha-maleta').value;
    if(inputSenha === "1898") {
        alert("🎉 SUCESSO! A maleta foi aberta e os Modos de Jogo foram revelados!");
        // Aqui no futuro chamamos a tela de escolha
    } else {
        document.getElementById('erro-senha').classList.remove('hidden');
    }
}
