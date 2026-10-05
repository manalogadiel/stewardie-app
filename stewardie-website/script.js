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
            this.targetY = Math.sin(time * 2 + this.randomOffset) * 15;
            this.targetX = Math.cos(time * 1.5 + this.randomOffset) * 5;
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
});
