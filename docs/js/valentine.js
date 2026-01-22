/**
 * Valentine's Day 2026 - 心形粒子聚合动画
 * 
 * 特效：
 * 1. 粒子从随机位置飘向心形轮廓
 * 2. 心形呼吸跳动效果
 * 3. 鼠标交互排斥
 * 4. 点击生成爆发粒子
 */

(function() {
    'use strict';

    // ============================================
    // 配置
    // ============================================
    const CONFIG = {
        particleCount: 1200,
        maxClickParticles: 300,
        colors: [
            'rgba(255, 45, 117, 0.8)',
            'rgba(255, 107, 157, 0.7)',
            'rgba(255, 160, 192, 0.6)',
            'rgba(255, 180, 210, 0.5)',
            'rgba(255, 80, 130, 0.75)'
        ]
    };

    let canvas, ctx, width, height;
    let particles = [];
    let clickParticles = [];
    let mouse = { x: null, y: null };
    let tick = 0;
    let heartScale;
    let centerX, centerY;
    let isPlaying = false;

    // ============================================
    // 心形参数方程
    // ============================================
    function getHeartPoint(t, scale, offsetX, offsetY, breathe = 0) {
        // 经典心形公式
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        // 应用呼吸效果
        const s = scale * (1 + breathe * 0.08);
        
        return {
            x: x * s + offsetX,
            y: y * s + offsetY
        };
    }

    // ============================================
    // 心形粒子类
    // ============================================
    class HeartParticle {
        constructor(index) {
            this.index = index;
            this.t = (index / CONFIG.particleCount) * Math.PI * 2;
            this.reset();
        }

        reset() {
            // 初始随机位置
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.speed = Math.random() * 0.02 + 0.015;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        }

        update(breathe) {
            // 计算目标位置
            const target = getHeartPoint(this.t, heartScale, centerX, centerY, breathe);
            
            // 添加微小摆动
            this.wobble += this.wobbleSpeed;
            const wobbleX = Math.sin(this.wobble) * 2;
            const wobbleY = Math.cos(this.wobble * 0.7) * 2;
            
            const tx = target.x + wobbleX;
            const ty = target.y + wobbleY;

            // 鼠标排斥
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const repelRadius = 120;
                
                if (dist < repelRadius && dist > 0) {
                    const force = (1 - dist / repelRadius) * 8;
                    this.x += (dx / dist) * force;
                    this.y += (dy / dist) * force;
                }
            }

            // 缓动到目标
            this.x += (tx - this.x) * this.speed;
            this.y += (ty - this.y) * this.speed;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ============================================
    // 点击爆发粒子类
    // ============================================
    class BurstParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 4 + 2;
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.gravity = 0.1;
        }

        update() {
            this.vy += this.gravity;
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            return this.life > 0;
        }

        draw() {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            
            // 绘制小爱心
            const s = this.size * this.life;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            ctx.moveTo(0, s * 0.3);
            ctx.bezierCurveTo(-s, -s * 0.3, -s, s * 0.5, 0, s);
            ctx.bezierCurveTo(s, s * 0.5, s, -s * 0.3, 0, s * 0.3);
            ctx.fill();
            ctx.restore();
            
            ctx.globalAlpha = 1;
        }
    }

    // ============================================
    // 初始化
    // ============================================
    function init() {
        canvas = document.getElementById('valentineCanvas');
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');
        resize();
        initParticles();
        bindEvents();
        initMusicPlayer();
        initControls();
        animate();
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        // 根据屏幕大小调整心形
        heartScale = Math.min(width, height) / 42;
        centerX = width / 2;
        centerY = height / 2 - 20;
        
        // 重新计算粒子目标
        particles.forEach((p, i) => {
            p.t = (i / CONFIG.particleCount) * Math.PI * 2;
        });
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new HeartParticle(i));
        }
    }

    // ============================================
    // 事件绑定
    // ============================================
    function bindEvents() {
        window.addEventListener('resize', resize);

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('click', (e) => {
            if (e.target.closest('#valentineUI')) return;
            createBurst(e.clientX, e.clientY);
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        });

        window.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('#valentineUI')) return;
            if (e.touches.length > 0) {
                createBurst(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
    }

    function createBurst(x, y) {
        const count = Math.floor(Math.random() * 15) + 15;
        for (let i = 0; i < count; i++) {
            if (clickParticles.length < CONFIG.maxClickParticles) {
                clickParticles.push(new BurstParticle(x, y));
            }
        }
    }

    // ============================================
    // 动画循环
    // ============================================
    function animate() {
        tick++;
        
        // 清除画布（带拖影）
        ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
        ctx.fillRect(0, 0, width, height);
        
        // 计算心跳呼吸
        const breathe = Math.sin(tick * 0.04);
        
        // 混合模式实现发光
        ctx.globalCompositeOperation = 'lighter';
        
        // 更新和绘制心形粒子
        particles.forEach(p => {
            p.update(breathe);
            p.draw();
        });
        
        // 更新和绘制爆发粒子
        clickParticles = clickParticles.filter(p => {
            const alive = p.update();
            if (alive) p.draw();
            return alive;
        });
        
        ctx.globalCompositeOperation = 'source-over';
        
        requestAnimationFrame(animate);
    }

    // ============================================
    // 音乐播放器
    // ============================================
    function initMusicPlayer() {
        const toggleBtn = document.getElementById('toggleMusic');
        const audio = document.getElementById('valentineMusic');
        if (!toggleBtn || !audio) return;

        toggleBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                toggleBtn.classList.add('music-off');
            } else {
                audio.play().catch(() => {});
                toggleBtn.classList.remove('music-off');
            }
            isPlaying = !isPlaying;
        });
    }

    // ============================================
    // 控制按钮
    // ============================================
    function initControls() {
        const resetBtn = document.getElementById('resetView');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                particles.forEach(p => p.reset());
                clickParticles = [];
            });
        }

        const exportBtn = document.getElementById('exportImg');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.fillStyle = '#0a0a0f';
                tempCtx.fillRect(0, 0, width, height);
                tempCtx.drawImage(canvas, 0, 0);
                
                const link = document.createElement('a');
                link.download = `valentine-2026-${Date.now()}.png`;
                link.href = tempCanvas.toDataURL('image/png');
                link.click();
            });
        }
    }

    // ============================================
    // 启动
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
