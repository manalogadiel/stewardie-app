class JellyElement {
    constructor(el, isBackground = false) {
        this.el = el;
        this.isBackground = isBackground;
        
        // Physics state
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        // Spring parameters
        this.spring = isBackground ? 0.04 : 0.08;
        this.friction = isBackground ? 0.85 : 0.80;
        
        // Idle animation state
        this.randomOffset = Math.random() * 1000;
        this.speedX = 1.0 + Math.random() * 0.8; // Random speed between 1.0 and 1.8
        this.speedY = 1.5 + Math.random() * 1.0; // Random speed between 1.5 and 2.5
        this.isHovered = false;
        
        if (!isBackground) {
            this.el.addEventListener('mouseenter', () => this.isHovered = true);
            this.el.addEventListener('mouseleave', () => {
                this.isHovered = false;
                this.targetX = 0;
                this.targetY = 0;
            });
            this.el.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }
    }
    
    handleMouseMove(e) {
        const rect = this.el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Target offset based on mouse position from center
        this.targetX = (e.clientX - centerX) * 0.4;
        this.targetY = (e.clientY - centerY) * 0.4;
    }
    
    update() {
        if (!this.isHovered && !this.isBackground) {
            // Idle float for mascots
            const time = Date.now() / 1000;
            this.targetY = Math.sin(time * this.speedY + this.randomOffset) * 15;
            this.targetX = Math.cos(time * this.speedX + this.randomOffset) * 5;
        }
        
        // Spring physics
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        this.vx += dx * this.spring;
        this.vy += dy * this.spring;
        
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.isBackground) {
            this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
        } else {
            this.el.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.x * 0.1}deg)`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const floaters = document.querySelectorAll('.floating-element');
    const bgWaves = document.querySelector('.bg-waves');
    
    const jellyElements = [];
    
    // Initialize mascots
    floaters.forEach(el => jellyElements.push(new JellyElement(el, false)));
    
    // Initialize background jelly
    if (bgWaves) {
        const bgJelly = new JellyElement(bgWaves, true);
        jellyElements.push(bgJelly);
        
        document.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const moveX = (e.clientX - centerX) / centerX;
            const moveY = (e.clientY - centerY) / centerY;
            
            // Subtle parallax target for background
            bgJelly.targetX = moveX * -30;
            bgJelly.targetY = moveY * -30;
        });
    }
    
    // Iframe Loading detection and progress bar
    const demoLoader = document.getElementById('demo-loader');
    const iframe = document.querySelector('.app-iframe');
    const progressFill = document.getElementById('demo-progress-fill');
    
    if (demoLoader && iframe && progressFill) {
        let progress = 0;
        
        // Simulate loading progress up to 90%
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                progressFill.style.width = `${progress}%`;
            }
        }, 300);

        const checkFlutter = setInterval(() => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                // Flutter creates flutter-view, flutter-glass-pane, or canvas when rendering
                if (iframeDoc && (iframeDoc.querySelector('flutter-view') || iframeDoc.querySelector('flutter-glass-pane') || iframeDoc.querySelector('canvas'))) {
                    clearInterval(checkFlutter);
                    clearInterval(progressInterval);
                    
                    // Jump to 100% and hide
                    progressFill.style.width = '100%';
                    
                    setTimeout(() => {
                        demoLoader.classList.add('hidden');
                    }, 600); // Wait for progress bar animation to finish, then fade out
                }
            } catch(e) {
                // Ignore cross-origin errors if they occur
            }
        }, 500);
        
        // Fallback timeout in case DOM detection fails
        setTimeout(() => {
            clearInterval(checkFlutter);
            clearInterval(progressInterval);
            progressFill.style.width = '100%';
            setTimeout(() => {
                if(demoLoader) demoLoader.classList.add('hidden');
            }, 500);
        }, 15000); // Hide loader unconditionally after 15 seconds
    }

    function animate() {
        jellyElements.forEach(j => j.update());
        requestAnimationFrame(animate);
    }
    animate();

    // Premium Custom Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 2000; // 2.0 seconds for a slower, more relaxed travel
                let start = null;
                
                function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    
                    // EaseInOutQuint easing function for a very premium feel
                    const easeInOutQuint = p => {
                        return p < 0.5 ? 16 * Math.pow(p, 5) : 1 - Math.pow(-2 * p + 2, 5) / 2;
                    };

                    const percentage = Math.min(progress / duration, 1);
                    window.scrollTo(0, startPosition + distance * easeInOutQuint(percentage));
                    
                    if (progress < duration) {
                        window.requestAnimationFrame(step);
                    }
                }
                
                window.requestAnimationFrame(step);
            }
        });
    });
});
