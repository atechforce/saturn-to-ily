import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

// --- SETUP SCENE ---
const canvas = document.querySelector('.output_canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png');

// --- LOAD IMAGE (FACE) ---
let imagePoints = []; 
const img = new Image();
img.crossOrigin = "Anonymous";
img.src = 'face.jpg'; 
img.onload = function() {
    const vCanvas = document.createElement('canvas');
    const ctx = vCanvas.getContext('2d');
    const width = 150; const height = 150 * (img.height / img.width); 
    vCanvas.width = width; vCanvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;
    imagePoints = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const alpha = imgData[index + 3];
            if (alpha > 128) { 
                imagePoints.push({
                    x: (x - width/2) * 0.8, y: -(y - height/2) * 0.8, z: 0,
                    color: {r: imgData[index]/255, g: imgData[index+1]/255, b: imgData[index+2]/255}
                });
            }
        }
    }
    console.log("Gambar Siap!", imagePoints.length);
};

// --- PARTICLE SYSTEM ---
const particleCount = 9500; 
let currentShape = 'scatter';

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const targets = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const tempColor = new THREE.Color();

// Init Scatter
for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 300; positions[i3+1] = (Math.random() - 0.5) * 300; positions[i3+2] = (Math.random() - 0.5) * 300;
    targets[i3] = positions[i3]; targets[i3+1] = positions[i3+1]; targets[i3+2] = positions[i3+2];
    tempColor.setHSL(Math.random(), 0.8, 0.6);
    colors[i3] = tempColor.r; colors[i3+1] = tempColor.g; colors[i3+2] = tempColor.b; 
    sizes[i] = 0.5 + Math.random(); 
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.PointsMaterial({
    size: 1.0, map: particleTexture, vertexColors: true, blending: THREE.AdditiveBlending, 
    depthWrite: false, transparent: true, opacity: 0.9, sizeAttenuation: true
});
const particles = new THREE.Points(geometry, material);
scene.add(particles);


// --- RUMUS BENTUK ---

// Definisi Warna Palette Interstellar
const bhHotWhite = new THREE.Color(0xffffff);   // Pusat Putih Panas
const bhHotYellow = new THREE.Color(0xffd27d);  // Kuning Emas
const bhHotOrange = new THREE.Color(0xff7300);  // Oranye Api
const bhCoolBlue = new THREE.Color(0x0066ff);   // Biru Galaxy
const bhCoolPurple = new THREE.Color(0x6200ff); // Ungu Galaxy
const bhFinalColor = new THREE.Color();

// FUNGSI BLACK HOLE DENGAN WARNA GALAXY (API & ES)
function calculateBlackHole() {
    const innerRadius = 5;
    const outerRadius = 25; // Diperlebar sedikit

    for(let i=0; i<particleCount; i++){
        const i3 = i * 3;
        
        // Distribusi Radius
        const ratio = Math.pow(Math.random(), 1.5); // 0.0 (pusat) s/d 1.0 (luar)
        const radius = innerRadius + ratio * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;

        // Posisi Piringan
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);
        let y = (Math.random() - 0.5) * (3.0 * (1.0 - ratio * 0.6)); // Ketebalan bervariasi

        targets[i3] = x; targets[i3+1] = y; targets[i3+2] = z;

        // --- PEWARNAAN KOMPLEKS (INTERSTELLAR STYLE) ---
        const randomAccent = Math.random(); // Faktor acak untuk variasi

        if (ratio < 0.2) {
            // ZONA 1: INTI PANAS (Putih ke Kuning)
            bhFinalColor.copy(bhHotWhite).lerp(bhHotYellow, ratio * 5);
        } else if (ratio < 0.5) {
            // ZONA 2: PIRINGAN API (Kuning ke Oranye)
            bhFinalColor.copy(bhHotYellow).lerp(bhHotOrange, (ratio - 0.2) * 3.3);
        } else {
            // ZONA 3: PINGGIRAN GALAXY (Campuran Oranye dengan Biru/Ungu)
            // Semakin jauh (ratio besar), semakin banyak biru/ungu masuk.
            
            // Warna dasar api yang meredup
            let baseFire = bhHotOrange.clone().lerp(new THREE.Color(0x220000), (ratio-0.5)*2);
            
            // Warna aksen dingin (Biru atau Ungu secara acak)
            let accentColor = (randomAccent > 0.5) ? bhCoolBlue : bhCoolPurple;
            
            // Campurkan! Semakin ke luar, semakin dominan warna dinginnya.
            // Faktor 'ratio * ratio' membuat pinggiran luar sangat biru/ungu.
            bhFinalColor.copy(baseFire).lerp(accentColor, ratio * ratio * 0.8);
        }

        colors[i3] = bhFinalColor.r;
        colors[i3+1] = bhFinalColor.g;
        colors[i3+2] = bhFinalColor.b;
    }
}

function calculateSaturn() {
    const planetCount = Math.floor(particleCount * 0.6);
    const planetRadius = 8;
    for(let i=0; i<particleCount; i++){
        const i3 = i * 3;
        let x, y, z, r, g, b;
        if (i < planetCount) { 
            const phi = Math.acos(-1 + (2 * i) / planetCount); const theta = Math.sqrt(planetCount * Math.PI) * phi;
            x = planetRadius * Math.cos(theta) * Math.sin(phi); y = planetRadius * Math.sin(theta) * Math.sin(phi); z = planetRadius * Math.cos(phi);
            r=1.0; g=0.7; b=0.2; 
        } else { 
            const radius = 10 + Math.random() * 6; const angle = Math.random() * Math.PI * 2;
            x = radius * Math.cos(angle); z = radius * Math.sin(angle); y = (Math.random() - 0.5) * 0.5;
            r=0.9; g=0.8; b=0.7; 
        }
        targets[i3]=x; targets[i3+1]=y; targets[i3+2]=z; colors[i3]=r; colors[i3+1]=g; colors[i3+2]=b;
    }
}

function calculateHeart() {
    const scale = 11; 
    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3; let x, y, z; let attempt = 0;
        while (true) {
            x = (Math.random() - 0.5) * 3.5; y = (Math.random() - 0.5) * 3; z = (Math.random() - 0.5) * 2; 
            const x2 = x * 1.2; const y2 = y; const z2 = z * 1.5;
            const a = x2*x2 + (9/4)*y2*y2 + z2*z2 - 1;
            if (a*a*a - x2*x2*z2*z2*z2 - (9/80)*y2*y2*z2*z2*z2 <= 0) break;
            attempt++; if (attempt > 100) break;
        }
        targets[i3] = x * scale; targets[i3+1] = y * scale; targets[i3+2] = z * scale * 1.5; 
        const rand = Math.random(); colors[i3] = 1.0; colors[i3+1] = 0.0 + rand * 0.3; colors[i3+2] = 0.2 + rand * 0.5; 
    }
}

function calculateText() {
    if (!sampler) return;
    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3; sampler.sample(tempPosition);
        targets[i3] = tempPosition.x; targets[i3+1] = tempPosition.y; targets[i3+2] = tempPosition.z;
        colors[i3] = 0.2; colors[i3+1] = 0.6; colors[i3+2] = 1.0;
    }
}

function updateFaceTargets() {
    if (imagePoints.length === 0) return;
    const time = Date.now() * 0.001; 
    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3; const point = imagePoints[i % imagePoints.length];
        const driftZ = Math.sin(time + point.x * 0.05) * 2.0;
        targets[i3] = point.x; targets[i3+1] = point.y; targets[i3+2] = point.z + driftZ; 
        colors[i3] = point.color.r; colors[i3+1] = point.color.g; colors[i3+2] = point.color.b;
    }
}

function calculateScatter() {
    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3; targets[i3] = (Math.random()-0.5) * 200; targets[i3+1] = (Math.random()-0.5) * 200; targets[i3+2] = (Math.random()-0.5) * 200;
        tempColor.setHSL(Math.random(), 0.8, 0.6); colors[i3] = tempColor.r; colors[i3+1] = tempColor.g; colors[i3+2] = tempColor.b;
    }
}

// --- TRANSISI ---
function morphTo(shape) {
    if (currentShape === shape) return;
    currentShape = shape;

    particles.rotation.set(0, 0, 0);

    if (shape === 'saturn') calculateSaturn();
    else if (shape === 'heart') { calculateHeart(); particles.rotation.set(-Math.PI / 2, 0, 0); }
    else if (shape === 'text') calculateText();
    else if (shape === 'face') { /* Update di animate */ }
    else if (shape === 'blackhole') { 
        calculateBlackHole(); 
        particles.rotation.x = 0.4; 
    }
    else calculateScatter();
    
    geometry.attributes.color.needsUpdate = true;
}

// Load Font
let sampler = null;
const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new TextGeometry('I LOVE YOU', { font: font, size: 4.5, height: 1, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 3 });
    textGeo.center(); const textMesh = new THREE.Mesh(textGeo); sampler = new MeshSurfaceSampler(textMesh).build();
});
const tempPosition = new THREE.Vector3();


// --- ANIMASI ---
function animate() {
    requestAnimationFrame(animate);
    const gesture = window.handResult?.gesture;
    const landmarks = window.handResult?.landmarks;

    // Selector Bentuk Baru
    if (gesture === 'Fist') morphTo('saturn');
    else if (gesture === 'Heart') morphTo('heart');
    else if (gesture === 'ILY') morphTo('text');
    else if (gesture === 'Pinky') morphTo('face');
    else if (gesture === 'Point') morphTo('blackhole'); 
    else morphTo('scatter');

    if (currentShape === 'face') updateFaceTargets();

    // Update Lerp
    const posAttr = geometry.attributes.position; const colAttr = geometry.attributes.color;
    for (let i = 0; i < particleCount * 3; i++) {
        posAttr.array[i] += (targets[i] - posAttr.array[i]) * 0.08; colAttr.array[i] += (colors[i] - colAttr.array[i]) * 0.05;
    }
    posAttr.needsUpdate = true; colAttr.needsUpdate = true;

    // Interaksi & Rotasi
    if (landmarks && gesture !== 'None' && gesture !== 'Scatter') {
        const hx = (landmarks[9].x - 0.5) * 2; 
        const hy = (landmarks[9].y - 0.5) * 2; 

        particles.position.x = THREE.MathUtils.lerp(particles.position.x, -hx * 20, 0.1);
        particles.position.y = THREE.MathUtils.lerp(particles.position.y, -hy * 15, 0.1);

        if (currentShape === 'heart') {
            particles.rotation.z += 0.01; particles.rotation.y = hx * 0.5;
        } else if (currentShape === 'face') {
            particles.rotation.y += 0.02; particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, hy * 0.3, 0.1); particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, 0, 0.1);
        } else if (currentShape === 'blackhole') {
            particles.rotation.y += 0.05; 
            particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, 0.4 + hy * 0.3, 0.1);
            particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, hx * 0.3, 0.1);
        } else {
            particles.rotation.y += 0.01; particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, hy * 0.5, 0.1); particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, hx * 0.5, 0.1);
        }

    } else {
        // IDLE
        if (currentShape === 'heart') particles.rotation.z += 0.005;
        else if (currentShape === 'face') particles.rotation.y += 0.01; 
        else if (currentShape === 'blackhole') particles.rotation.y += 0.03;
        else particles.rotation.y += 0.002;
        
        if (currentShape !== 'face' && currentShape !== 'heart' && currentShape !== 'blackhole') {
             particles.rotation.x *= 0.95; particles.rotation.z *= 0.95;
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();