// Variable global
window.handResult = {
    gesture: "None",
    landmarks: null
};

function detectGesture(landmarks) {
    // Cek posisi ujung jari vs pangkal jari
    const isIndexUp = landmarks[8].y < landmarks[6].y;
    const isMiddleUp = landmarks[12].y < landmarks[10].y;
    const isRingUp = landmarks[16].y < landmarks[14].y;
    const isPinkyUp = landmarks[20].y < landmarks[18].y;

    // 1. FIST (Semua jari turun) -> Saturnus
    if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
        return "Fist";
    }

    // 2. LOVE / V-SIGN (Telunjuk & Tengah naik) -> Teks
    if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
        return "Love";
    }

    // 3. OPEN (Semua naik) -> Scatter
    if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp) {
        return "Open";
    }

    return "None";
}