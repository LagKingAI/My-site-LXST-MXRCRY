class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationFrameId = null;

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const count = window.innerWidth < 768 ? 60 : 100;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 200
            });
        }
    }

    addEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resize(), 250);
        });

        window.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            if (touch) {
                this.mouse.x = touch.clientX;
                this.mouse.y = touch.clientY;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        window.addEventListener('mousemove', (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    drawParticle(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
        );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(232, 232, 240, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(176, 184, 200, 0)');

        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    updateParticle(particle) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (this.mouse.x !== null && this.mouse.y !== null) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                particle.x += Math.cos(angle) * force * 2;
                particle.y += Math.sin(angle) * force * 2;
                particle.opacity = Math.min(1, particle.opacity + 0.02);
            } else {
                particle.opacity = Math.max(0.2, particle.opacity - 0.01);
            }
        }

        if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
    }

    connectParticles() {
        const maxDistance = window.innerWidth < 768 ? 100 : 120;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(176, 184, 200, ${0.1 * (1 - distance / maxDistance)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const particle of this.particles) {
            this.updateParticle(particle);
            this.drawParticle(particle);
        }

        this.connectParticles();
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

function initNavigation() {
    const nav = document.getElementById('navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileClose = document.querySelector('.mobile-nav-close');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const desktopLinks = document.querySelectorAll('.desktop-menu a');
    const body = document.body;

    if (!nav || !mobileBtn || !mobileOverlay || !mobileClose) return;

    function updateNav() {
        const scrollY = window.scrollY;

        if (scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        const sections = document.querySelectorAll('.section, .hero');
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                desktopLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });

                mobileLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    function openMobileMenu() {
        mobileBtn.setAttribute('aria-expanded', 'true');
        mobileOverlay.classList.add('active');
        body.classList.add('menu-open');
        document.documentElement.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileOverlay.classList.remove('active');
        body.classList.remove('menu-open');
        document.documentElement.style.overflow = '';
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateNav();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    mobileBtn.addEventListener('click', () => {
        const isOpen = mobileBtn.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileClose.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });

    mobileOverlay.addEventListener('click', (event) => {
        if (event.target === mobileOverlay) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileOverlay.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    updateNav();
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .section');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') {
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            const navElement = document.getElementById('navbar');
            const navHeight = navElement ? navElement.offsetHeight : 0;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

function initContactForm() {
    const form = document.querySelector('.contact-form');

    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach((input) => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'rgba(255, 100, 100, 0.5)';
            } else {
                input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        if (isValid) {
            alert('Спасибо! Ваше сообщение отправлено.');
            form.reset();
        }
    });
}

function initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px 0px', threshold: 0.01 });

    document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
    });
}

function initVideoLazyLoad() {
    if (!('IntersectionObserver' in window)) return;

    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                }
                observer.unobserve(iframe);
            }
        });
    }, { rootMargin: '100px 0px', threshold: 0.01 });

    document.querySelectorAll('.video-wrapper iframe[data-src]').forEach((iframe) => {
        videoObserver.observe(iframe);
    });
}

function initTouchOptimizations() {
    let lastTouchEnd = 0;

    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        new ParticleSystem('particles-canvas');
    }

    initNavigation();
    initScrollReveal();
    initSmoothScroll();
    initLazyLoading();
    initVideoLazyLoad();
    initContactForm();
    initTouchOptimizations();

    document.addEventListener('gesturestart', (event) => {
        event.preventDefault();
    }, { passive: false });

    console.log('🎵 LXST MXRCRY website loaded successfully');
    console.log('📱 Mobile-optimized and ready!');
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
    }
});
