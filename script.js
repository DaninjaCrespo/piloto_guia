// --- GERENCIADOR DE TELAS ---
function mudarTela(telaOcultar, telaMostrar) {
    document.getElementById(telaOcultar).classList.add('hidden');
    document.getElementById(telaMostrar).classList.remove('hidden');
}

function iniciarDemo() {
    mudarTela('tela-intro', 'tela-enigma');
}

// --- VALIDADOR DE SENHA ---
function verificarSenha() {
    const inputSenha = document.getElementById('senha-maleta').value;
    const msgErro = document.getElementById('erro-senha');

    // Supondo que a senha real do Sino seja o ano 1898
    const SENHA_CORRETA = "1898"; 

    if(inputSenha === SENHA_CORRETA) {
        msgErro.classList.add('hidden');
        mudarTela('tela-enigma', 'tela-escolha'); // Ramifica para os 3 modos!
    } else {
        msgErro.classList.remove('hidden');
        // Limpa o input após erro
        document.getElementById('senha-maleta').value = ""; 
    }
}

// --- MOTOR DE CÓDIGO MORSE (SOM E LUZ) ---
// Palavra: S I N O (... .. -. ---)
const sinalMorse = [
    1, 1, 1, 0,    // S (...)
    1, 1, 0,       // I (..)
    3, 1, 0,       // N (-.)
    3, 3, 3        // O (---)
];

let tocando = false;

function tocarMorse() {
    if(tocando) return; // Evita tocar várias vezes seguidas
    tocando = true;

    // Criador de Áudio nativo do navegador
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const flash = document.getElementById('flash-overlay');
    
    let tempoAtual = audioCtx.currentTime;
    const tempoPonto = 0.2; // Velocidade do bip (200ms)

    sinalMorse.forEach(tipo => {
        if (tipo > 0) {
            // Cria o som (Oscilador)
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine'; // Tipo de som limpo (onda senoidal)
            oscillator.frequency.value = 800; // Tom do bip (800hz)
            
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            const duracao = tipo * tempoPonto;
            
            // Toca o Som
            oscillator.start(tempoAtual);
            oscillator.stop(tempoAtual + duracao);
            
            // Pisca a tela em sincronia
            setTimeout(() => { flash.style.opacity = "0.8"; }, tempoAtual * 1000);
            setTimeout(() => { flash.style.opacity = "0"; }, (tempoAtual + duracao) * 1000);

            tempoAtual += duracao + tempoPonto; // Espaço entre bips
        } else {
            tempoAtual += tempoPonto * 3; // Espaço maior entre letras
        }
    });

    // Libera o botão após terminar
    setTimeout(() => { tocando = false; }, tempoAtual * 1000);
}
