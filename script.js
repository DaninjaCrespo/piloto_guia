// --- GERENCIAMENTO GERAL ---
function mudarTela(telaOcultar, telaMostrar) {
    document.getElementById(telaOcultar).classList.add('hidden');
    document.getElementById(telaMostrar).classList.remove('hidden');
}

function iniciarMissao() {
    try {
        mudarTela('tela-intro', 'tela-investigacao');
        document.getElementById('debug-menu').classList.remove('hidden');
        
        // Pequeno atraso para garantir que a aba do mapa abriu antes de desenhar a névoa
        setTimeout(inicializarNevoa, 300);
    } catch (erro) {
        alert("Erro no script: " + erro.message);
    }
}

// --- DEBUG SPOOFER (MINIMIZAR/MAXIMIZAR) ---
function toggleDebug() {
    const content = document.getElementById('debug-content');
    const icon = document.getElementById('debug-toggle-icon');
    if (content.classList.contains('minimized')) {
        content.classList.remove('minimized');
        icon.innerText = "[-]";
    } else {
        content.classList.add('minimized');
        icon.innerText = "[+]";
    }
}

// --- LÓGICA DA NÉVOA ORGÂNICA ---
let canvas, ctx, mapaImg;

function inicializarNevoa() {
    try {
        canvas = document.getElementById('fog-canvas');
        ctx = canvas.getContext('2d');
        mapaImg = document.getElementById('mapa-fundo');

        // Garante que o canvas tem o mesmo tamanho da imagem na tela
        canvas.width = mapaImg.clientWidth || 300; 
        canvas.height = mapaImg.clientHeight || 300;

        // Fundo Cinza
        ctx.fillStyle = "rgba(40, 45, 45, 0.96)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Limpa a área inicial (Largo dos Padeiros)
        apagarNevoa(0.2, 0.85, canvas.width * 0.35); 
    } catch (erro) {
        console.log("Erro na névoa: " + erro.message);
    }
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
    ctx.beginPath(); 
    ctx.arc(eixoX, eixoY, raio, 0, Math.PI * 2, false); 
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    tocarBipeRadar();
}

// --- ROTEIRO DO JOGO E RADAR ---
function atualizarRadar(statusVisual, textoSinal) {
    document.getElementById('onda').className = `wave ${statusVisual}`;
    document.getElementById('status-sinal').innerText = textoSinal;
}

function simularGPS(ponto) {
    const texto = document.getElementById('texto-narrativo');
    document.getElementById(`btn-dbg-${ponto}`).disabled = true;

    if (ponto === 2) {
        apagarNevoa(0.2, 0.6, canvas.width * 0.3);
        atualizarRadar('moderate', 'Sinal: Ruído caindo... A frequência parece reagir à madeira dos casarões.');
        texto.innerHTML = "<strong>🚶 Em Movimento:</strong> A estática diminuiu. Continue subindo a rua principal até que a interferência bloqueie o radar novamente (Perto da Casa Fox).";
        document.getElementById('btn-dbg-3').disabled = false;
    }
    else if (ponto === 3) {
        atualizarRadar('chaotic', 'Sinal: Bloqueado! Interceptação detectada.');
        texto.classList.add('hidden'); 
        document.getElementById('box-charada-1').classList.remove('hidden');
    }
    else if (ponto === 4) {
        apagarNevoa(0.6, 0.5, canvas.width * 0.35);
        atualizarRadar('moderate', 'Sinal: Estabilizando. Direcionamento ativo.');
        texto.innerHTML = "<strong>🚶 Em Movimento:</strong> O chiado quase sumiu, mas a agulha aponta para o Leste, para os domínios da elite. Caminhe até o Clube Lyra.";
        document.getElementById('btn-dbg-5').disabled = false;
    }
    else if (ponto === 5) {
        atualizarRadar('chaotic', 'Sinal: Bloqueio Máximo! Resolva o código.');
        texto.classList.add('hidden'); 
        document.getElementById('box-charada-2').classList.remove('hidden');
    }
}

function resolverCharada(numero, senhaCorreta) {
    const input = document.getElementById(`resp-${numero}`).value.toLowerCase().trim();
    const texto = document.getElementById('texto-narrativo');
    
    if (input === senhaCorreta) {
        document.getElementById(`erro-${numero}`).classList.add('hidden');
        document.getElementById(`box-charada-${numero}`).classList.add('hidden');
        
        if (numero === 1) {
            apagarNevoa(0.3, 0.25, canvas.width * 0.45); 
            atualizarRadar('chaotic', 'Sinal: Caótico. Reposicionando antena...');
            texto.innerHTML = "<strong>✅ Criptografia Quebrada.</strong> O setor Noroeste está limpo. O rádio recalibrou. Retorne o caminho e siga para o Leste.";
            texto.classList.remove('hidden');
            document.getElementById('btn-dbg-4').disabled = false;
        } 
        else if (numero === 2) {
            apagarNevoa(0.85, 0.35, canvas.width * 0.5); 
            atualizarRadar('stable', 'Sinal: Puro e Cristalino. Origem Detectada.');
            document.getElementById('box-conclusao').classList.remove('hidden');
            document.getElementById('debug-menu').classList.add('hidden'); 
        }
    } else {
        document.getElementById(`erro-${numero}`).classList.remove('hidden');
    }
}

function abrirMaleta() {
    const inputSenha = document.getElementById('senha-maleta').value.toLowerCase().trim();
    if(inputSenha === "teste3") {
        alert("🎉 A MALETA SE ABRIU! O Ato Demo foi um sucesso.");
    } else {
        document.getElementById('erro-senha').classList.remove('hidden');
    }
}

// --- MOTOR DE ÁUDIO BLINDADO ---
function tocarBipeRadar() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return; 
        
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine'; 
        oscillator.frequency.value = 800;
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        
        oscillator.connect(gainNode); 
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(); 
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.log("Áudio bloqueado pelo navegador, continuando silenciosamente.");
    }
}
