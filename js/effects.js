import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
// Import Sampler untuk menyebar titik di permukaan teks secara merata
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

// --- SETUP SCENE ---
const canvas = document.querySelector('.output_canvas');
const scene = new THREE.Scene();
// Mundurkan kamera lebih jauh agar objek besar terlihat utuh
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    alpha: true, 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- LOAD TEXTURE PARTIKEL (BULAT) ---
const textureLoader = new THREE.TextureLoader();
// Menggunakan gambar 'spark' standar Three.js agar partikel bulat dan bercahaya
const particleTexture = textureLoader.load('https://threejs.org/examples/textures/sprites/spark1.png');


// --- SISTEM PARTIKEL ---
const particleCount = 8000; // Jumlah partikel ditingkatkan agar teks lebih jelas
let currentShape = 'scatter';

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const targets = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount); // Ukuran tiap partikel berbeda

// Inisialisasi posisi awal (Scatter)
for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Sebar di area yang sangat luas
    positions[i3] = (Math.random() - 0.5) * 300;
    positions[i3+1] = (Math.random() - 0.5) * 300;
    positions[i3+2] = (Math.random() - 0.5) * 300;

    targets[i3] = positions[i3];
    targets[i3+1] = positions[i3+1];
    targets[i3+2] = positions[i3+2];

    // Warna Putih Kebiruan (Bintang)
    colors[i3] = 0.8; colors[i3+1] = 0.9; colors[i3+2] = 1.0;
    // Variasi ukuran agar ada kesan kedalaman
    sizes[i] = 0.5 + Math.random() * 1.0; 
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// Material Kustom agar bisa pakai tekstur bulat dan variasi ukuran
const material = new THREE.PointsMaterial({
    size: 1.0, // Ukuran dasar
    map: particleTexture, // PAKAI TEKSTUR BULAT
    vertexColors: true,
    blending: THREE.AdditiveBlending, // Efek cahaya berpendar
    depthWrite: false,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true // Partikel yang jauh terlihat lebih kecil (efek 3D)
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);


// --- PERHITUNGAN BENTUK (MOLDS) ---

// 1. SATURNUS 3D VOLUMETRIC (Isi bola padat)
function calculateSaturn() {
    const planetCount = Math.floor(particleCount * 0.5); // 50% untuk planet
    const planetRadius = 7;
    
    for(let i=0; i<particleCount; i++){
        const i3 = i * 3;
        let x, y, z, r, g, b;

        if (i < planetCount) {
            // --- BOLA 3D PADAT (Volumetric Sphere) ---
            // Rumus ini mengisi bagian dalam bola secara merata
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            // Akar pangkat 3 agar distribusi merata dari pusat ke kulit
            const radius = Math.cbrt(Math.random()) * planetRadius;

            x = radius * Math.sin(phi) * Math.cos(theta);
            y = radius * Math.sin(phi) * Math.sin(theta);
            z = radius * Math.cos(phi);

            // Warna Emas/Oranye dengan sedikit variasi
            r=1.0; g=0.7 + Math.random()*0.2; b=0.2;
        } else {
            // --- CINCIN PADAT ---
            const ringTotal = particleCount - planetCount;
            const angle = Math.random() * Math.PI * 2;
            // Radius acak antara 9 sampai 14
            const radius = 9 + Math.random() * 5; 
            x = radius * Math.cos(angle);
            z = radius * Math.sin(angle);
            y = (Math.random()-0.5) * 0.8; // Sedikit tebal

            // Warna Cincin Krem Pucat
            r=0.8; g=0.7; b=0.6;
        }
        
        targets[i3] = x; targets[i3+1] = y; targets[i3+2] = z;
        colors[i3] = r; colors[i3+1] = g; colors[i3+2] = b;
    }
}

// 2. TEKS JELAS (Menggunakan Surface Sampler)
let sampler = null; // Penampung sampler
const fontLoader = new FontLoader();

fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', 
    (font) => {
        const textGeo = new TextGeometry('I LOVE YOU', {
            font: font,
            size: 5, // Ukuran teks diperbesar
            height: 1, // Ketebalan 3D
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.1,
            bevelSegments: 5
        });
        textGeo.center();
        
        // Buat Mesh sementara (tidak ditampilkan) untuk di-sampling
        const textMesh = new THREE.Mesh(textGeo);
        // MeshSurfaceSampler akan mencari titik-titik acak di permukaan mesh tsb
        sampler = new MeshSurfaceSampler(textMesh).build();
        console.log("Font & Sampler ready!");
    }
);

const tempPosition = new THREE.Vector3(); // Variabel bantuan

function calculateText() {
    if (!sampler) return; // Tunggu sampler siap

    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3;
        
        // Ambil satu titik acak di permukaan teks
        sampler.sample(tempPosition);

        targets[i3] = tempPosition.x;
        targets[i3+1] = tempPosition.y;
        targets[i3+2] = tempPosition.z;

        // Warna Pink Neon Cerah
        colors[i3] = 1.0; colors[i3+1] = 0.1; colors[i3+2] = 0.6 + Math.random()*0.4;
    }
}

// 3. SCATTER (Menyebar Jauh)
function calculateScatter() {
    for(let i=0; i<particleCount; i++) {
        const i3 = i * 3;
        targets[i3] = (Math.random()-0.5) * 300;
        targets[i3+1] = (Math.random()-0.5) * 300;
        targets[i3+2] = (Math.random()-0.5) * 300;
        
        // Warna Bintang Putih/Biru
        colors[i3] = 0.8; colors[i3+1] = 0.9; colors[i3+2] = 1.0;
    }
}

// --- LOGIC TRANSISI ---
function morphTo(shape) {
    if (currentShape === shape) return;
    if (shape === 'text' && !sampler) return; // Cegah error jika font belum siap

    currentShape = shape;

    if (shape === 'saturn') {
        calculateSaturn();
        // Reset rotasi wadah, kita akan miringkan lewat interaksi tangan
        particles.rotation.set(0, 0, 0); 
    } else if (shape === 'text') {
        calculateText();
        particles.rotation.set(0, 0, 0);
    } else {
        calculateScatter();
        particles.rotation.set(0, 0, 0);
    }
    
    geometry.attributes.color.needsUpdate = true;
}

// --- ANIMASI UTAMA ---
function animate() {
    requestAnimationFrame(animate);

    const gesture = window.handResult?.gesture;
    const landmarks = window.handResult?.landmarks;

    // 1. Tentukan Bentuk
    if (gesture === 'Fist') {
        morphTo('saturn');
    } else if (gesture === 'Love') {
        morphTo('text');
    } else {
        morphTo('scatter');
    }

    // 2. Gerakkan Partikel (Lerp yang lebih halus)
    const posAttr = geometry.attributes.position;
    const colAttr = geometry.attributes.color;
    
    for (let i = 0; i < particleCount * 3; i++) {
        // Kecepatan 0.06 memberikan transisi yang enak dilihat
        posAttr.array[i] += (targets[i] - posAttr.array[i]) * 0.06;
        colAttr.array[i] += (colors[i] - colAttr.array[i]) * 0.06;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // 3. Interaksi Tangan 3D
    if (landmarks && gesture !== 'None') {
        // Mapping koordinat tangan (0-1) ke ruang 3D yang luas
        const handX = (landmarks[9].x - 0.5) * 2; // Range -1 ke 1
        const handY = (landmarks[9].y - 0.5) * 2;

        // Posisi mengikuti tangan
        particles.position.x = THREE.MathUtils.lerp(particles.position.x, -handX * 30, 0.1);
        particles.position.y = THREE.MathUtils.lerp(particles.position.y, -handY * 20, 0.1);
        
        // Rotasi Interaktif
        particles.rotation.y += 0.01; // Selalu berputar pelan pada sumbu Y
        
        if (gesture === 'saturn') {
            // Jika Saturnus, miringkan sumbu X dan Z berdasarkan posisi tangan agar terasa 3D
            particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, handY * 0.5 + 0.3, 0.1);
            particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, handX * 0.5, 0.1);
        } else {
            // Jika teks, jaga agar tetap tegak tapi sedikit miring mengikuti tangan
            particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, handY * 0.2, 0.1);
            particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, handX * 0.2, 0.1);
        }

    } else {
        // Rotasi idle saat menyebar
        particles.rotation.y += 0.003;
        particles.rotation.x *= 0.95; // Kembali tegak pelan-pelan
        particles.rotation.z *= 0.95;
    }

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();