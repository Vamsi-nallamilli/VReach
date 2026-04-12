// webgl.js - Three.js setup for VReach background (Digital Marketing Icons)
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    // SCENE
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, 0.005); // Fade icons into the dark distance

    // CAMERA
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // GENERATE TEXTURES using Canvas
    function createIconTexture(type) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        
        ctx.clearRect(0, 0, 256, 256);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Premium glow effect
        ctx.shadowBlur = 20;
        
        if (type === 'meta') {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
            ctx.shadowColor = 'rgba(0, 240, 255, 1)';
            ctx.font = 'bold 130px sans-serif';
            ctx.fillText('∞', 128, 128);
        } else if (type === 'google') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowColor = 'rgba(255, 255, 255, 1)';
            ctx.font = 'bold 110px sans-serif';
            ctx.fillText('G', 128, 128);
        } else if (type === 'seo') {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
            ctx.shadowColor = 'rgba(0, 240, 255, 1)';
            // Draw a minimalist magnifying glass
            ctx.lineWidth = 14;
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(110, 110, 45, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(140, 140);
            ctx.lineTo(190, 190);
            ctx.stroke();
        } else if (type === 'heart') {
            ctx.fillStyle = 'rgba(255, 50, 100, 0.85)';
            ctx.shadowColor = 'rgba(255, 50, 100, 1)';
            ctx.font = 'bold 90px Arial, sans-serif';
            ctx.fillText('♥', 128, 135);
        } else if (type === 'hashtag') {
            ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
            ctx.shadowColor = 'rgba(150, 150, 150, 0.8)';
            ctx.font = 'bold 110px sans-serif';
            ctx.fillText('#', 128, 128);
        } else if (type === 'chart') {
            ctx.fillStyle = 'rgba(0, 255, 150, 0.85)';
            ctx.shadowColor = 'rgba(0, 255, 150, 1)';
            // Draw 3 bar charts
            ctx.fillRect(70, 160, 25, 40);
            ctx.fillRect(115, 110, 25, 90);
            ctx.fillRect(160, 50, 25, 150);
        }

        const texture = new THREE.CanvasTexture(c);
        return texture;
    }

    const types = ['meta', 'google', 'seo', 'heart', 'hashtag', 'chart'];
    const materials = types.map(type => {
        return new THREE.SpriteMaterial({
            map: createIconTexture(type),
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    });

    const sprites = [];
    const count = 65; // number of floating icons

    for (let i = 0; i < count; i++) {
        // Pick random material
        const mat = materials[Math.floor(Math.random() * materials.length)];
        const sprite = new THREE.Sprite(mat);
        
        // Random positions inside a large volume
        sprite.position.x = (Math.random() - 0.5) * 350;
        sprite.position.y = (Math.random() - 0.5) * 350;
        sprite.position.z = (Math.random() - 0.5) * 200 - 50;
        
        // Random scaling for depth variation
        const scale = Math.random() * 8 + 4;
        sprite.scale.set(scale, scale, 1);
        
        // Add custom float parameters so we can animate them
        sprite.userData = {
            floatSpeed: Math.random() * 0.05 + 0.01,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            zSpeed: (Math.random() - 0.5) * 0.05
        };

        scene.add(sprite);
        sprites.push(sprite);
    }

    // Connect some particles via faint lines (network concept intact but subtle)
    const pointsMaterial = new THREE.PointsMaterial({ size: 0.8, color: 0x00f0ff, transparent: true, opacity: 0.3 });
    const pointsGeometry = new THREE.BufferGeometry();
    const pPos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        pPos[i*3] = sprites[i].position.x;
        pPos[i*3+1] = sprites[i].position.y;
        pPos[i*3+2] = sprites[i].position.z;
    }
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointsMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    let scrollY = window.scrollY;
    document.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    const tick = () => {
        const time = clock.getElapsedTime();

        // Animate Sprites (float upwards and sway)
        sprites.forEach((sprite, i) => {
            sprite.position.y += sprite.userData.floatSpeed;
            sprite.position.x += Math.sin(time * sprite.userData.swaySpeed + sprite.userData.swayOffset) * 0.05;
            sprite.position.z += sprite.userData.zSpeed;

            // Update associated point for lines to track
            pPos[i*3] = sprite.position.x;
            pPos[i*3+1] = sprite.position.y;
            pPos[i*3+2] = sprite.position.z;

            // Reset position if it goes too high
            if (sprite.position.y > 180) {
                sprite.position.y = -180;
                sprite.position.x = (Math.random() - 0.5) * 350;
            }
        });
        
        pointsGeometry.attributes.position.needsUpdate = true;

        // Camera panning logic based on scroll and mouse
        const targetX = mouseX * 0.03;
        const targetY = mouseY * 0.03;
        
        // Scroll pushes camera down exactly as before
        camera.position.y = -scrollY * 0.03 + (targetY * -1);
        camera.position.x += (targetX - camera.position.x) * 0.05;
        
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
