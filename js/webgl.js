// webgl.js - The Marketing City of Momentum

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.003); // Deep night atmosphere

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 3000);
    // Initial camera position (Hero: Signal Birth)
    camera.position.set(0, 10, 80);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const cameraTarget = new THREE.Vector3(0, 0, 0); // Focus on Signal Engine

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x050c18, 1);
    scene.add(ambientLight);

    // Cyan grid edge highlights
    const dirLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    dirLight.position.set(100, 80, 100);
    scene.add(dirLight);

    // Warm deep blue counter light
    const accentLight = new THREE.DirectionalLight(0x0040ff, 2);
    accentLight.position.set(-100, 40, -100);
    scene.add(accentLight);

    const world = new THREE.Group();
    scene.add(world);

    // --- 1. SIGNAL ENGINE (Core Activation) ---
    const engineGroup = new THREE.Group();
    world.add(engineGroup);

    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, 
        emissive: 0x00f0ff, 
        emissiveIntensity: 1,
        wireframe: true 
    });
    const coreGeom = new THREE.IcosahedronGeometry(12, 3);
    const signalCore = new THREE.Mesh(coreGeom, coreMat);
    engineGroup.add(signalCore);

    const rings = [];
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x00d0ff, emissiveIntensity: 0.5 });
    for(let i=0; i<4; i++) {
        const ringGeom = new THREE.TorusGeometry(20 + (i * 8), 0.4, 16, 100);
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        engineGroup.add(ring);
        rings.push({ mesh: ring, speedX: (Math.random()-0.5)*0.015, speedY: (Math.random()-0.5)*0.015 });
    }

    // --- 2. THE CITY GRID (Marketing Districts) ---
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const districtMat = new THREE.MeshStandardMaterial({ 
        color: 0x050608,
        roughness: 0.3,
        metalness: 0.8
    });

    // Helper to generate district clusters
    function createDistrict(count, radius, centerX, centerZ, heightMultiplier, densityMultiplier) {
        const instancedMesh = new THREE.InstancedMesh(buildingGeo, districtMat, count);
        const dummy = new THREE.Object3D();
        
        let index = 0;
        for(let i = 0; i < count; i++) {
            // Polar coordinates for circular clamping
            const r = Math.sqrt(Math.random()) * radius;
            const theta = Math.random() * 2 * Math.PI;
            
            // Faux Grid snapping based on density
            const posX = centerX + Math.round((r * Math.cos(theta)) / densityMultiplier) * densityMultiplier;
            const posZ = centerZ + Math.round((r * Math.sin(theta)) / densityMultiplier) * densityMultiplier;
            
            // Skip inner core collision area
            if (Math.abs(posX) < 40 && Math.abs(posZ) < 40) continue;

            const height = (Math.random() * 15 + 5) * heightMultiplier;
            
            dummy.position.set(posX, height/2 - 15, posZ);
            dummy.scale.set(densityMultiplier * 0.8, height, densityMultiplier * 0.8);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(index, dummy.matrix);
            index++;
        }
        instancedMesh.count = index; // shrink to actual placed count
        world.add(instancedMesh);
    }

    // - Awareness District (Mid-rises, dense)
    createDistrict(400, 150, -80, -80, 1.5, 8);
    // - Intelligence District (Wide observational bases)
    createDistrict(200, 150, 80, -80, 0.8, 15);
    // - Acquisition District (Heavy grid traffic network)
    createDistrict(500, 150, -80, 80, 1.2, 10);
    // - Intent District (SEO Towers - Very tall, sparse)
    createDistrict(150, 150, 80, 80, 3.5, 12);
    // - General background skyline sprawl
    createDistrict(1200, 400, 0, 0, 1.0, 12);


    // --- 3. KPI TOWERS (Dynamic Results Growth) ---
    const kpiTowers = [];
    const kpiMat = new THREE.MeshStandardMaterial({
        color: 0x050608,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.1, // Idle state
        roughness: 0.1,
        metalness: 0.9
    });
    
    // Create 4 distinct massive towers for the Results section
    const kpiPositions = [
        {x: 60, z: 90}, {x: 80, z: 70}, {x: 100, z: 100}, {x: 70, z: 120}
    ];

    kpiPositions.forEach(pos => {
        const h = 80 + Math.random() * 40;
        const b = new THREE.Mesh(buildingGeo, kpiMat.clone());
        b.position.set(pos.x, -15, pos.z);
        b.scale.set(10, 0.1, 10); // Start flat! They grow via GSAP
        // Save target height for GSAP
        b.userData = { targetHeight: h };
        world.add(b);
        kpiTowers.push(b);
    });

    // --- 4. CAMPAIGN ROUTE & CONVERSION HUB ---
    // The Conversion Hub (Executive Terminals) at the end of the route
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, -10, 250);
    world.add(hubGroup);

    const hubRingGeo = new THREE.RingGeometry(25, 30, 64);
    const hubRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const hubRing = new THREE.Mesh(hubRingGeo, hubRingMat);
    hubRing.rotation.x = -Math.PI / 2;
    hubGroup.add(hubRing);

    // The Route Spline connecting Engine -> Districts -> Hub
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),        // Engine
        new THREE.Vector3(-40, -5, 40),    // Acquisition
        new THREE.Vector3(40, -5, 80),     // Intent
        new THREE.Vector3(-20, -5, 150),   // Route segment
        new THREE.Vector3(0, -5, 250)      // Conversion Hub
    ]);

    const routeGeo = new THREE.TubeGeometry(curve, 100, 1, 8, false);
    const routeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.15 });
    const routeMesh = new THREE.Mesh(routeGeo, routeMat);
    world.add(routeMesh);

    // Pointers traveling the route
    const trafficPoints = new THREE.Group();
    world.add(trafficPoints);
    for(let i=0; i<5; i++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}));
        m.userData = { progress: i * 0.2, speed: 0.002 };
        trafficPoints.add(m);
    }

    // --- 5. CAMERA FLIGHT CHOREOGRAPHY (GSAP) ---
    setTimeout(() => {
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#main-content',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5
            }
        });

        // 1. SERVICES: Lateral glide over the districts, revealing the sprawl
        masterTl.to(camera.position, { x: 50, y: 35, z: -20, ease: "power1.inOut" }, 0)
                .to(cameraTarget, { x: 40, y: 0, z: 40, ease: "power1.inOut" }, 0);
        
        // 2. RESULTS: Push dramatic tracking towards the Intent District KPI Towers
        masterTl.to(camera.position, { x: 30, y: 20, z: 40, ease: "power2.inOut" }, 1)
                .to(cameraTarget, { x: 80, y: 40, z: 90, ease: "power2.inOut" }, 1);
        
        // As the camera looks at the towers, animate them growing (Visual City Growth!)
        kpiTowers.forEach(tower => {
            masterTl.to(tower.scale, { y: tower.userData.targetHeight, ease: "power3.out" }, 1.2);
            masterTl.to(tower.position, { y: (tower.userData.targetHeight / 2) - 15, ease: "power3.out" }, 1.2);
            masterTl.to(tower.material, { emissiveIntensity: 0.8 }, 1.2);
        });

        // 3. PROCESS: Track backward along the campaign route looking down
        masterTl.to(camera.position, { x: -30, y: 50, z: 120, ease: "power1.inOut" }, 2)
                .to(cameraTarget, { x: 0, y: -10, z: 180, ease: "power1.inOut" }, 2);

        // 4. FOUNDER/ABOUT: Strategic Command Deck. Shoot violently up for isometric view
        masterTl.to(camera.position, { x: 0, y: 280, z: 20, ease: "power3.inOut" }, 3)
                .to(cameraTarget, { x: 0, y: 0, z: 0, ease: "power3.inOut" }, 3);
        
        // 5. CTA: Dive rapidly straight down into the localized Conversion Hub ring
        masterTl.to(camera.position, { x: 0, y: 15, z: 280, ease: "power3.inOut" }, 4)
                .to(cameraTarget, { x: 0, y: -10, z: 250, ease: "power3.inOut" }, 4);
                
    }, 500);

    // Subtle drift layer (Mouse tracking without ruining the flight path)
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.03;
        mouseY = (event.clientY - windowHalfY) * 0.03;
    });

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const tick = () => {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Engine pulsing and rotation (Signal Birth)
        signalCore.rotation.y += 0.4 * delta;
        signalCore.rotation.x += 0.2 * delta;
        const pulse = 1 + Math.sin(time * 2) * 0.08;
        signalCore.scale.set(pulse, pulse, pulse);

        rings.forEach(ring => {
            ring.mesh.rotation.x += ring.speedX;
            ring.mesh.rotation.y += ring.speedY;
        });

        // Traffic animating down the Campaign Route
        trafficPoints.children.forEach(pt => {
            pt.userData.progress += pt.userData.speed;
            if(pt.userData.progress > 1) pt.userData.progress = 0;
            const pX = curve.getPointAt(pt.userData.progress);
            pt.position.copy(pX);
        });

        // Hub Ring gentle spin
        hubRing.rotation.z += 0.01;

        // Compose Camera target mapping + subtle mouse hover
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
