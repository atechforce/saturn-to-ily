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
    // Ingat: Y makin kecil = makin ke atas layar
    const isIndexUp = indexTip.y < indexPip.y;
    const isMiddleUp = middleTip.y < middlePip.y;
    const isRingUp = ringTip.y < ringPip.y;
    const isPinkyUp = pinkyTip.y < pinkyPip.y;
    
    // Cek Jempol (Jempol agak beda, kita cek apakah dia terbuka lebar ke samping)
    // Tapi untuk ILY sign, biasanya cukup cek apakah 3 jari utama (Telunjuk, Kelingking) naik, dan tengah turun.

    // --- LOGIKA DETEKSI BARU ---

    // 1. CEK ILY SIGN (Spider-man / Rock) 🤟 -> Teks I LOVE YOU
    // Syarat: Telunjuk & Kelingking NAIK. Tengah & Manis TURUN.
    if (isIndexUp && !isMiddleUp && !isRingUp && isPinkyUp) {
        return "ILY"; // Ini trigger teks
    }

    // 2. CEK V-SIGN (Peace) ✌️ -> BENTUK HATI
    // Syarat: Telunjuk & Tengah NAIK. Manis & Kelingking TURUN.
    if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
        return "Heart"; // Ini trigger bentuk hati
    }

    // 3. CEK FIST (Kepalan) ✊ -> SATURNUS
    // Syarat: Semua jari (selain jempol) TURUN.
    if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
        return "Fist"; // Ini trigger Saturnus
    }

    // 4. Default
    return "Scatter";
}