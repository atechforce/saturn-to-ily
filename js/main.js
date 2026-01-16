const videoElement = document.getElementsByClassName('input_video')[0];

function onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        window.handResult.landmarks = results.multiHandLandmarks[0];
        window.handResult.gesture = detectGesture(results.multiHandLandmarks[0]);
    } else {
        window.handResult.gesture = "None";
        window.handResult.landmarks = null;
    }
}

const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 640,  // Resolusi aman untuk performa
    height: 480
});

camera.start();