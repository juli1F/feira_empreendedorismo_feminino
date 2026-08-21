const canvas = document.getElementById('florCanvas');
const ctx = canvas.getContext('2d');

let animationStart = null;


// =========================================================
// CONFIGURAÇÕES
// =========================================================

const CONFIG = {
    // tamanho visual da rosa
    scaleBase: 370,

    // animação
    stemDuration: 1450,
    leavesStart: 500,
    flowerStart: 950,

    // fundo
    background: {
        center: '#2d0713',
        middle: '#17040c',
        edge: '#090106'
    }
};


// =========================================================
// PALETAS DA ROSA
// =========================================================

const rosePalettes = {

    outer: {
        dark: '#350107',
        base: '#620711',
        mid: '#9d1325',
        light: '#d52d45',
        highlight: '#ee6476'
    },

    middle: {
        dark: '#440108',
        base: '#7a0918',
        mid: '#b81931',
        light: '#e13a52',
        highlight: '#f36d7f'
    },

    inner: {
        dark: '#500008',
        base: '#8e0c20',
        mid: '#c71b36',
        light: '#e7475d',
        highlight: '#f77d8b'
    },

    core: {
        dark: '#260004',
        base: '#57050f',
        mid: '#941126',
        light: '#c9223d',
        highlight: '#e7596c'
    }
};


// =========================================================
// CAMADAS DA ROSA
// =========================================================

const roseLayers = [

    // -----------------------------------------------------
    // PÉTALAS EXTERNAS
    // -----------------------------------------------------
    {
        count: 11,

        start: 850,
        duration: 1250,

        radius: 3,

        length: 126,
        width: 55,

        rotation: 0.11,

        palette: rosePalettes.outer
    },

    // -----------------------------------------------------
    // SEGUNDA CAMADA
    // -----------------------------------------------------
    {
        count: 9,

        start: 1050,
        duration: 1150,

        radius: 2,

        length: 107,
        width: 50,

        rotation: Math.PI / 9,

        palette: rosePalettes.middle
    },

    // -----------------------------------------------------
    // TERCEIRA CAMADA
    // -----------------------------------------------------
    {
        count: 8,

        start: 1260,
        duration: 1020,

        radius: 1,

        length: 89,
        width: 45,

        rotation: Math.PI / 8,

        palette: rosePalettes.inner
    },

    // -----------------------------------------------------
    // QUARTA CAMADA
    // -----------------------------------------------------
    {
        count: 7,

        start: 1490,
        duration: 900,

        radius: 0,

        length: 68,
        width: 38,

        rotation: Math.PI / 7,

        palette: rosePalettes.core
    },

    // -----------------------------------------------------
    // PÉTALAS DO CENTRO
    // -----------------------------------------------------
    {
        count: 5,

        start: 1760,
        duration: 850,

        radius: 0,

        length: 46,
        width: 29,

        rotation: Math.PI / 5,

        palette: rosePalettes.core
    }
];


// =========================================================
// CORAÇÕES
// =========================================================

const hearts = [
    { x: -210, y: -120, size: 9 },
    { x: 185, y: -105, size: 11 },
    { x: -180, y: 10, size: 7 },
    { x: 205, y: 45, size: 10 },
    { x: -135, y: 148, size: 9 },
    { x: 145, y: 155, size: 8 },
    { x: 225, y: -20, size: 7 },
    { x: -228, y: 65, size: 8 },
    { x: 95, y: -175, size: 7 },
    { x: -65, y: -180, size: 6 }
];


// =========================================================
// UTILITÁRIOS
// =========================================================

function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}


function easeOutCubic(t) {

    t = clamp(t);

    return 1 - Math.pow(1 - t, 3);
}


function easeOutQuart(t) {

    t = clamp(t);

    return 1 - Math.pow(1 - t, 4);
}


function easeInOut(t) {

    t = clamp(t);

    if (t < 0.5) {

        return 4 * t * t * t;

    }

    return 1 -
        Math.pow(-2 * t + 2, 3) / 2;
}


function smoothStep(t) {

    t = clamp(t);

    return t * t * (3 - 2 * t);
}


// =========================================================
// RESIZE
// =========================================================

function resizeCanvas() {

    const rect =
        canvas.parentElement.getBoundingClientRect();

    canvas.width = Math.max(1, rect.width);
    canvas.height = Math.max(1, rect.height);

    animationStart = null;

    requestAnimationFrame(animate);
}


// =========================================================
// FUNDO
// =========================================================

function drawBackground(cx, cy, scale) {

    const w = canvas.width;
    const h = canvas.height;

    // -----------------------------------------------------
    // GRADIENTE PRINCIPAL
    // -----------------------------------------------------

    const backgroundGradient =
        ctx.createRadialGradient(
            cx,
            cy - 25 * scale,
            10 * scale,

            cx,
            cy,
            Math.max(w, h) * 0.72
        );

    backgroundGradient.addColorStop(
        0,
        CONFIG.background.center
    );

    backgroundGradient.addColorStop(
        0.42,
        CONFIG.background.middle
    );

    backgroundGradient.addColorStop(
        1,
        CONFIG.background.edge
    );

    ctx.fillStyle = backgroundGradient;

    ctx.fillRect(
        0,
        0,
        w,
        h
    );


    // -----------------------------------------------------
    // AURA ATRÁS DA ROSA
    // -----------------------------------------------------

    ctx.save();

    ctx.globalCompositeOperation = 'screen';

    const glow =
        ctx.createRadialGradient(
            cx,
            cy - 10 * scale,
            0,

            cx,
            cy - 10 * scale,
            245 * scale
        );

    glow.addColorStop(
        0,
        'rgba(255,45,75,0.17)'
    );

    glow.addColorStop(
        0.35,
        'rgba(225,25,55,0.09)'
    );

    glow.addColorStop(
        0.70,
        'rgba(180,15,45,0.035)'
    );

    glow.addColorStop(
        1,
        'rgba(255,20,60,0)'
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
        cx,
        cy - 10 * scale,
        245 * scale,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


// =========================================================
// CAULE
// =========================================================

function getStemPoint(
    cx,
    cy,
    scale,
    t
) {

    const startX =
        cx + 8 * scale;

    const startY =
        cy + 240 * scale;

    const c1x =
        cx + 48 * scale;

    const c1y =
        cy + 165 * scale;

    const c2x =
        cx - 45 * scale;

    const c2y =
        cy + 82 * scale;

    const endX =
        cx;

    const endY =
        cy + 4 * scale;


    const x =
        Math.pow(1 - t, 3) * startX +
        3 *
        Math.pow(1 - t, 2) *
        t *
        c1x +
        3 *
        (1 - t) *
        Math.pow(t, 2) *
        c2x +
        Math.pow(t, 3) *
        endX;


    const y =
        Math.pow(1 - t, 3) * startY +
        3 *
        Math.pow(1 - t, 2) *
        t *
        c1y +
        3 *
        (1 - t) *
        Math.pow(t, 2) *
        c2y +
        Math.pow(t, 3) *
        endY;


    return { x, y };
}


function drawStem(
    cx,
    cy,
    scale,
    progress
) {

    if (progress <= 0) return;

    const p =
        easeInOut(progress);


    const startPoint =
        getStemPoint(
            cx,
            cy,
            scale,
            0
        );

    const currentPoint =
        getStemPoint(
            cx,
            cy,
            scale,
            p
        );


    ctx.save();


    // -----------------------------------------------------
    // SOMBRA DO CAULE
    // -----------------------------------------------------

    ctx.shadowColor =
        'rgba(0,0,0,0.45)';

    ctx.shadowBlur =
        5 * scale;

    ctx.shadowOffsetX =
        2 * scale;

    ctx.shadowOffsetY =
        3 * scale;


    // -----------------------------------------------------
    // GRADIENTE DO CAULE
    // -----------------------------------------------------

    const stemGradient =
        ctx.createLinearGradient(
            startPoint.x,
            startPoint.y,
            currentPoint.x,
            currentPoint.y
        );

    stemGradient.addColorStop(
        0,
        '#123118'
    );

    stemGradient.addColorStop(
        0.35,
        '#1e542b'
    );

    stemGradient.addColorStop(
        0.7,
        '#397345'
    );

    stemGradient.addColorStop(
        1,
        '#6c9c5b'
    );


    ctx.strokeStyle =
        stemGradient;

    ctx.lineWidth =
        5 * scale;

    ctx.lineCap =
        'round';


    // -----------------------------------------------------
    // CAULE
    // -----------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        startPoint.x,
        startPoint.y
    );


    ctx.bezierCurveTo(

        cx + 48 * scale,
        cy + 165 * scale,

        cx - 45 * scale,
        cy + 82 * scale,

        currentPoint.x,
        currentPoint.y

    );

    ctx.stroke();


    ctx.shadowColor =
        'transparent';

    ctx.restore();


    // -----------------------------------------------------
    // ESPINHOS
    // -----------------------------------------------------

    if (progress < 0.65) {
        return;
    }


    const thornProgress =
        easeOutCubic(
            (progress - 0.65) / 0.35
        );


    ctx.save();

    ctx.globalAlpha =
        thornProgress;


    const thornPositions = [
        0.12,
        0.27,
        0.43,
        0.59,
        0.75,
        0.88
    ];


    thornPositions.forEach(
        (t, index) => {

            const point =
                getStemPoint(
                    cx,
                    cy,
                    scale,
                    t
                );


            const direction =
                index % 2 === 0
                    ? -1
                    : 1;


            const thornLength =
                7 * scale;


            const thornWidth =
                3.2 * scale;


            ctx.save();

            ctx.translate(
                point.x,
                point.y
            );


            ctx.rotate(
                direction === -1
                    ? -0.55
                    : Math.PI + 0.55
            );


            ctx.fillStyle =
                '#28582f';


            ctx.beginPath();

            ctx.moveTo(0, 0);

            ctx.quadraticCurveTo(
                thornLength * 0.55,
                -thornWidth,
                thornLength,
                0
            );

            ctx.quadraticCurveTo(
                thornLength * 0.55,
                thornWidth,
                0,
                0
            );

            ctx.closePath();

            ctx.fill();

            ctx.restore();
        }
    );

    ctx.restore();
}


// =========================================================
// FOLHA
// =========================================================

function drawLeaf(
    x,
    y,
    angle,
    length,
    width,
    progress,
    scale
) {

    if (progress <= 0) return;


    const p =
        easeOutQuart(progress);


    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.rotate(angle);

    ctx.scale(
        p,
        p
    );


    // -----------------------------------------------------
    // SOMBRA
    // -----------------------------------------------------

    ctx.shadowColor =
        'rgba(0,0,0,0.4)';

    ctx.shadowBlur =
        6 * scale;

    ctx.shadowOffsetX =
        2 * scale;

    ctx.shadowOffsetY =
        3 * scale;


    // -----------------------------------------------------
    // GRADIENTE
    // -----------------------------------------------------

    const leafGradient =
        ctx.createLinearGradient(
            0,
            0,
            length,
            0
        );

    leafGradient.addColorStop(
        0,
        '#173d22'
    );

    leafGradient.addColorStop(
        0.28,
        '#245c31'
    );

    leafGradient.addColorStop(
        0.58,
        '#3f8145'
    );

    leafGradient.addColorStop(
        0.85,
        '#669d59'
    );

    leafGradient.addColorStop(
        1,
        '#89b96d'
    );


    ctx.fillStyle =
        leafGradient;


    // -----------------------------------------------------
    // FORMA DA FOLHA
    // -----------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        0,
        0
    );


    ctx.bezierCurveTo(
        length * 0.18,
        -width * 0.65,

        length * 0.62,
        -width,

        length,
        -width * 0.05
    );


    ctx.bezierCurveTo(
        length * 0.68,
        width * 0.75,

        length * 0.30,
        width * 0.72,

        0,
        0
    );


    ctx.closePath();

    ctx.fill();


    ctx.shadowColor =
        'transparent';


    // -----------------------------------------------------
    // NERVURA DA FOLHA
    // -----------------------------------------------------

    ctx.strokeStyle =
        'rgba(210,245,200,0.22)';

    ctx.lineWidth =
        Math.max(
            0.8 * scale,
            0.5
        );


    ctx.beginPath();

    ctx.moveTo(
        2 * scale,
        0
    );

    ctx.quadraticCurveTo(
        length * 0.45,
        -1 * scale,
        length * 0.90,
        0
    );

    ctx.stroke();


    // -----------------------------------------------------
    // NERVURAS SECUNDÁRIAS
    // -----------------------------------------------------

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        const t =
            i / 6;

        const px =
            length * t;

        const spread =
            width *
            Math.sin(t * Math.PI) *
            0.42;


        ctx.beginPath();

        ctx.moveTo(
            px,
            0
        );

        ctx.lineTo(
            px - length * 0.10,
            -spread
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            px,
            0
        );

        ctx.lineTo(
            px - length * 0.10,
            spread
        );

        ctx.stroke();
    }


    ctx.restore();
}


// =========================================================
// FORMA DE PÉTALA
// =========================================================

function createPetalPath(
    L,
    W,
    curl
) {

    const path =
        new Path2D();


    path.moveTo(
        0,
        0
    );


    // -----------------------------------------------------
    // PARTE SUPERIOR
    // -----------------------------------------------------

    path.bezierCurveTo(

        L * 0.12,
        -W * 0.28,

        L * 0.22,
        -W * (0.85 + curl),

        L * 0.45,
        -W * (0.95 + curl)

    );


    path.bezierCurveTo(

        L * 0.67,
        -W,

        L * 0.90,
        -W * 0.55,

        L,
        -W * 0.08

    );


    // -----------------------------------------------------
    // BORDA
    // -----------------------------------------------------

    path.bezierCurveTo(

        L * 1.02,
        0,

        L * 0.99,
        W * 0.18,

        L * 0.93,
        W * 0.42

    );


    // -----------------------------------------------------
    // PARTE INFERIOR
    // -----------------------------------------------------

    path.bezierCurveTo(

        L * 0.78,
        W * 0.86,

        L * 0.55,
        W * (1 + curl),

        L * 0.35,
        W * 0.80

    );


    path.bezierCurveTo(

        L * 0.17,
        W * 0.58,

        L * 0.08,
        W * 0.20,

        0,
        0

    );


    path.closePath();


    return path;
}


// =========================================================
// PÉTALA REALISTA
// =========================================================

function drawRosePetal(
    cx,
    cy,
    angle,
    length,
    width,
    progress,
    palette,
    scale,
    layerIndex,
    petalIndex
) {

    if (progress <= 0) return;


    const p =
        easeOutCubic(progress);


    if (p <= 0) return;


    const L =
        length * p;

    const W =
        width * p;


    if (L < 1) return;


    ctx.save();


    ctx.translate(
        cx,
        cy
    );


    ctx.rotate(
        angle
    );


    // -----------------------------------------------------
    // PEQUENA VARIAÇÃO NATURAL
    // -----------------------------------------------------

    const asymmetry =
        Math.sin(
            petalIndex * 4.37 +
            layerIndex * 2.19
        ) * 0.06;


    const curl =
        0.05 +
        asymmetry;


    // -----------------------------------------------------
    // SOMBRA ENTRE PÉTALAS
    // -----------------------------------------------------

    ctx.shadowColor =
        'rgba(0,0,0,0.46)';

    ctx.shadowBlur =
        9 * scale * p;

    ctx.shadowOffsetX =
        1.5 * scale;

    ctx.shadowOffsetY =
        4 * scale;


    // -----------------------------------------------------
    // GRADIENTE PRINCIPAL
    // -----------------------------------------------------

    const petalGradient =
        ctx.createRadialGradient(

            L * 0.28,
            -W * 0.18,
            Math.max(
                1,
                W * 0.05
            ),

            L * 0.62,
            0,
            L * 1.15

        );


    petalGradient.addColorStop(
        0,
        palette.highlight
    );


    petalGradient.addColorStop(
        0.18,
        palette.light
    );


    petalGradient.addColorStop(
        0.48,
        palette.mid
    );


    petalGradient.addColorStop(
        0.78,
        palette.base
    );


    petalGradient.addColorStop(
        1,
        palette.dark
    );


    ctx.fillStyle =
        petalGradient;


    // -----------------------------------------------------
    // PÉTALA
    // -----------------------------------------------------

    const path =
        createPetalPath(
            L,
            W,
            curl
        );


    ctx.fill(path);


    // -----------------------------------------------------
    // LUZ SUPERFICIAL
    // -----------------------------------------------------

    ctx.shadowColor =
        'transparent';

    ctx.shadowBlur = 0;

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;


    const light =
        ctx.createLinearGradient(
            0,
            -W,
            L,
            W
        );


    light.addColorStop(
        0,
        'rgba(255,255,255,0.11)'
    );


    light.addColorStop(
        0.30,
        'rgba(255,160,170,0.055)'
    );


    light.addColorStop(
        0.65,
        'rgba(255,255,255,0)'
    );


    ctx.fillStyle =
        light;


    ctx.fill(path);


    // -----------------------------------------------------
    // BORDA ILUMINADA
    // -----------------------------------------------------

    ctx.save();

    ctx.globalAlpha =
        0.18 * p;


    const edgeGradient =
        ctx.createLinearGradient(
            L * 0.45,
            -W,
            L,
            0
        );


    edgeGradient.addColorStop(
        0,
        'rgba(255,100,120,0)'
    );


    edgeGradient.addColorStop(
        0.65,
        'rgba(255,145,160,0.30)'
    );


    edgeGradient.addColorStop(
        1,
        'rgba(255,205,210,0.46)'
    );


    ctx.strokeStyle =
        edgeGradient;


    ctx.lineWidth =
        Math.max(
            1.0 * scale,
            0.6
        );


    ctx.stroke(path);

    ctx.restore();


    ctx.restore();
}


// =========================================================
// PÉTALAS INTERNAS
// =========================================================

function drawInnerCurl(
    cx,
    cy,
    scale,
    progress,
    index
) {

    if (progress <= 0) return;


    const p =
        easeOutQuart(progress);


    const angle =
        index *
        (Math.PI * 2 / 5);


    const distance =
        7 * scale;


    const x =
        cx +
        Math.cos(angle) *
        distance;


    const y =
        cy +
        Math.sin(angle) *
        distance;


    const length =
        39 * scale;


    const width =
        22 * scale;


    ctx.save();


    ctx.translate(
        x,
        y
    );


    ctx.rotate(
        angle + 0.7
    );


    ctx.scale(
        p,
        p
    );


    const gradient =
        ctx.createLinearGradient(
            0,
            -width,
            length,
            width
        );


    gradient.addColorStop(
        0,
        '#360006'
    );


    gradient.addColorStop(
        0.35,
        '#700916'
    );


    gradient.addColorStop(
        0.72,
        '#b61832'
    );


    gradient.addColorStop(
        1,
        '#e44c60'
    );


    ctx.fillStyle =
        gradient;


    ctx.shadowColor =
        'rgba(0,0,0,0.5)';

    ctx.shadowBlur =
        7 * scale;


    ctx.beginPath();


    ctx.moveTo(
        0,
        0
    );


    ctx.bezierCurveTo(
        length * 0.20,
        -width * 0.80,

        length * 0.58,
        -width,

        length,
        -width * 0.20
    );


    ctx.bezierCurveTo(
        length * 0.80,
        width * 0.45,

        length * 0.35,
        width * 0.90,

        0,
        0
    );


    ctx.closePath();


    ctx.fill();


    ctx.restore();
}


// =========================================================
// CENTRO DA ROSA
// =========================================================

function drawRoseCenter(
    cx,
    cy,
    scale,
    progress
) {

    if (progress <= 0) return;


    const p =
        easeOutQuart(progress);


    ctx.save();


    ctx.translate(
        cx,
        cy
    );


    ctx.scale(
        p,
        p
    );


    // -----------------------------------------------------
    // PROFUNDIDADE DO CENTRO
    // -----------------------------------------------------

    const centerGradient =
        ctx.createRadialGradient(
            0,
            0,
            0,

            0,
            0,
            21 * scale
        );


    centerGradient.addColorStop(
        0,
        '#180003'
    );


    centerGradient.addColorStop(
        0.28,
        '#420006'
    );


    centerGradient.addColorStop(
        0.56,
        '#750a16'
    );


    centerGradient.addColorStop(
        0.82,
        '#a8152d'
    );


    centerGradient.addColorStop(
        1,
        '#d6384e'
    );


    ctx.fillStyle =
        centerGradient;


    ctx.shadowColor =
        'rgba(0,0,0,0.55)';


    ctx.shadowBlur =
        13 * scale;


    ctx.beginPath();


    ctx.arc(
        0,
        0,
        17 * scale,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.shadowColor =
        'transparent';


    // -----------------------------------------------------
    // PEQUENAS PÉTALAS ENROLADAS
    // -----------------------------------------------------

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const a =
            i *
            (Math.PI * 2 / 5) +
            0.3;


        const px =
            Math.cos(a) *
            8 *
            scale;


        const py =
            Math.sin(a) *
            6 *
            scale;


        ctx.save();


        ctx.translate(
            px,
            py
        );


        ctx.rotate(
            a + 0.8
        );


        const curlGradient =
            ctx.createLinearGradient(
                -8 * scale,
                0,
                10 * scale,
                0
            );


        curlGradient.addColorStop(
            0,
            '#350005'
        );


        curlGradient.addColorStop(
            0.48,
            '#920e22'
        );


        curlGradient.addColorStop(
            0.80,
            '#ce2941'
        );


        curlGradient.addColorStop(
            1,
            '#ef5e6f'
        );


        ctx.fillStyle =
            curlGradient;


        ctx.beginPath();


        ctx.ellipse(
            0,
            0,
            10 * scale,
            5.5 * scale,
            0,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.restore();
    }


    ctx.restore();
}


// =========================================================
// PEQUENA SOMBRA NO CHÃO DA FLOR
// =========================================================

function drawFlowerShadow(
    cx,
    cy,
    scale,
    progress
) {

    if (progress <= 0) return;


    const p =
        easeOutCubic(progress);


    ctx.save();


    ctx.globalAlpha =
        0.25 * p;


    const shadowGradient =
        ctx.createRadialGradient(
            cx,
            cy + 235 * scale,
            0,

            cx,
            cy + 235 * scale,
            90 * scale
        );


    shadowGradient.addColorStop(
        0,
        'rgba(0,0,0,0.75)'
    );


    shadowGradient.addColorStop(
        1,
        'rgba(0,0,0,0)'
    );


    ctx.fillStyle =
        shadowGradient;


    ctx.beginPath();


    ctx.ellipse(
        cx,
        cy + 235 * scale,
        75 * scale,
        17 * scale,
        0,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();
}


// =========================================================
// CORAÇÕES
// =========================================================

function drawHearts(
    cx,
    cy,
    scale,
    progress,
    elapsed
) {

    if (progress <= 0) return;


    const p =
        easeOutCubic(progress);


    ctx.save();


    ctx.globalAlpha =
        p;


    hearts.forEach(
        (heart, index) => {

            const float =
                Math.sin(
                    elapsed / 900 +
                    index * 0.85
                ) *
                3 *
                scale;


            const appear =
                clamp(
                    progress * 1.5 -
                    index * 0.04
                );


            ctx.globalAlpha =
                appear * 0.72;


            ctx.fillStyle =
                '#ff7da7';


            ctx.font =
                `${heart.size * scale}px Arial`;

            ctx.textAlign =
                'center';


            ctx.fillText(
                '♡',
                cx +
                heart.x * scale,

                cy +
                heart.y * scale +
                float
            );
        }
    );


    ctx.restore();
}


// =========================================================
// TEXTO FINAL
// =========================================================

function drawFinalText(
    cx,
    cy,
    scale,
    progress
) {

    if (progress <= 0) return;


    const p =
        easeOutQuart(progress);


    ctx.save();


    ctx.globalAlpha =
        p;


    ctx.fillStyle =
        'rgba(255,255,255,0.78)';


    ctx.font =
        `${10 * scale}px Arial`;


    ctx.textAlign =
        'center';


    ctx.textBaseline =
        'middle';


    ctx.fillText(
        'Clique em qualquer lugar para fechar',

        cx,

        cy +
        315 * scale
    );


    ctx.restore();
}


// =========================================================
// DESENHO COMPLETO
// =========================================================

function drawFlor(timestamp) {

    const w =
        canvas.width;

    const h =
        canvas.height;


    const cx =
        w / 2;


    const cy =
        h / 2;


    const scale =
        Math.min(w, h) /
        CONFIG.scaleBase;


    const elapsed =
        timestamp -
        animationStart;


    // -----------------------------------------------------
    // FUNDO
    // -----------------------------------------------------

    drawBackground(
        cx,
        cy,
        scale
    );


    // -----------------------------------------------------
    // SOMBRA
    // -----------------------------------------------------

    const shadowProgress =
        clamp(
            elapsed / 1800
        );


    drawFlowerShadow(
        cx,
        cy,
        scale,
        shadowProgress
    );


    // -----------------------------------------------------
    // CAULE
    // -----------------------------------------------------

    const stemProgress =
        clamp(
            elapsed /
            CONFIG.stemDuration
        );


    drawStem(
        cx,
        cy,
        scale,
        stemProgress
    );


    // -----------------------------------------------------
    // FOLHAS
    // -----------------------------------------------------

    const leaf1Progress =
        clamp(
            (elapsed - 500) /
            650
        );


    const leaf2Progress =
        clamp(
            (elapsed - 800) /
            650
        );


    const leaf3Progress =
        clamp(
            (elapsed - 1050) /
            650
        );


    drawLeaf(
        cx - 18 * scale,
        cy + 138 * scale,
        -2.65,
        65 * scale,
        28 * scale,
        leaf1Progress,
        scale
    );


    drawLeaf(
        cx + 5 * scale,
        cy + 90 * scale,
        -0.40,
        59 * scale,
        25 * scale,
        leaf2Progress,
        scale
    );


    drawLeaf(
        cx - 4 * scale,
        cy + 185 * scale,
        2.75,
        48 * scale,
        22 * scale,
        leaf3Progress,
        scale
    );


    // -----------------------------------------------------
    // POSIÇÃO DA ROSA
    // -----------------------------------------------------

    const flowerX =
        cx;


    const flowerY =
        cy;


    // -----------------------------------------------------
    // ABERTURA DAS PÉTALAS
    // -----------------------------------------------------

    roseLayers.forEach(
        (layer, layerIndex) => {

            const layerProgress =
                clamp(
                    (elapsed - layer.start) /
                    layer.duration
                );


            if (layerProgress <= 0) {
                return;
            }


            for (
                let i = 0;
                i < layer.count;
                i++
            ) {

                const baseAngle =
                    layer.rotation +
                    (
                        i /
                        layer.count
                    ) *
                    Math.PI *
                    2;


                // pequena irregularidade
                const irregular =
                    Math.sin(
                        i * 9.17 +
                        layerIndex * 4.23
                    ) * 0.045;


                const angle =
                    baseAngle +
                    irregular;


                const lengthVariation =
                    0.92 +
                    (
                        (
                            i * 17 +
                            layerIndex * 11
                        ) % 10
                    ) / 100;


                const widthVariation =
                    0.94 +
                    (
                        (
                            i * 13 +
                            layerIndex * 7
                        ) % 8
                    ) / 100;


                const length =
                    layer.length *
                    scale *
                    lengthVariation;


                const width =
                    layer.width *
                    scale *
                    widthVariation;


                drawRosePetal(
                    flowerX,
                    flowerY,
                    angle,
                    length,
                    width,
                    layerProgress,
                    layer.palette,
                    scale,
                    layerIndex,
                    i
                );
            }
        }
    );


    // -----------------------------------------------------
    // PÉTALAS INTERNAS ENROLADAS
    // -----------------------------------------------------

    const innerProgress =
        clamp(
            (elapsed - 1850) /
            900
        );


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        drawInnerCurl(
            flowerX,
            flowerY,
            scale,
            innerProgress,
            i
        );
    }


    // -----------------------------------------------------
    // CENTRO
    // -----------------------------------------------------

    const centerProgress =
        clamp(
            (elapsed - 2350) /
            700
        );


    drawRoseCenter(
        flowerX,
        flowerY,
        scale,
        centerProgress
    );


    // -----------------------------------------------------
    // CORAÇÕES
    // -----------------------------------------------------

    const heartsProgress =
        clamp(
            (elapsed - 3150) /
            1100
        );


    drawHearts(
        cx,
        cy,
        scale,
        heartsProgress,
        elapsed
    );


    // -----------------------------------------------------
    // TEXTO FINAL
    // -----------------------------------------------------

    const textProgress =
        clamp(
            (elapsed - 3500) /
            800
        );


    drawFinalText(
        cx,
        cy,
        scale,
        textProgress
    );
}


// =========================================================
// LOOP
// =========================================================

function animate(timestamp) {

    if (!animationStart) {

        animationStart =
            timestamp;
    }


    drawFlor(timestamp);


    requestAnimationFrame(
        animate
    );
}


// =========================================================
// CLIQUE — RECOMEÇA A ROSA
// =========================================================

canvas.addEventListener(
    'click',
    () => {

        animationStart =
            performance.now();

    }
);


// =========================================================
// INICIALIZAÇÃO
// =========================================================

window.addEventListener(
    'resize',
    resizeCanvas
);


document.addEventListener(
    'DOMContentLoaded',
    () => {

        resizeCanvas();

    }
);