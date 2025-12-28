/**
 * Tesseract Trading - Interactive Features
 * High-Dimensional Execution
 */

document.addEventListener('DOMContentLoaded', function() {
    initGeometricBackground();
    initNavigation();
    initLanguageToggle();
    initSmoothScroll();
    initScrollAnimations();
    initDimensionCards();
});

/* ========================================
   Geometric Background Animation
   ======================================== */
function initGeometricBackground() {
    const canvas = document.getElementById('geometricBg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let nodes = [];
    let edges = [];
    let mouseX = 0;
    let mouseY = 0;

    // GridNode class - represents vertices of geometric shapes
    // Must be defined before initNodes() is called
    class GridNode {
        constructor(x, y, z) {
            this.baseX = x;
            this.baseY = y;
            this.z = z || 0;
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2 + 1;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 0.002 + 0.001;
            this.orbitRadius = Math.random() * 30 + 10;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.angle += this.speed;
            this.x = this.baseX + Math.cos(this.angle) * this.orbitRadius;
            this.y = this.baseY + Math.sin(this.angle) * this.orbitRadius;

            // Slight mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const force = (200 - dist) / 200;
                this.x -= dx * force * 0.02;
                this.y -= dy * force * 0.02;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Initialize nodes in a grid pattern
    function initNodes() {
        nodes = [];
        const spacing = 100;
        const cols = Math.ceil(canvas.width / spacing) + 1;
        const rows = Math.ceil(canvas.height / spacing) + 1;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * spacing + (j % 2 === 0 ? 0 : spacing / 2);
                const y = j * spacing;
                nodes.push(new GridNode(x, y, Math.random()));
            }
        }
    }

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initNodes();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Draw tesseract wireframe in center
    function drawTesseract(time) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = Math.min(canvas.width, canvas.height) * 0.15;

        // 4D to 3D projection
        const angle = time * 0.0003;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // 8 vertices of inner cube
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        // Project and rotate
        const projected = vertices.map(v => {
            // Rotate in XW and YW planes (4D rotation)
            let x = v[0] * cos - v[2] * sin;
            let y = v[1];
            let z = v[0] * sin + v[2] * cos;

            // Add second rotation
            const cos2 = Math.cos(angle * 0.7);
            const sin2 = Math.sin(angle * 0.7);
            const newY = y * cos2 - z * sin2;
            z = y * sin2 + z * cos2;
            y = newY;

            // Project to 2D
            const scale = 2 / (3 - z);
            return {
                x: centerX + x * size * scale,
                y: centerY + y * size * scale,
                z: z
            };
        });

        // Draw edges
        const edgePairs = [
            [0, 1], [1, 2], [2, 3], [3, 0], // front face
            [4, 5], [5, 6], [6, 7], [7, 4], // back face
            [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
        ];

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.lineWidth = 1;

        edgePairs.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
        });

        // Draw outer cube (scaled)
        const outerProjected = projected.map(p => ({
            x: centerX + (p.x - centerX) * 1.5,
            y: centerY + (p.y - centerY) * 1.5,
            z: p.z
        }));

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
        edgePairs.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(outerProjected[i].x, outerProjected[i].y);
            ctx.lineTo(outerProjected[j].x, outerProjected[j].y);
            ctx.stroke();
        });

        // Connect inner to outer (hypercube connections)
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(outerProjected[i].x, outerProjected[i].y);
            ctx.stroke();
        }
    }

    // Draw grid lines
    function drawGrid() {
        ctx.strokeStyle = 'rgba(58, 107, 140, 0.03)';
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Vertical lines
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
    }

    // Animation loop
    function animate(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw subtle grid
        drawGrid();

        // Draw rotating tesseract
        drawTesseract(time);

        // Update and draw nodes
        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        // Draw connections between nearby nodes
        nodes.forEach((node1, i) => {
            nodes.slice(i + 1).forEach(node2 => {
                const dx = node1.x - node2.x;
                const dy = node1.y - node2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(node1.x, node1.y);
                    ctx.lineTo(node2.x, node2.y);
                    ctx.strokeStyle = `rgba(212, 175, 55, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate(0);
}

/* ========================================
   Navigation
   ======================================== */
function initNavigation() {
    const nav = document.getElementById('nav');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    // Mobile menu toggle
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // Nav background on scroll
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            nav.style.background = 'rgba(5, 8, 22, 0.95)';
            nav.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.4)';
        } else {
            nav.style.background = 'rgba(5, 8, 22, 0.9)';
            nav.style.boxShadow = 'none';
        }
    });
}

/* ========================================
   Language Toggle
   ======================================== */
function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;

    let currentLang = 'en';

    langToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        currentLang = currentLang === 'en' ? 'zh' : 'en';

        // Toggle all language elements
        document.querySelectorAll('[data-lang]').forEach(el => {
            const elLang = el.getAttribute('data-lang');

            if (elLang === currentLang) {
                // Show element based on tag type
                const tagName = el.tagName.toLowerCase();
                if (tagName === 'a' || tagName === 'span') {
                    el.style.display = 'inline';
                } else {
                    el.style.display = 'block';
                }
            } else {
                el.style.display = 'none';
            }
        });

        // Update button text
        langToggle.textContent = currentLang === 'en' ? 'EN / 中文' : '中文 / EN';

        // Update HTML lang attribute
        document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';
    });
}

/* ========================================
   Smooth Scroll
   ======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.getElementById('nav').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   Scroll Animations
   ======================================== */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.dimension-card, .execution-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // Add animation class styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/* ========================================
   Dimension Cards Interaction
   ======================================== */
function initDimensionCards() {
    const cards = document.querySelectorAll('.dimension-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const dimension = this.getAttribute('data-dimension');
            this.style.setProperty('--glow-intensity', '1');
        });

        card.addEventListener('mouseleave', function() {
            this.style.setProperty('--glow-intensity', '0');
        });
    });
}
