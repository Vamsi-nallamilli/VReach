// webgl.js - Premium Digital Growth Infrastructure
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020306, 0.004); // Deep, elegant atmospheric fade

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 10, 45); // Hero framing

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1; // Smooth cinematic lighting

    const cameraTarget = new THREE.Vector3(0, 0, 0);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x060912, 1.5);
    scene.add(ambientLight);

    // Precision structural rim light
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 2.5);
    rimLight.position.set(40, 60, 20);
    scene.add(rimLight);

    // Deep volumetric fill light
    const fillLight = new THREE.DirectionalLight(0x0a153a, 3.0);
    fillLight.position.set(-60, 20, -50);
    scene.add(fillLight);

    const world = new THREE.Group();
    scene.add(world);

    // --- 1. SIGNAL ENGINE (Refined Core) ---
    const engineGroup = new THREE.Group();
    world.add(engineGroup);

    // Core pulsing geometric node, elegant rather than loud
    const coreMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x050a12, 
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.95
    });
    
    // A sophisticated twin-pyramid (Octahedron)
    const coreGeom = new THREE.OctahedronGeometry(6, 0);
    const signalCore = new THREE.Mesh(coreGeom, coreMat);
    engineGroup.add(signalCore);

    // Outer framing casing for the engine
    const casingMat = new THREE.MeshStandardMaterial({
        color: 0x010204, metalness: 1.0, roughness: 0.2, wireframe: true
    });
    const signalCasing = new THREE.Mesh(new THREE.OctahedronGeometry(8, 0), casingMat);
    engineGroup.add(signalCasing);


    // --- 2. DATA INFRASTRUCTURE (Abstract Grid) ---
    // Instead of hundreds of buildings, we use distinct, massive structural glass monoliths
    const monolithGeom = new THREE.BoxGeometry(1, 1, 1);
    
    // High-end glass material for architecture
    const monolithMat = new THREE.MeshPhysicalMaterial({
        color: 0x05070a,
        metalness: 0.7,
        roughness: 0.1,
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.85
    });

    const monolithCount = 80; // Sparse and deliberate
    const monoliths = new THREE.InstancedMesh(monolithGeom, monolithMat, monolithCount);
    
    const dummy = new THREE.Object3D();
    const range = 250;
    
    for(let i=0; i < monolithCount; i++) {
        // Place along systematic axes rather than random scatter to imply severe engineered infrastructure
        let posX = (Math.random() - 0.5) * range;
        let posZ = (Math.random() - 0.5) * range;
        
        // Ensure core area is perfectly clear
        if (Math.abs(posX) < 25 && Math.abs(posZ) < 25) {
            posX += 30 * Math.sign(posX);
            posZ += 30 * Math.sign(posZ);
        }

        // Tall, ultra-sleek vertical forms (Datacenters/Authority)
        const height = 40 + Math.random() * 80;
        const thickness = 2 + Math.random() * 3;
        const width = 4 + Math.random() * 8;

        dummy.position.set(posX, height/2 - 20, posZ);
        // Align them strictly along axes for architectural formality
        if (Math.random() > 0.5) {
            dummy.scale.set(width, height, thickness);
        } else {
            dummy.scale.set(thickness, height, width);
        }
        
        dummy.updateMatrix();
        monoliths.setMatrixAt(i, dummy.matrix);
    }
    world.add(monoliths);


    // --- 3. DYNAMIC STRATEGIC NODES (KPI Expansion) ---
    const nodes = [];
    const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x020406,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.05, // Quiet state
        metalness: 1.0,
        roughness: 0.4
    });

    // 3 prominent massive flat data-slabs mapping to "Results" section
    const nodePositions = [ {x: 30, z: -30}, {x: 45, z: -40}, {x: 20, z: -55} ];
    
    nodePositions.forEach(pos => {
        const h = 50 + Math.random() * 20;
        const b = new THREE.Mesh(monolithGeom, nodeMat.clone());
        b.position.set(pos.x, -10, pos.z);
        b.scale.set(8, 0.1, 4); // Flattened initially
        b.userData = { targetHeight: h };
        world.add(b);
        nodes.push(b);
    });


    // --- 4. DATA PATHWAYS (Signal Routing) ---
    // Extremely subtle, organic curves rather than busy traffic 
    const pathsGroup = new THREE.Group();
    world.add(pathsGroup);

    function createSignalLine(pts, colorHex) {
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.2, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({ 
            color: colorHex, 
            transparent: true, 
            opacity: 0.6,
            blending: THREE.AdditiveBlending 
        });
        return new THREE.Mesh(tubeGeo, tubeMat);
    }

    // Elegant curving traces from origin to deep space
    pathsGroup.add(createSignalLine([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-15, -5, -20),
        new THREE.Vector3(10, 5, -50),
        new THREE.Vector3(-20, -10, -100)
    ], 0x00f0ff));

    pathsGroup.add(createSignalLine([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(20, 10, -10),
        new THREE.Vector3(40, -5, -40),
        new THREE.Vector3(60, 15, -80)
    ], 0x0066ff));


    // --- 5. ELEGANT CAMERA CHOREOGRAPHY ---
    // Replaced jarring cinematic sweeps with authoritative, calm glides
    setTimeout(() => {
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#main-content',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5
            }
        });

        // 1. SERVICES (Zoning Focus): Subtle lateral drift through the columns
        masterTl.to(camera.position, { x: 25, y: 15, z: 15, ease: "sine.inOut" }, 0)
                .to(cameraTarget, { x: 10, y: 5, z: -20, ease: "sine.inOut" }, 0);
        
        // 2. RESULTS (Growth Expansion): Pan toward Strategic Nodes as they execute growth
        masterTl.to(camera.position, { x: 10, y: 20, z: -10, ease: "sine.inOut" }, 1)
                .to(cameraTarget, { x: 30, y: 20, z: -40, ease: "sine.inOut" }, 1);
        
        nodes.forEach(node => {
            // Elegant vertical unfold mapping directly to results copy
            masterTl.to(node.scale, { y: node.userData.targetHeight, ease: "power2.out" }, 1.1);
            masterTl.to(node.position, { y: (node.userData.targetHeight / 2) - 10, ease: "power2.out" }, 1.1);
            masterTl.to(node.material, { emissiveIntensity: 0.6 }, 1.1);
        });

        // 3. PROCESS (Data Path Tracing): Glide closely alongside the primary signal line
        masterTl.to(camera.position, { x: -10, y: 15, z: -40, ease: "sine.inOut" }, 2)
                .to(cameraTarget, { x: -20, y: -5, z: -80, ease: "sine.inOut" }, 2);

        // 4. ABOUT (Strategic Perspective): Calmly elevate to a high focal angle. Authoritative, not chaotic.
        masterTl.to(camera.position, { x: 0, y: 70, z: -40, ease: "power2.inOut" }, 3)
                .to(cameraTarget, { x: 0, y: 10, z: -60, ease: "power2.inOut" }, 3);
        
        // 5. CTA (Executive Node Entry): Center squarely into a pristine space
        masterTl.to(camera.position, { x: 0, y: 25, z: -80, ease: "power2.inOut" }, 4)
                .to(cameraTarget, { x: 0, y: 25, z: -120, ease: "power2.inOut" }, 4);
                
    }, 500);

    // Subtle sophisticated mouse drift
    let mouseX = 0; let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.015; // heavily dampened
        mouseY = (event.clientY - windowHalfY) * 0.015;
    });

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const tick = () => {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // 1. Engine Core Animation (Elegant rotation & breathing)
        signalCore.rotation.y += 0.2 * delta;
        signalCore.rotation.z += 0.1 * delta;
        
        const coreBr = 1 + Math.sin(time * 1.5) * 0.05;
        signalCore.scale.set(coreBr, coreBr, coreBr);
        
        signalCasing.rotation.y -= 0.1 * delta;
        signalCasing.rotation.x -= 0.1 * delta;

        // 2. Camera targeting with elegant smoothing
        const finalTarget = new THREE.Vector3().copy(cameraTarget);
        finalTarget.x += mouseX;
        finalTarget.y -= mouseY;
        
        camera.lookAt(finalTarget);

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
