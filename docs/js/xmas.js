(function() {
    const canvas = document.getElementById('xmasCanvas');
    let width, height, renderer, scene, camera;
    let treeGroup, snowSystem, star, gifts = [];
    let analyser, dataArray;
    const clock = new THREE.Clock();
    
    const config = {
        treeParticles: 3000,
        snowParticles: 2000,
        colors: {
            ice: 0x88ccff,
            silver: 0xdddddd,
            white: 0xffffff,
            star: 0xffffaa
        }
    };

    function init() {
        width = window.innerWidth;
        height = window.innerHeight;

        // 默认播放音乐
        playDefaultMusic();

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Scene
        scene = new THREE.Scene();
        
        // Camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 30, 100);
        camera.lookAt(0, 20, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(config.colors.ice, 2);
        pointLight.position.set(20, 50, 20);
        scene.add(pointLight);

        initTree();
        initSnow();
        initStar();
        initBackgroundElements();
        initTextParticles();
        
        animate();
    }

    function initTree() {
        treeGroup = new THREE.Group();
        const positions = [];
        const colors = [];
        const sizes = [];

        for (let i = 0; i < config.treeParticles; i++) {
            const h = Math.random();
            const angle = h * Math.PI * 40; // 螺旋结构
            const radius = (1 - h) * 20;
            
            const x = Math.cos(angle) * radius * (0.9 + Math.random() * 0.2);
            const z = Math.sin(angle) * radius * (0.9 + Math.random() * 0.2);
            const y = h * 50;

            positions.push(x, y, z);

            const color = new THREE.Color();
            if (Math.random() > 0.5) {
                color.setHex(config.colors.ice);
            } else {
                color.setHex(config.colors.silver);
            }
            colors.push(color.r, color.g, color.b);
            sizes.push(Math.random() * 0.5 + 0.2);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        treeGroup.add(points);
        scene.add(treeGroup);
    }

    function initSnow() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < config.snowParticles; i++) {
            positions.push(
                (Math.random() - 0.5) * 200,
                Math.random() * 100,
                (Math.random() - 0.5) * 200
            );
            velocities.push(
                (Math.random() - 0.5) * 0.1, // vx
                -(Math.random() * 0.1 + 0.05), // vy (gravity)
                (Math.random() - 0.5) * 0.1  // vz
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.6
        });

        snowSystem = new THREE.Points(geometry, material);
        snowSystem.userData.velocities = velocities;
        scene.add(snowSystem);
    }

    function initStar() {
        const starGeom = new THREE.OctahedronGeometry(2, 0);
        const starMat = new THREE.MeshBasicMaterial({ color: config.colors.star });
        star = new THREE.Mesh(starGeom, starMat);
        star.position.y = 52;
        scene.add(star);
        
        const starLight = new THREE.PointLight(config.colors.star, 2, 50);
        starLight.position.copy(star.position);
        scene.add(starLight);
    }

    function initBackgroundElements() {
        // 实现昼夜循环背景
        const updateBG = () => {
            const time = Date.now() * 0.0001;
            const cycle = (Math.sin(time) + 1) / 2; // 0 to 1
            const dayColor = new THREE.Color(0x87ceeb); // 天蓝
            const nightColor = new THREE.Color(0x050b1a); // 深蓝
            const currentBG = dayColor.lerp(nightColor, cycle);
            const container = document.getElementById('xmasContainer');
            if (container) {
                container.style.background = 
                    `radial-gradient(circle at center, ${currentBG.getStyle()} 0%, #000 100%)`;
            }

            // 让文字阴影颜色跟着背景变
            const blessingText = document.getElementById('blessingText');
            if (blessingText) {
                blessingText.style.textShadow = `0 0 15px ${currentBG.getStyle()}, 0 0 30px rgba(255,255,255,0.3)`;
            }
        };
        setInterval(updateBG, 100);
    }

    function initTextParticles() {
        const container = document.querySelector('.blessing-container');
        if (!container) return;

        setInterval(() => {
            const particle = document.createElement('div');
            particle.className = 'text-particle';
            
            const size = Math.random() * 4 + 2;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.opacity = Math.random() * 0.5 + 0.5;
            
            container.appendChild(particle);

            // 粒子动画
            const duration = 1000 + Math.random() * 2000;
            const driftX = (Math.random() - 0.5) * 40;
            const driftY = -20 - Math.random() * 40;

            const anim = particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
                { transform: `translate(${driftX}px, ${driftY}px) scale(0)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'ease-out'
            });

            anim.onfinish = () => particle.remove();
        }, 200);
    }

    // 音效处理
    const music = document.getElementById('xmasMusic');
    let audioCtx;

    function playDefaultMusic() {
        if (!music) return;
        
        // 自动尝试播放
        const startPlay = () => {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            music.play().then(() => {
                initAudioAnalyser();
            }).catch(e => {
                console.error("音乐播放失败:", e);
            });
        };

        // 已经通过解锁按钮产生了用户交互，可以直接尝试播放
        startPlay();
    }

    function initAudioAnalyser() {
        if (analyser || !audioCtx) return;
        const source = audioCtx.createMediaElementSource(music);
        analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getElapsedTime();
        
        // 旋转树
        if (treeGroup) {
            treeGroup.rotation.y += 0.005;
        }

        // 星星旋转与呼吸
        if (star) {
            star.rotation.y += 0.02;
            star.scale.setScalar(1 + Math.sin(delta * 2) * 0.2);
        }

        // 雪花物理模拟
        if (snowSystem) {
            const positions = snowSystem.geometry.attributes.position.array;
            const vels = snowSystem.userData.velocities;
            const wind = Math.sin(delta * 0.5) * 0.05;

            for (let i = 0; i < config.snowParticles; i++) {
                const idx = i * 3;
                positions[idx] += vels[idx] + wind;
                positions[idx + 1] += vels[idx + 1];
                positions[idx + 2] += vels[idx + 2];

                // 简单的碰撞检测与堆积模拟 (如果靠近树体下半部分)
                const distToAxis = Math.sqrt(positions[idx]**2 + positions[idx+2]**2);
                const treeRadiusAtHeight = (1 - positions[idx+1]/50) * 20;
                
                if (positions[idx+1] < 0) {
                    positions[idx+1] = 100; // 重置到顶部
                }
                
                // 模拟雪花在树枝上停留
                if (distToAxis < treeRadiusAtHeight && positions[idx+1] < 50 && positions[idx+1] > 0) {
                    if (Math.random() > 0.99) { // 极小概率“停住”
                        // 实际上为了性能，我们让它减速通过
                        positions[idx+1] += vels[idx+1] * 0.5;
                    }
                }
            }
            snowSystem.geometry.attributes.position.needsUpdate = true;
        }

        // 音乐同步
        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
            const bass = dataArray[0] / 255;
            if (treeGroup) {
                treeGroup.scale.setScalar(1 + bass * 0.1);
            }
        }

        // 鼠标跟随
        const mouseX = (window.mouseX || 0) / width * 2 - 1;
        const mouseY = -(window.mouseY || 0) / height * 2 + 1;
        camera.position.x += (mouseX * 50 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 50 + 30 - camera.position.y) * 0.05;
        camera.lookAt(0, 20, 0);

        renderer.render(scene, camera);
    }

    window.addEventListener('mousemove', (e) => {
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
    });

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    document.getElementById('resetXmas').addEventListener('click', () => {
        camera.position.set(0, 30, 100);
    });

    document.getElementById('exportXmas').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'xmas-3d.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    init();
})();
