import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,
  r = 450;

let mouseY = 0,
  windowHalfY = window.innerHeight / 2,
  camera,
  scene,
  renderer;

const effectController = {
  velocity: 1,
  size: 1,
  count: 100,
};

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    SCREEN_WIDTH / SCREEN_HEIGHT,
    1,
    3000
  );
  camera.position.z = 1000;

  scene = new THREE.Scene();
  const colors = [0xff57b2, 0x7b1fa2, 0x4fc3f7, 0xff9800, 0x4caf50, 0x9c27b0, 0x009688, 0xffeb3b]
  const scales = [0.5, 0.5, 0.75, 1, 1.25, 3.0, 3.5, 4.5]

  const geometry = createGeometry();

  for (let i = 0; i < colors.length; ++i) {
    const material = new THREE.MeshBasicMaterial({
      color: colors[i],
      opacity: Math.random() + 0.2,

      transparent: true,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.userData.originalScale = scales[i];
    cube.rotation.y = Math.random() * Math.PI;
    cube.updateMatrix();
    scene.add(cube);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);

  document.body.style.touchAction = "none";
  document.body.addEventListener("pointermove", onPointerMove);

  // GUI
  const gui = new GUI();

  gui.add(effectController, "velocity", 0.0, 2.0, 0.01).name("velocity");
  gui.add(effectController, "size", 0.0, 2.0, 0.01).name("size");
  gui.add(effectController, "count", 1, 256, 1).name("count");
  gui.close();

  // Events

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("click", onDocumentMouseDown);
}

function createGeometry() {
  const sphereGeometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const numSpheres = effectController.count;
  const sphereRadius = 256 * effectController.size;
  const sphereColor = Math.random() * 0xffffff;
  const cubeSize = 16 * effectController.size;

  for (let i = 0; i < numSpheres; i++) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(sphereRadius, sphereRadius, sphereRadius),
      new THREE.MeshLambertMaterial({ color: sphereColor })
    );

    // Generate random position within sphere
    const position = new THREE.Vector3(
      Math.random() * sphereRadius * 2 - sphereRadius,
      Math.random() * sphereRadius * 2 - sphereRadius,
      Math.random() * sphereRadius * 2 - sphereRadius
    ).normalize();

    // Offset position by sphere center
    position.multiplyScalar(sphereRadius);
    sphere.position.copy(position);

    const color = new THREE.Color().setHSL(
      Math.random(),
      Math.random(),
      Math.random()
    );

    // Set colors for each vertex of cube
    const cubeColors = [
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 1
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 2
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 3
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 4
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 5
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 6
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 7
      color.r * Math.random(),
      color.g * Math.random(),
      color.b * Math.random(), // Vertex 8
    ];

    // Add vertices and colors to arrays

    const cubeGeometry = new THREE.BoxGeometry(
      Math.random() * cubeSize * 2 - cubeSize,
      Math.random() * cubeSize * 2 - cubeSize,
      Math.random() * cubeSize * 2 - cubeSize
    );

    cubeGeometry.rotateX(Math.random() * Math.PI);
    cubeGeometry.rotateY(Math.random() * Math.PI);
    cubeGeometry.rotateZ(Math.random() * Math.PI);

    cubeGeometry.translate(position.x, position.y, position.z);
    positions.push(...cubeGeometry.attributes.position.array);
    colors.push(...cubeColors);
  }

  sphereGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  sphereGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );
  return sphereGeometry;
}

function onDocumentMouseDown() {
    const geometry = createGeometry();
    scene.traverse( function ( object ) {
        if ( object.Mesh ) {
            object.geometry.dispose();
            object.geometry = geometry;
        }
    } );
}

function onWindowResize() {
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;

  mouseY = event.clientY - windowHalfY;
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  const time = Date.now() * 0.0002 * effectController.velocity;

  camera.position.y += (-mouseY + 200 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object.isMesh) {
      // inner cubes rotate around x axis
      // outer cubes rotate around y axis
      if (i < 4) object.rotation.x = time * (i + 1);
      else object.rotation.y = time * (i + 1);
      const sineOffset = Math.sin(time * 2) * 500;
      // add some randomness to the movement
      object.position.x = sineOffset + Math.random() * 2 - 4;
      object.position.y = sineOffset + Math.random() * 2 - 4;

      const scale =
        object.userData.originalScale *
        (i / 8 + 1) *
        (1 + 0.5 * Math.sin(8 * time));

      object.scale.x = object.scale.y = object.scale.z = scale;
    }
  }
}
