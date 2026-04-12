// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

// Get scroll value
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Hero Animations
    const tl = gsap.timeline();
    tl.fromTo('.stagger-elem', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.5 }
    );

    // Parallax Hero
    gsap.to('.hero-content', {
        yPercent: 30,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: {
            trigger: ".parallax-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // --- Glass Panels staggered reveal
    const panels = gsap.utils.toArray('.gl-panel:not(.modal-content):not(.cta-box)');
    panels.forEach((panel) => {
        gsap.fromTo(panel, 
            { y: 80, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1, ease: "power2.out",
                scrollTrigger: {
                    trigger: panel,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // --- Process Timeline animation
    ScrollTrigger.create({
        trigger: ".timeline",
        start: "top center",
        end: "bottom center",
        onUpdate: self => {
            gsap.set(".timeline-progress", { scaleY: self.progress });
        }
    });

    // --- Counters animation
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        ScrollTrigger.create({
            trigger: counter,
            start: "top 90%",
            once: true,
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2.5,
                    snap: { innerHTML: 1 },
                    ease: "power2.out",
                    onUpdate: function() {
                        counter.innerHTML = Math.round(this.targets()[0].innerHTML) + '+';
                    }
                });
            }
        });
    });

    // --- Congratulations Toast interactions
    const congratsToast = document.getElementById('congrats-toast');
    const closeToast = document.querySelector('.close-toast');
    const clientAccessTrigger = document.getElementById('client-access-trigger');

    function showCongratsToast() {
        if(congratsToast) congratsToast.classList.add('show-toast');
    }

    function hideCongratsToast() {
        if(congratsToast) congratsToast.classList.remove('show-toast');
    }

    if(closeToast) {
        closeToast.addEventListener('click', hideCongratsToast);
    }
    
    if(clientAccessTrigger) {
        clientAccessTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            showCongratsToast();
        });
    }

    // Auto-trigger toast if ?deal=true in URL
    if (window.location.search.includes('deal=true')) {
        setTimeout(showCongratsToast, 1000);
    }

    // --- Modal interactions
    const modal = document.getElementById('onboarding-modal');
    const congratsBtn = document.getElementById('congrats-btn');
    const closeBtns = document.querySelectorAll('.close-modal');

    function openModal() {
        hideCongratsToast();
        modal.classList.add('active');
        lenis.stop(); // Stop scroll when modal open
    }

    function closeModal() {
        modal.classList.remove('active');
        lenis.start(); // Resume scroll
    }

    if (congratsBtn) {
        congratsBtn.addEventListener('click', openModal);
    }
    
    closeBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    }));

    // NavBar blur update based on scroll
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            nav.style.padding = "1rem 5vw";
            nav.style.background = "rgba(0,0,0,0.8)";
        } else {
            nav.style.padding = "1.5rem 5vw";
            nav.style.background = "rgba(3, 3, 3, 0.5)";
        }
    });
});
