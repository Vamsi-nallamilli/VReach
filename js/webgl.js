// webgl.js - 3D Digital City Narrative Engine
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020202, 0.0035); // City smog/depth

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
    // Initial camera position (Hero)
    camera.position.set(0, 15, 60);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // A target object for the camera to look at during the GSAP flight
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x0a1520, 1.5);
    scene.add(ambientLight);

    // Main highlight mapping out the city edges
    const dirLight = new THREE.DirectionalLight(0x00f0ff, 2);
    dirLight.position.set(100, 50, 100);
    scene.add(dirLight);

    const accentLight = new THREE.DirectionalLight(0xff0040, 1);
    accentLight.position.set(-100, 30, -50);
    scene.add(accentLight);

    // --- 1. SIGNAL ENGINE (Central Core) ---
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // The intelligence core
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, 
        emissive: 0x00f0ff, 
        emissiveIntensity: 0.8,
        wireframe: true 
    });
    const coreGeom = new THREE.IcosahedronGeometry(8, 2);
    const signalCore = new THREE.Mesh(coreGeom, coreMat);
    engineGroup.add(signalCore);

    // Surrounding orbital rings representing reach & channels
    const rings = [];
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x00ffff, emissiveIntensity: 0.3 });
    for(let i=0; i<3; i++) {
        const ringGeom = new THREE.TorusGeometry(15 + (i * 6), 0.3, 16, 100);
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        engineGroup.add(ring);
        rings.push({ mesh: ring, speedX: (Math.random()-0.5)*0.02, speedY: (Math.random()-0.5)*0.02 });
    }

    // --- 2. DIGITAL CITY GRID (Services / World) ---
    // InstancedMesh for extreme performance rendering 2000 buildings
    const citySize = 50;
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x050510,
        roughness: 0.2,
        metalness: 0.8
    });

    // Make the material react sharply to edge light
    const totalBuildings = citySize * citySize;
    const cityGrid = new THREE.InstancedMesh(buildingGeometry, buildingMaterial, totalBuildings);
    
    const dummy = new THREE.Object3D();
    const cityWidth = 600;
    let bIndex = 0;
    
    // Track high KPI towers to attach glowing antennas to them
    const kpiTowers = [];

    for(let x = 0; x < citySize; x++) {
        for(let z = 0; z < citySize; z++) {
            // Leave a hole in the center for the Signal Engine
            const posX = (x - citySize/2) * (cityWidth / citySize);
            const posZ = (z - citySize/2) * (cityWidth / citySize);
            
            if (Math.abs(posX) < 40 && Math.abs(posZ) < 40) {
                // Skip center grid spaces
                bIndex++;
                continue; 
            }

            // Height based on perlin-like noise, with pockets of high rises
            let height = Math.random() * 20 + 5;
            
            // Create "Districts" (clusters of tall buildings)
            if(Math.sin(posX * 0.05) * Math.cos(posZ * 0.05) > 0.6) {
                height += Math.random() * 60 + 30; // Tall KPI Towers
                if (Math.random() > 0.8) {
                    kpiTowers.push(new THREE.Vector3(posX, height, posZ));
                }
            }

            dummy.position.set(posX, height/2 - 10, posZ);
            dummy.scale.set(7, height, 7);
            dummy.updateMatrix();
            cityGrid.setMatrixAt(bIndex, dummy.matrix);
            bIndex++;
        }
    }
    scene.add(cityGrid);

    // --- 3. TRAFFIC & LIGHT ROUTES ---
    // Glowing points moving along streets
    const trafficGeo = new THREE.BufferGeometry();
    const tCount = 800;
    const tPos = new Float32Array(tCount * 3);
    const tSpeeds = new Float32Array(tCount);
    const tDirs = []; // 0=nx, 1=px, 2=nz, 3=pz
    
    for(let i=0; i < tCount; i++) {
        tPos[i*3] = (Math.random() - 0.5) * cityWidth; // X
        tPos[i*3+1] = -8; // Fixed slightly above ground
        tPos[i*3+2] = (Math.random() - 0.5) * cityWidth; // Z
        tSpeeds[i] = Math.random() * 0.5 + 0.2;
        tDirs.push(Math.floor(Math.random() * 4));
    }
    trafficGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
    const trafficMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 1.5, blending: THREE.AdditiveBlending, transparent: true });
    const trafficMesh = new THREE.Points(trafficGeo, trafficMat);
    scene.add(trafficMesh);

    // KPI Tower Antennas (Glowing reds/cyans on top of heights)
    const antennaGeo = new THREE.BufferGeometry();
    const aPos = new Float32Array(kpiTowers.length * 3);
    kpiTowers.forEach((pos, i) => {
        aPos[i*3] = pos.x;
        aPos[i*3+1] = pos.y - 10;
        aPos[i*3+2] = pos.z;
    });
    antennaGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
    const antennaMat = new THREE.PointsMaterial({ color: 0xff0040, size: 2.5, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 });
    const antennas = new THREE.Points(antennaGeo, antennaMat);
    scene.add(antennas);


    // --- 4. CAMERA FLIGHT CHOREOGRAPHY ---
    // Setup GSAP Timeline linked to the main document scroll
    // Delay creation slightly to ensure DOM dimensions are calculated
    setTimeout(() => {
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#main-content',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5
            }
        });

        // Current start: 
        // Camera (0, 15, 60), Target (0, 0, 0) -> Looking at Signal Engine
        
        // As we scroll through "Services", dive slightly down into the city grid
        masterTl.to(camera.position, { x: 40, y: 25, z: -40, ease: "power1.inOut" }, 0)
                .to(cameraTarget, { x: 30, y: 15, z: -80, ease: "power1.inOut" }, 0);
        
        // "Results" -> Fly up to observe the KPI Towers and illuminated grid
        masterTl.to(camera.position, { x: -60, y: 80, z: -100, ease: "power2.inOut" }, 1)
                .to(cameraTarget, { x: -20, y: 30, z: -150, ease: "power2.inOut" }, 1);

        // "Process" & "About" -> The Command Deck (pull high up to look directly down at the network)
        masterTl.to(camera.position, { x: 0, y: 250, z: -50, ease: "power2.inOut" }, 2)
                .to(cameraTarget, { x: 0, y: 0, z: -120, ease: "power2.inOut" }, 2);
        
        // "Contact" & "CTA" -> Final conversion hub, dropping deep into calm isolated area below engine
        masterTl.to(camera.position, { x: 0, y: -25, z: 40, ease: "power3.inOut" }, 3)
                .to(cameraTarget, { x: 0, y: 10, z: 0, ease: "power3.inOut" }, 3);
                
    }, 500);

    // Mouse Interaction (adds subtle drift over automated scroll path)
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.02; // dampening
        mouseY = (event.clientY - windowHalfY) * 0.02;
    });

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const tick = () => {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // 1. Animate Engine Core
        signalCore.rotation.y += 0.5 * delta;
        signalCore.rotation.x += 0.2 * delta;
        
        // Engine pulse scaling (Data activation)
        const pulse = 1 + Math.sin(time * 2) * 0.1;
        signalCore.scale.set(pulse, pulse, pulse);

        // Orbit rings
        rings.forEach(ring => {
            ring.mesh.rotation.x += ring.speedX;
            ring.mesh.rotation.y += ring.speedY;
        });

        // 2. Animate Traffic Grid (Light Routes)
        const positions = trafficGeo.attributes.position.array;
        for(let i=0; i<tCount; i++) {
            const dir = tDirs[i];
            const speed = tSpeeds[i];
            
            if (dir === 0) positions[i*3] -= speed;     // -X
            else if (dir === 1) positions[i*3] += speed; // +X
            else if (dir === 2) positions[i*3+2] -= speed; // -Z
            else if (dir === 3) positions[i*3+2] += speed; // +Z
            
            // Loop boundaries
            const bounds = cityWidth / 2;
            if(positions[i*3] > bounds) positions[i*3] = -bounds;
            if(positions[i*3] < -bounds) positions[i*3] = bounds;
            if(positions[i*3+2] > bounds) positions[i*3+2] = -bounds;
            if(positions[i*3+2] < -bounds) positions[i*3+2] = bounds;
            
            // Randomly turn corners occasionally
            if (Math.random() < 0.005) {
                tDirs[i] = Math.floor(Math.random() * 4);
                // Snapping to faux grid coordinates prevents pure diagonal scatter
                // Keeps them moving along "streets" roughly
                positions[i*3] = Math.round(positions[i*3]/10) * 10;
                positions[i*3+2] = Math.round(positions[i*3+2]/10) * 10;
            }
        }
        trafficGeo.attributes.position.needsUpdate = true;

        // 3. Antenna Blinking
        antennas.material.opacity = 0.5 + Math.sin(time * 5) * 0.5;

        // 4. Update Camera View (Merging GSAP flight target + Mouse sway layer)
        const finalTarget = new THREE.Vector3().copy(cameraTarget);
        finalTarget.x += mouseX;
        finalTarget.y -= mouseY;
        camera.lookAt(finalTarget);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }

    tick();

    // RESIZE EVENT
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
