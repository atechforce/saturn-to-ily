window.handResult = {
    gesture: "None",
    landmarks: null
};

function detectGesture(landmarks) {
    // --- AMBIL TITIK JARI ---
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // --- AMBIL PANGKAL JARI (Untuk referensi lurus/tekuk) ---
    const indexPip = landmarks[6];
    const middlePip = landmarks[10];
    const ringPip = landmarks[14];
    const pinkyPip = landmarks[18];

    // --- STATUS JARI (NAIK/TURUN) ---
    // Y makin kecil = makin ke atas layar
    const isIndexUp = indexTip.y < indexPip.y;
    const isMiddleUp = middleTip.y < middlePip.y;
    const isRingUp = ringTip.y < ringPip.y;
    const isPinkyUp = pinkyTip.y < pinkyPip.y;
    
    // --- LOGIKA DETEKSI BARU ---

    // 1. CEK POINT (TUNJUK) ☝️ -> BLACK HOLE (BARU!)
    // Syarat: Hanya Telunjuk NAIK. Tengah, Manis, Kelingking TURUN.
    if (isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
        return "Point"; // Trigger Black Hole
    }

    // 2. CEK ILY (TEKS) 🤟
    // Syarat: Telunjuk & Kelingking NAIK. Tengah & Manis TURUN.
    if (isIndexUp && !isMiddleUp && !isRingUp && isPinkyUp) {
        return "ILY";
    }

    // 3. CEK HEART (V-SIGN) ✌️
    // Syarat: Telunjuk & Tengah NAIK. Manis & Kelingking TURUN.
    if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
        return "Heart";
    }

    // 4. CEK FIST (SATURNUS) ✊
    // Syarat: Semua jari utama TURUN.
    if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
        return "Fist";
    }

    // 5. CEK PINKY (WAJAH) 🤙
    // Syarat: Hanya Kelingking NAIK.
    if (!isIndexUp && !isMiddleUp && !isRingUp && isPinkyUp) {
        return "Pinky";
    }

    // Default
    return "Scatter";
}