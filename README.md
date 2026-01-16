# 🌌 Cosmic Gesture: 3D Particle Morphing

A web-based interactive experience that transforms hand gestures into volumetric 3D particle formations. Inspired by sci-fi holographic interfaces (Iron Man style), this project uses Computer Vision to control a 3D particle system in real-time.

![Project Screenshot](path/to/your/screenshot.jpg)
*(Note: Replace `path/to/your/screenshot.jpg` with an actual screenshot from your project)*

## ✨ Features

* **Real-time Hand Tracking:** Detects hand landmarks with high precision using MediaPipe.
* **3D Particle Morphing:** Seamlessly transitions thousands of particles between different states:
    * 🌌 **Scatter:** Random floating stardust.
    * 🪐 **Saturn:** A volumetric 3D planet with rings, reacting to hand rotation.
    * ❤️ **Text:** Dynamic 3D text ("I LOVE YOU") generated using Mesh Surface Sampling.
* **Interactive Controls:** The 3D objects follow the hand's position and rotation in 3D space.
* **High Performance:** Optimized rendering loop using Three.js and instanced geometry/points.

## 🎮 How to Use (Gestures)

| Gesture | Effect |
| :--- | :--- |
| **Open Hand** 🖐️ | Particles scatter like stars in the universe. |
| **Fist** ✊ | Particles converge to form a **3D Saturn**. Move hand to rotate the planet. |
| **V-Sign (Peace)** ✌️ | Particles morph into glowing **"I LOVE YOU"** text. |

## 🛠️ Tech Stack

* **Language:** JavaScript (ES6+), HTML5, CSS3.
* **3D Engine:** [Three.js](https://threejs.org/) (WebGL).
* **Computer Vision:** [MediaPipe Hands](https://developers.google.com/mediapipe).
* **Techniques:** Particle Systems, BufferGeometry, Raycasting/Sampling, Import Maps.

## 🚀 How to Run

Since this project uses ES6 Modules and accesses the webcam, it **must be run on a local server**. It will not work if you simply double-click the HTML file due to CORS policy.

### Option 1: VS Code (Recommended)
1.  Clone this repository.
2.  Open the folder in **Visual Studio Code**.
3.  Install the **"Live Server"** extension.
4.  Right-click on `index.html` and select **"Open with Live Server"**.
5.  Allow camera access in your browser.

### Option 2: Python Simple Server
If you have Python installed:
```bash
# Navigate to project directory
cd path/to/project

# Start server
python -m http.server 5500