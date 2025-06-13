import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";

// Basic Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("scene-container").appendChild(renderer.domElement);

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
camera.position.set(0, 20, 40);
controls.update();

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Soft white light
scene.add(ambientLight);

// Sun with Glow
const sunGeo = new THREE.SphereGeometry(4, 64, 64);
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('textures/Sun.jpg');
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Background Stars
function createStars(count = 1000) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    positions.push(x, y, z);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}
createStars();

// Planets
const planetsData = [
  { name: 'Mercury', size: 0.4, distance: 6, speed: 0.04, color: 0xaaaaaa },
  { name: 'Venus', size: 0.6, distance: 8, speed: 0.015, color: 0xffcc99 },
  { name: 'Earth', size: 0.65, distance: 10, speed: 0.01, color: 0x3399ff },
  { name: 'Mars', size: 0.5, distance: 12, speed: 0.008, color: 0xff3300 },
  { name: 'Jupiter', size: 1.2, distance: 15, speed: 0.004, color: 0xffcc66 },
  { name: 'Saturn', size: 1.0, distance: 18, speed: 0.003, color: 0xffffcc },
  { name: 'Uranus', size: 0.9, distance: 21, speed: 0.002, color: 0x66ffff },
  { name: 'Neptune', size: 0.85, distance: 24, speed: 0.001, color: 0x6666ff },
];

const planets = [];
planetsData.forEach((data) => {

  // Create planet
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('textures/' + data.name + '.jpg');
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7 });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = {
    angle: Math.random() * Math.PI * 2,
    speed: data.speed,
    distance: data.distance,
    name: data.name
  };
  scene.add(mesh);
  planets.push(mesh);


  // Orbit ring
  const orbitGeo = new THREE.RingGeometry(data.distance - 0.01, data.distance + 0.01, 64);
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Control slider
  const label = document.createElement('label');
  label.innerHTML = `${data.name}: <input type="range" min="0" max="0.05" step="0.001" value="${data.speed}" id="slider-${data.name}"><br>`;
  document.getElementById("controls").appendChild(label);
  document.getElementById(`slider-${data.name}`).addEventListener("input", (e) => {
    mesh.userData.speed = parseFloat(e.target.value);
  });
});

// Pause/Resume
let paused = false;
document.getElementById("togglePause").addEventListener("click", () => {
  paused = !paused;
  document.getElementById("togglePause").innerText = paused ? "Resume" : "Pause";
});

// Animation Loop
function animate() {
  if (!paused) {
    planets.forEach(planet => {
      planet.userData.angle += planet.userData.speed;
      planet.position.x = planet.userData.distance * Math.cos(planet.userData.angle);
      planet.position.z = planet.userData.distance * Math.sin(planet.userData.angle);
    });
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
function preloadResources() {
  const textureLoader = new THREE.TextureLoader();

  // Wrap each load call in a Promise
  const texturePromises = planetsData.map(data => {
    return new Promise((resolve, reject) => {
      textureLoader.load(
        'textures/' + data.name + '.jpg',
        texture => resolve(texture),
        undefined,
        err => reject(err)
      );
    });
  });

  Promise.all(texturePromises)
    .then(textures => {
      planetsData.forEach((data, index) => {
        data.texture = textures[index];
      });
      const element=document.getElementById("loader");
      element.style.display = "none";
      element.style.backgroundColor = "transparent";
    })
}
preloadResources();

