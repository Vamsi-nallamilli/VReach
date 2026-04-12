// webgl.js - Three.js setup for VReach background
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // PARTICLES (Nodes)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700; // Optimal for performance
    
    const posArray = new Float32Array(particlesCount * 3);
    const connectionArray = []; // Store lines

    for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles out over a large depth
        posArray[i] = (Math.random() - 0.5) * 250;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.6,
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Scroll Integration (Camera drops as we scroll down to simulate moving through the network)
    let scrollY = window.scrollY;
    document.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate network slowly
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Easing mouse movement
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Camera positioning based on scroll + mouse
        camera.position.y = -scrollY * 0.02;
        
        // Add subtle mouse parallax
        camera.position.x += (targetX * 50 - camera.position.x) * 0.05;
        // z-axis breathes
        camera.position.z += (80 - targetY * 20 - camera.position.z) * 0.05;

        // Look at center to keep focused
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }

    tick();

    // RESIZE FIX
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
