// --- GERENCIAMENTO GERAL ---
function mudarTela(telaOcultar, telaMostrar) {
    document.getElementById(telaOcultar).classList.add('hidden');
    document.getElementById(telaMostrar).classList.remove('hidden');
}

function iniciarMissao() {
    mudarTela('tela-intro', 'tela-investigacao');
    document.getElementById('debug-menu').classList.remove('hidden'); // Revela o painel de testes
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

    // Fundo Cinza
    ctx.fillStyle = "rgba(40, 45, 45, 0.96)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ponto 1: Largo dos Padeiros (Automático no início)
    apagarNevoa(0.2, 0.85, canvas.width * 0.35); 
}

function apagarNevoa(pctX, pctY, raio) {
    const eixoX = canvas.width * pctX;
    const eixoY = canvas.height * pctY;
    ctx.globalCompositeOperation = 'destination-out'; 
    const gradient = ctx.createRadialGradient(eixoX, eixoY, raio * 0.1, eixoX, eixoY, raio);
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); 
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.5)'); 
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); 
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(eixoX, eixoY, raio, 0, Math.PI * 2, false); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    tocarBipeRadar();
}

// --- MÁQUINA DE ESTADOS (ROTEIRO DO JOGO E GPS SIMULADO) ---

// Simula a chegada física via GPS (Botões do Debug Menu)
function simularGPS(ponto) {
    const texto = document.getElementById('texto-narrativo');
    
    // Desativa o botão que acabou de ser clicado no Debug
    document.getElementById(`btn-dbg-${ponto}`).disabled = true;

    if (ponto === 2) {
        // PONTO 2: Trilha (Liberação Automática)
        apagarNevoa(0.2, 0.6, canvas.width * 0.3); // Limpa o caminho do meio
        texto.innerHTML = "<strong>Ponto 2:</strong> Trilha limpa organicamente. Siga para a coordenada Noroeste (Casa Fox).";
        document.getElementById('btn-dbg-3').disabled = false; // Libera próximo passo
    }
    else if (ponto === 3) {
        // PONTO 3: Casa Fox (Charada 1)
        texto.classList.add('hidden'); // Esconde texto de caminhada
        document.getElementById('box-charada-1').classList.remove('hidden'); // Mostra a charada
    }
    else if (ponto === 4) {
        // PONTO 4: Cruzamento (Liberação Automática)
        apagarNevoa(0.6, 0.5, canvas.width * 0.35); // Limpa o meio/base
        texto.innerHTML = "<strong>Ponto 4:</strong> Cruzamento livre. O radar aponta para o setor Leste (Clube Lyra).";
        document.getElementById('btn-dbg-5').disabled = false;
    }
    else if (ponto === 5) {
        // PONTO 5: Clube Lyra (Charada 2)
        texto.classList.add('hidden'); 
        document.getElementById('box-charada-2').classList.remove('hidden');
    }
}

// Validação das Charadas
function resolverCharada(numero, senhaCorreta) {
    const input = document.getElementById(`resp-${numero}`).value.toLowerCase().trim();
    const texto = document.getElementById('texto-narrativo');
    
    if (input === senhaCorreta) {
        document.getElementById(`erro-${numero}`).classList.add('hidden');
        document.getElementById(`box-charada-${numero}`).classList.add('hidden');
        
        if (numero === 1) {
            // Resolveu Casa Fox -> Limpa topo esquerdo -> Manda pro Ponto 4
            apagarNevoa(0.3, 0.25, canvas.width * 0.45); 
            texto.innerHTML = "<strong>Setor Noroeste Limpo.</strong> Caminhe de volta pela praça em direção ao Leste.";
            texto.classList.remove('hidden');
            document.getElementById('btn-dbg-4').disabled = false; // Libera simulador 4
        } 
        else if (numero === 2) {
            // Resolveu Clube Lyra -> Limpa lado direito -> Clímax!
            apagarNevoa(0.85, 0.35, canvas.width * 0.5); 
            
            document.getElementById('onda').className = "wave stable"; // Radar alinhou
            document.getElementById('box-conclusao').classList.remove('hidden');
            
            // Esconde o painel de debug, pois a caminhada acabou
            document.getElementById('debug-menu').classList.add('hidden'); 
        }
    } else {
        document.getElementById(`erro-${numero}`).classList.remove('hidden');
    }
}

// Clímax: O Cadeado Final
function abrirMaleta() {
    const inputSenha = document.getElementById('senha-maleta').value.toLowerCase().trim();
    if(inputSenha === "teste3") {
        alert("🎉 ATO DEMO CONCLUÍDO! (A maleta abriu. Aqui entrariam as 3 campanhas).");
    } else {
        document.getElementById('erro-senha').classList.remove('hidden');
    }
}

// Efeito Sonoro
function tocarBipeRadar() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine'; oscillator.frequency.value = 1200;
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
    oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.3);
}
