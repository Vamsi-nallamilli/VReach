// webgl.js - Premium Digital Growth Infrastructure
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020306, 0.0035);

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 10, 50);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const cameraTarget = new THREE.Vector3(0, 0, 0);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x060912, 1.5);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 2.5);
    rimLight.position.set(40, 60, 20);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x0a153a, 3.0);
    fillLight.position.set(-60, 20, -50);
    scene.add(fillLight);

    const world = new THREE.Group();
    scene.add(world);

    // --- 1. SIGNAL ENGINE (Refined Core) ---
    const engineGroup = new THREE.Group();
    world.add(engineGroup);

    const coreMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x050a12, emissive: 0x00d0ff, emissiveIntensity: 0.8,
        metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.95
    });
    
    const coreGeom = new THREE.OctahedronGeometry(6, 0);
    const signalCore = new THREE.Mesh(coreGeom, coreMat);
    engineGroup.add(signalCore);

    const casingMat = new THREE.MeshStandardMaterial({
        color: 0x010204, metalness: 1.0, roughness: 0.3, wireframe: true
    });
    const signalCasing = new THREE.Mesh(new THREE.OctahedronGeometry(8.5, 0), casingMat);
    engineGroup.add(signalCasing);

    // --- 2. DATA INFRASTRUCTURE (Monoliths) ---
    const monolithGeom = new THREE.BoxGeometry(1, 1, 1);
    const monolithMat = new THREE.MeshPhysicalMaterial({
        color: 0x05070a, metalness: 0.7, roughness: 0.1,
        clearcoat: 1.0, clearcoatRoughness: 0.1, transparent: true, opacity: 0.85
    });

    const monolithCount = 70;
    const monoliths = new THREE.InstancedMesh(monolithGeom, monolithMat, monolithCount);
    const dummy = new THREE.Object3D();
    const range = 250;
    
    for(let i=0; i < monolithCount; i++) {
        let posX = (Math.random() - 0.5) * range;
        let posZ = (Math.random() - 0.5) * range;
        
        if (Math.abs(posX) < 30 && Math.abs(posZ) < 30) {
            posX += 35 * Math.sign(posX); posZ += 35 * Math.sign(posZ);
        }

        const height = 40 + Math.random() * 80;
        const thickness = 2 + Math.random() * 3;
        const width = 4 + Math.random() * 8;

        dummy.position.set(posX, height/2 - 20, posZ);
        if (Math.random() > 0.5) dummy.scale.set(width, height, thickness);
        else dummy.scale.set(thickness, height, width);
        
        dummy.updateMatrix();
        monoliths.setMatrixAt(i, dummy.matrix);
    }
    world.add(monoliths);


    // --- 3. DYNAMIC STRATEGIC NODES (Results Section) ---
    const nodes = [];
    const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x020406, emissive: 0x00f0ff, emissiveIntensity: 0.05,
        metalness: 1.0, roughness: 0.4
    });

    const nodePositions = [ {x: 25, z: -25}, {x: 45, z: -35}, {x: 15, z: -55} ];
    nodePositions.forEach(pos => {
        const b = new THREE.Mesh(monolithGeom, nodeMat.clone());
        b.position.set(pos.x, -10, pos.z);
        b.scale.set(8, 0.1, 4);
        b.userData = { targetHeight: 50 + Math.random() * 20 };
        world.add(b);
        nodes.push(b);
    });

    // --- 3B. NARRATIVE HOLOGRAPHIC SCREENS (Motion Video) ---
    // Create the massive floating glass cinema screens for storytelling
    const screenGeo = new THREE.PlaneGeometry(50, 28); // Massively increased scale for better readability
    
    function createVideoHologram(videoPath, imageFallback, pos, rotY) {
        // First load the generated 2D fallback images so there's always an immediate visual layout
        const texLoader = new THREE.TextureLoader();
        const fallbackTex = texLoader.load(imageFallback);
        fallbackTex.encoding = THREE.sRGBEncoding;
        
        // Emissive material starting with the static fallback image
        const mat = new THREE.MeshPhysicalMaterial({
            map: fallbackTex,
            emissiveMap: fallbackTex,
            emissive: 0xffffff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.85,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            metalness: 0.9,
            roughness: 0.2,
            depthWrite: false, // Fix WebGL sorting and transparent gliching
            side: THREE.FrontSide
        });

        // Create an invisible HTML5 Video element targeting the video path
        const video = document.createElement('video');
        video.src = videoPath;
        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        video.loop = true;
        video.muted = true; 
        
        // If the video actually loads and plays successfully, smoothly swap the texture!
        video.addEventListener('playing', () => {
            const videoTex = new THREE.VideoTexture(video);
            videoTex.encoding = THREE.sRGBEncoding;
            mat.map = videoTex;
            mat.emissiveMap = videoTex;
            mat.needsUpdate = true;
        });

        // Attempt to play, handle browser autoplay/404 policies gracefully
        video.play().catch((e) => console.warn(`Waiting for interaction or valid file for ${videoPath}`));

        const screen = new THREE.Mesh(screenGeo, mat);
        screen.position.copy(pos);
        screen.rotation.y = rotY;
        
        // Add a subtle structural frame around the hologram
        const frameGeo = new THREE.EdgesGeometry(screenGeo);
        const frameMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 });
        const frame = new THREE.LineSegments(frameGeo, frameMat);
        screen.add(frame);
        
        world.add(screen);
        return screen;
    }

    // To fix all framing issues, all 3 acts are now perfectly aligned on the center Z-axis, pointing directly at the user.
    // Dimensions heavily calibrated for perfect cinematic fit. Image disruption fixed via depthWrite: false.
    const act1 = createVideoHologram('act1.mp4', 'act1.png', new THREE.Vector3(0, 15, -40), 0);
    const act2 = createVideoHologram('act2.mp4', 'act2.png', new THREE.Vector3(0, 15, -100), 0);
    const act3 = createVideoHologram('act3.mp4', 'act3.png', new THREE.Vector3(0, 15, -160), 0);

    // Initial opacity states to prevent overlapping clutter immediately
    act2.material.opacity = 0;
    act2.material.emissiveIntensity = 0;
    act2.children[0].material.opacity = 0; // The glowing frame

    act3.material.opacity = 0;
    act3.material.emissiveIntensity = 0;
    act3.children[0].material.opacity = 0;

    // --- 3C. SUCCESS PARTICLES (Dormant) ---

    const particleCount = 2000;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVel = [];

    // Initialize resting at the base of the core engine
    for(let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 15;
        pPos[i*3] = Math.cos(angle) * radius;     // x
        pPos[i*3+1] = -10 - Math.random() * 5;    // y (hidden below floor)
        pPos[i*3+2] = Math.sin(angle) * radius;   // z
        
        pVel.push({
            y: 0.5 + Math.random() * 1.5,
            x: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        });
    }

    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    
    // Premium glowing material
    const pMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.6,
        transparent: true,
        opacity: 0, // completely invisible until triggered
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const successParticles = new THREE.Points(pGeom, pMat);
    world.add(successParticles);
    
    let isSuccessTriggered = false;
    
    // Expose a global trigger function for the onboarding UI to call
    window.triggerSuccessParticles = function() {
        if(isSuccessTriggered) return;
        isSuccessTriggered = true;
        
        // Sweep the opacity up
        gsap.to(pMat, { opacity: 0.8, duration: 1, ease: "power2.inOut" });
        
        // Massive upward surge of the core lights too
        gsap.to(coreMat, { emissiveIntensity: 3.0, duration: 1.5, yoyo: true, repeat: 1 });
        gsap.to(ambientLight, { intensity: 3.0, duration: 2, ease: "power3.out" });
    };


    // --- 4. THE SIGNATURE 3D MOTION ARCH ---
    
    // Create the sweeping orbital curve that funnels into the core
    const archCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(100, 40, -180),   // High and deep right
        new THREE.Vector3(40, 20, -100),    // Sweeping in
        new THREE.Vector3(-30, 5, -40),     // Banking left around the core
        new THREE.Vector3(-15, 0, -10),     // Tightening orbit
        new THREE.Vector3(0, 0, 0)          // Striking the core
    ]);

    // Visually draw the Arch Guide (Elegant glowing rail)
    const archGeo = new THREE.TubeGeometry(archCurve, 150, 0.1, 6, false);
    const archMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const archMesh = new THREE.Mesh(archGeo, archMat);
    world.add(archMesh);

    // Secondary auxiliary rail for dimensional structure
    const archCurve2 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-120, 60, -150),   
        new THREE.Vector3(-60, 30, -80),     
        new THREE.Vector3(20, 10, -30),     
        new THREE.Vector3(10, 0, -10),      
        new THREE.Vector3(0, 0, 0)         
    ]);
    const archMesh2 = new THREE.Mesh(new THREE.TubeGeometry(archCurve2, 100, 0.05, 5, false), archMat);
    world.add(archMesh2);

    // Advanced Texture Generator for Premium Monochrome Glass Chips
    function createPremiumIcon(label, type) {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        
        ctx.clearRect(0, 0, 256, 256);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(0, 240, 255, 1)';
        ctx.shadowBlur = 15;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 110px Inter, sans-serif';

        if(type === 'txt') {
            ctx.fillText(label, 128, 128);
        } else if (type === 'yt') {
            // Drawn play button
            ctx.beginPath(); ctx.moveTo(90, 80); ctx.lineTo(180, 128); ctx.lineTo(90, 176); ctx.closePath(); ctx.fill();
        } else if (type === 'seo') {
            // Magnifier
            ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath(); ctx.arc(110, 110, 45, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(140, 140); ctx.lineTo(190, 190); ctx.stroke();
        } else if (type === 'ads') {
            // Target
            ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath(); ctx.arc(128, 128, 40, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(128, 128, 10, 0, Math.PI * 2); ctx.fill();
        }

        // Sublabel
        ctx.shadowBlur = 0;
        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.letterSpacing = '2px';
        ctx.fillText(label.toUpperCase(), 128, 220);

        return new THREE.CanvasTexture(c);
    }

    const channels = [
        { name: "Google", render: "G", type: 'txt', curve: archCurve },
        { name: "Meta", render: "∞", type: 'txt', curve: archCurve2 },
        { name: "Video", render: "", type: 'yt', curve: archCurve },
        { name: "Facebook", render: "f", type: 'txt', curve: archCurve2 },
        { name: "Search", render: "", type: 'seo', curve: archCurve },
        { name: "Instagram", render: "ig", type: 'txt', curve: archCurve2 },
        { name: "Ads", render: "", type: 'ads', curve: archCurve },
        { name: "Content", render: "C", type: 'txt', curve: archCurve2 },
        { name: "Analytics", render: "DATA", type: 'txt', curve: archCurve },
        { name: "Strategy", render: "★", type: 'txt', curve: archCurve2 }
    ];

    const chipGeo = new THREE.PlaneGeometry(6, 6);
    const chips = [];

    channels.forEach((channel, i) => {
        const mat = new THREE.MeshPhysicalMaterial({
            map: createPremiumIcon(channel.render || channel.name, channel.type),
            transparent: true,
            opacity: 0.9,
            roughness: 0.1,
            metalness: 0.8,
            clearcoat: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const chip = new THREE.Mesh(chipGeo, mat);
        
        // Distribution of tracking logic
        chip.userData = {
            curve: channel.curve,
            progress: i * 0.1,       // Staggered entry
            speed: 0.0015,          // Slow, deliberate authoritative speed
            spinOffset: Math.random() * Math.PI
        };

        world.add(chip);
        chips.push(chip);
    });

    // --- 5. EMOTIONAL NARRATIVE CHOREOGRAPHY (5-Stage Journey) ---
    // Make sure we have proper references for GSAP
    const fogColor = scene.fog.color;
    
    setTimeout(() => {
        // Stage 1: Arrival (Hero)
        camera.position.set(0, 15, 20);
        cameraTarget.copy(act1.position);
        scene.fog.density = 0.007;
        fogColor.setHex(0x010203);

        // Stage 2: Activation (Services)
        ScrollTrigger.create({
            trigger: '#services',
            start: 'top bottom',
            end: 'bottom center',
            scrub: 1.5,
            animation: gsap.timeline()
                // Move straight forward towards Act 2
                .to(camera.position, { x: 0, y: 15, z: -40, ease: "sine.inOut" })
                .to(cameraTarget, { x: 0, y: 15, z: -100, ease: "sine.inOut" }, "<")
                
                // Cinematic Dissolve completely prevents visual overlap
                .to(act1.material, { opacity: 0, emissiveIntensity: 0, ease: "power2.inOut" }, "<")
                .to(act1.children[0].material, { opacity: 0 }, "<")
                
                .to(act2.material, { opacity: 0.85, emissiveIntensity: 0.8, ease: "power2.inOut" }, "<")
                .to(act2.children[0].material, { opacity: 0.5 }, "<")
                
                .to(rimLight, { intensity: 4.5, ease: "power1.in" }, "<")
                .to(coreMat, { emissiveIntensity: 1.5 }, "<")
        });

        // Stage 3: Coordination (Process)
        ScrollTrigger.create({
            trigger: '#process',
            start: 'top bottom',
            end: 'bottom center',
            scrub: 1.5,
            animation: gsap.timeline()
                .to(camera.position, { x: 0, y: 10, z: -60, ease: "sine.inOut" })
                .to(cameraTarget, { x: 0, y: 15, z: -100, ease: "sine.inOut" }, "<")
                .to(archMat, { opacity: 0.9, color: 0x00ffff, ease: "power1.in" }, "<") 
        });

        // Stage 4: Growth (Results)
        const growTl = gsap.timeline();
        growTl.to(camera.position, { x: 0, y: 30, z: -80, ease: "power2.inOut" })
              .to(cameraTarget, { x: 0, y: 15, z: -160, ease: "power2.inOut" }, "<")
              
              // Fade out Act 2
              .to(act2.material, { opacity: 0, emissiveIntensity: 0, ease: "power2.inOut" }, "<")
              .to(act2.children[0].material, { opacity: 0 }, "<")
              
              .to(scene.fog, { density: 0.0015, ease: "power2.out" }, "<")
              .to(fogColor, { r: 0.0, g: 0.05, b: 0.15, ease: "power1.in" }, "<");
        
        nodes.forEach(node => {
            growTl.to(node.scale, { y: node.userData.targetHeight * 2, ease: "power3.out" }, "<0.2")
                  .to(node.position, { y: node.userData.targetHeight - 5, ease: "power3.out" }, "<")
                  .to(node.material, { emissiveIntensity: 0.8 }, "<");
        });

        ScrollTrigger.create({
            trigger: '#results',
            start: 'top bottom',
            end: 'bottom center',
            scrub: 1.5,
            animation: growTl
        });

        // Stage 5: Celebration (Contact/Onboarding)
        ScrollTrigger.create({
            trigger: '#contact',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1.5,
            animation: gsap.timeline()
                // Plunge forward exactly onto Act 3
                .to(camera.position, { x: 0, y: 15, z: -100, ease: "power2.inOut" })
                .to(cameraTarget, { x: 0, y: 15, z: -160, ease: "power2.inOut" }, "<")
                
                // Final Reveal
                .to(act3.material, { opacity: 0.95, emissiveIntensity: 1.5, ease: "power2.inOut" }, "<")
                .to(act3.children[0].material, { opacity: 0.5 }, "<")
                
                .to(fogColor, { r: 0.0, g: 0.25, b: 0.35, ease: "power1.in" }, "<")
                .to(ambientLight, { intensity: 3.5 }, "<")
        });

    }, 800);

    let mouseX = 0; let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.015;
        mouseY = (event.clientY - windowHalfY) * 0.015;
    });

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const tick = () => {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // 1. Engine Core Animation
        signalCore.rotation.y += 0.2 * delta;
        signalCore.rotation.z += 0.1 * delta;
        
        const coreBr = 1 + Math.sin(time * 1.5) * 0.05;
        signalCore.scale.set(coreBr, coreBr, coreBr);
        
        signalCasing.rotation.y -= 0.1 * delta;
        signalCasing.rotation.x -= 0.1 * delta;

        // 2. Animate the Motion Arch Chips
        chips.forEach(chip => {
            // Advance along curve
            chip.userData.progress += chip.userData.speed;
            if(chip.userData.progress >= 1) {
                // Instantly teleport back to start of arch perfectly
                chip.userData.progress = 0;
            }

            const pt = chip.userData.curve.getPointAt(chip.userData.progress);
            chip.position.copy(pt);

            // Make the icon face the camera slightly but retain orbit tilt
            chip.lookAt(camera.position);

            // Give them a slight gentle float relative to the track
            chip.position.y += Math.sin(time * 2 + chip.userData.spinOffset) * 1.5;

            // Fade violently into the core (opacity pulse based on progress)
            // They fade IN at progress 0, stay opaque, fade OUT at 0.9 as they hit core
            if (chip.userData.progress < 0.1) {
                chip.material.opacity = (chip.userData.progress / 0.1) * 0.9;
            } else if (chip.userData.progress > 0.9) {
                chip.material.opacity = ((1.0 - chip.userData.progress) / 0.1) * 0.9;
            } else {
                chip.material.opacity = 0.9;
            }
        });

        // 2B. Hologram Hovering
        const holoHover = Math.sin(time) * 0.5;
        act1.position.y = 20 + holoHover;
        act2.position.y = 15 - holoHover;
        act3.position.y = 25 + holoHover;

        // 2C. Success Particle Animation Loop
        if(isSuccessTriggered) {
            const positions = successParticles.geometry.attributes.position.array;
            for(let i = 0; i < particleCount; i++) {
                positions[i*3] += pVel[i].x;      // dx
                positions[i*3+1] += pVel[i].y;    // dy (soars up)
                positions[i*3+2] += pVel[i].z;    // dz
                
                // If it goes too high out of frame, gracefully fade or reset to bottom
                if (positions[i*3+1] > 100) {
                     positions[i*3+1] = -10;
                }
            }
            successParticles.geometry.attributes.position.needsUpdate = true;
            
            // Spin the entire particle system like a galaxy
            successParticles.rotation.y += 0.02 * delta;
        }

        // 3. Camera Smoothing
        const finalTarget = new THREE.Vector3().copy(cameraTarget);
        finalTarget.x += mouseX;
        finalTarget.y -= mouseY;
        
        camera.lookAt(finalTarget);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }

    tick();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
