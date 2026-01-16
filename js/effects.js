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

// --- PARTICLE SYSTEM ---
const particleCount = 9000;
let currentShape = 'scatter';

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const targets = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

// Init Scatter
for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 300;
    positions[i3+1] = (Math.random() - 0.5) * 300;
    positions[i3+2] = (Math.random() - 0.5) * 300;
    
    targets[i3] = positions[i3];
    targets[i3+1] = positions[i3+1];
    targets[i3+2] = positions[i3+2];

    colors[i3] = 1; colors[i3+1] = 1; colors[i3+2] = 1; 
    sizes[i] = 0.5 + Math.random(); 
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.PointsMaterial({
    size: 1.0, 
    map: particleTexture, vertexColors: true, blending: THREE.AdditiveBlending, 
    depthWrite: false, transparent: true, opacity: 0.9, sizeAttenuation: true
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);


// --- RUMUS BENTUK ---

// 1. SATURNUS
function calculateSaturn() {
    const planetCount = Math.floor(particleCount * 0.6);
    const planetRadius = 8;

    for(let i=0; i<particleCount; i++){
        const i3 = i * 3;
        let x, y, z, r, g, b;

        if (i < planetCount) { // Planet
            const phi = Math.acos(-1 + (2 * i) / planetCount);
            const theta = Math.sqrt(planetCount * Math.PI) * phi;
            x = planetRadius * Math.cos(theta) * Math.sin(phi);
            y = planetRadius * Math.sin(theta) * Math.sin(phi);
            z = planetRadius * Math.cos(phi);
            r=1.0; g=0.7; b=0.2; 
        } else { // Cincin
            const radius = 10 + Math.random() * 6;
            const angle = Math.random() * Math.PI * 2;
            x = radius * Math.cos(angle);
            z = radius * Math.sin(angle);
            y = (Math.random() - 0.5) * 0.5;
            r=0.9; g=0.8; b=0.7;
        }
        targets[i3]=x; targets[i3+1]=y; targets[i3+2]=z;
        colors[i3]=r; colors[i3+1]=g; colors[i3+2]=b;
    }
}

// 2. HEART (DIPERBAIKI: GEMBUL)
function calculateHeart() {
    const scale = 11; // Besar

    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3;
        let x, y, z;
        
        let attempt = 0;
        while (true) {
            // Area Random melebar (Gembul)
            x = (Math.random() - 0.5) * 3.5; 
            y = (Math.random() - 0.5) * 3; 
            z = (Math.random() - 0.5) * 2; // Tebal
            
            // Rumus Heart
            const x2 = x * 1.2; 
            const y2 = y;
            const z2 = z * 1.5;

            const a = x2*x2 + (9/4)*y2*y2 + z2*z2 - 1;
            
            if (a*a*a - x2*x2*z2*z2*z2 - (9/80)*y2*y2*z2*z2*z2 <= 0) break;
            
            attempt++;
            if (attempt > 100) break;
        }

        targets[i3] = x * scale;     
        targets[i3+1] = y * scale;   
        targets[i3+2] = z * scale * 1.5; 

        // Warna Pink Gradasi
        const rand = Math.random();
        colors[i3] = 1.0; 
        colors[i3+1] = 0.0 + rand * 0.3; 
        colors[i3+2] = 0.2 + rand * 0.5; 
    }
}

// 3. TEXT "I LOVE YOU"
let sampler = null;
const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new TextGeometry('I LOVE YOU', {
        font: font, size: 4.5, height: 1, curveSegments: 12,
        bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 3
    });
    textGeo.center();
    const textMesh = new THREE.Mesh(textGeo);
    sampler = new MeshSurfaceSampler(textMesh).build();
});
const tempPosition = new THREE.Vector3();

function calculateText() {
    if (!sampler) return;
    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3;
        sampler.sample(tempPosition);
        targets[i3] = tempPosition.x; 
        targets[i3+1] = tempPosition.y; 
        targets[i3+2] = tempPosition.z;
        colors[i3] = 0.2; colors[i3+1] = 0.6; colors[i3+2] = 1.0;
    }
}

function calculateScatter() {
    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3;
        targets[i3] = (Math.random()-0.5) * 200;
        targets[i3+1] = (Math.random()-0.5) * 200;
        targets[i3+2] = (Math.random()-0.5) * 200;
        colors[i3] = 1; colors[i3+1] = 1; colors[i3+2] = 1;
    }
}


// --- TRANSISI & ROTASI BERDIRI ---
function morphTo(shape) {
    if (currentShape === shape) return;
    currentShape = shape;

    if (shape === 'saturn') {
        calculateSaturn();
        particles.rotation.set(0, 0, 0); 
    } 
    else if (shape === 'heart') {
        calculateHeart();
        // PAKSA BERDIRI: Rotasi X -90 derajat
        particles.rotation.set(-Math.PI / 2, 0, 0); 
    } 
    else if (shape === 'text') {
        calculateText();
        particles.rotation.set(0, 0, 0); 
    } 
    else {
        calculateScatter();
        particles.rotation.set(0, 0, 0);
    }

    geometry.attributes.color.needsUpdate = true;
}


// --- ANIMASI LOOP ---
function animate() {
    requestAnimationFrame(animate);

    const gesture = window.handResult?.gesture;
    const landmarks = window.handResult?.landmarks;

    if (gesture === 'Fist') morphTo('saturn');
    else if (gesture === 'Heart') morphTo('heart');
    else if (gesture === 'ILY') morphTo('text');
    else morphTo('scatter');

    // Update Lerp
    const posAttr = geometry.attributes.position;
    const colAttr = geometry.attributes.color;
    for (let i = 0; i < particleCount * 3; i++) {
        posAttr.array[i] += (targets[i] - posAttr.array[i]) * 0.08;
        colAttr.array[i] += (colors[i] - colAttr.array[i]) * 0.05;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // --- LOGIKA ROTASI YANG DIPERBAIKI ---
    if (landmarks && gesture !== 'None' && gesture !== 'Scatter') {
        const hx = (landmarks[9].x - 0.5) * 2; 
        const hy = (landmarks[9].y - 0.5) * 2; 

        particles.position.x = THREE.MathUtils.lerp(particles.position.x, -hx * 20, 0.1);
        particles.position.y = THREE.MathUtils.lerp(particles.position.y, -hy * 15, 0.1);

        if (currentShape === 'heart') {
            // KHUSUS HEART: Putar sumbu Z (karena sudah dimiringkan -90 di X)
            // Ini akan membuatnya berputar Kiri-Kanan seperti Globe (Normal)
            particles.rotation.z += 0.01; 
            
            // Interaksi tangan (Tilt)
            particles.rotation.y = hx * 0.5;
        } else {
            // UNTUK SATURNUS & TEXT: Putar sumbu Y biasa
            particles.rotation.y += 0.01; 
            
            // Interaksi tangan
            particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, hy * 0.5, 0.1);
            particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, hx * 0.5, 0.1);
        }

    } else {
        // IDLE ANIMATION
        if (currentShape === 'heart') {
            particles.rotation.z += 0.005; // Putar globe idle
        } else {
            particles.rotation.y += 0.002;
            particles.rotation.x *= 0.95;
            particles.rotation.z *= 0.95;
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();