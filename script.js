// Aguarda a imagem do mapa carregar para pegar o tamanho exato dela na tela
window.onload = function() {
    inicializarNevoa();
};

let canvas, ctx, mapaImg;
let pontosEncontrados = 0;

function inicializarNevoa() {
    canvas = document.getElementById('fog-canvas');
    ctx = canvas.getContext('2d');
    mapaImg = document.getElementById('mapa-fundo');

    // Iguala o tamanho do canvas ao tamanho atual da imagem na tela do celular
    canvas.width = mapaImg.clientWidth;
    canvas.height = mapaImg.clientHeight;

    // 1. Pinta a tela inteira com a Névoa (Cinza escuro com 95% de opacidade)
    ctx.fillStyle = "rgba(20, 25, 25, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Abre instantaneamente o Ponto Inicial (Largo dos Padeiros)
    // O Largo dos Padeiros (7) está mais ou menos a 35% do X e 65% do Y na sua imagem
    apagarNevoa(0.35, 0.65, 40); 
}

// A função da "Borracha"
// pctX e pctY são porcentagens (0 a 1) de onde o buraco vai abrir baseado no tamanho do mapa
function apagarNevoa(pctX, pctY, raio) {
    const eixoX = canvas.width * pctX;
    const eixoY = canvas.height * pctY;

    // O segredo do Canvas: 'destination-out' transforma o pincel em borracha
    ctx.globalCompositeOperation = 'destination-out';
    
    // Desenha um círculo com bordas suaves (Gradiente Radial)
    const gradient = ctx.createRadialGradient(eixoX, eixoY, raio * 0.3, eixoX, eixoY, raio);
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); // Centro totalmente transparente
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Borda esfumaçada

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(eixoX, eixoY, raio, 0, Math.PI * 2, false);
    ctx.fill();

    // Volta o pincel ao normal
    ctx.globalCompositeOperation = 'source-over';
}

// O Gatilho ativado quando o jogador chega no local (simulado pelos botões)
function ativarGatilho(local) {
    const statusText = document.getElementById('status-missao');
    const botao = document.getElementById(`btn-${local}`);
    
    botao.disabled = true;
    botao.innerText = "✅ Perímetro Limpo";
    pontosEncontrados++;

    // Aqui mapeamos as posições aproximadas de cada local na SUA imagem image_6749c7.jpg
    // O raio da borracha também está aqui (45 pixels)
    if(local === 'lyra') {
        apagarNevoa(0.55, 0.35, 45); // Coordenadas estimadas do Clube Lyra (15)
        statusText.innerText = "Sinal Detectado: Clube Lyra. Continue.";
    } 
    else if(local === 'mercado') {
        apagarNevoa(0.55, 0.52, 45); // Coordenadas estimadas do Mercado (17)
        statusText.innerText = "Sinal Detectado: Antigo Mercado. Continue.";
    } 
    else if(local === 'fox') {
        apagarNevoa(0.35, 0.25, 45); // Coordenadas estimadas da Casa Fox (11)
        statusText.innerText = "Sinal Detectado: Casa Fox. Continue.";
    }

    // Se achou os 3, revela o mistério final!
    if(pontosEncontrados === 3) {
        statusText.style.color = "#ff4444";
        statusText.innerText = "ALERTA: O perímetro foi varrido, mas o centro (Castelinho) continua impenetrável. Encontre o ponto cego!";
    }
}
