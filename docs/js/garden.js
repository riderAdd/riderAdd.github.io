	    function Vector(x, y) {
	        this.x = x;
	        this.y = y;
	    };
		
	    Vector.prototype = {
	        rotate: function (theta) {
	            var x = this.x;
	            var y = this.y;
	            this.x = Math.cos(theta) * x - Math.sin(theta) * y;
	            this.y = Math.sin(theta) * x + Math.cos(theta) * y;
	            return this;
	        },
	        mult: function (f) {
	            this.x *= f;
	            this.y *= f;
	            return this;
	        },
	        clone: function () {
	            return new Vector(this.x, this.y);
	        },
	        length: function () {
	            return Math.sqrt(this.x * this.x + this.y * this.y);
	        },
	        subtract: function (v) {
	            this.x -= v.x;
	            this.y -= v.y;
	            return this;
	        },
	        set: function (x, y) {
	            this.x = x;
	            this.y = y;
	            return this;
	        }
	    };
		
    // 样式1: 柔光心形 - 温柔浪漫的粉色光晕
    function NeonHeart(x, y, garden) {
        this.p = new Vector(x, y);
        this.garden = garden;
        this.size = Garden.random(2.5, 4.5);
        this.baseSize = this.size;
        this.pulseSpeed = Garden.random(0.0015, 0.003);
        this.pulsePhase = Garden.random(0, Math.PI * 2);
        this.glowIntensity = Garden.random(0.7, 0.9);
        this.colorIndex = Garden.randomInt(0, 2); // 0=粉, 1=紫粉, 2=浅粉
        this.garden.addParticle(this);
    }

    NeonHeart.prototype = {
        draw: function () {
            var ctx = this.garden.ctx;
            var pulse = 0.85 + 0.15 * Math.sin(Date.now() * this.pulseSpeed + this.pulsePhase);
            var currentSize = this.baseSize * pulse;
            
            // 选择柔和的颜色
            var colors = [
                { r: 255, g: 182, b: 193 },  // 粉色
                { r: 255, g: 192, b: 203 },  // 浅粉
                { r: 255, g: 160, b: 180 }   // 紫粉
            ];
            var c = colors[this.colorIndex];
            
            // 柔和的多层光晕（6层，渐进衰减）
            for (var i = 0; i < 6; i++) {
                var radius = currentSize * (1.5 + i * 0.8);
                var alpha = this.glowIntensity * (1 - i / 6) * 0.25;
                var gradient = ctx.createRadialGradient(this.p.x, this.p.y, 0, this.p.x, this.p.y, radius);
                gradient.addColorStop(0, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (alpha * 1.5) + ')');
                gradient.addColorStop(0.5, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + alpha + ')');
                gradient.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.p.x, this.p.y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 温柔的核心光点
            var coreGradient = ctx.createRadialGradient(this.p.x, this.p.y, 0, this.p.x, this.p.y, currentSize * 1.2);
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, ' + (this.glowIntensity * pulse * 0.8) + ')');
            coreGradient.addColorStop(0.4, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (this.glowIntensity * 0.6) + ')');
            coreGradient.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(this.p.x, this.p.y, currentSize * 1.2, 0, Math.PI * 2);
            ctx.fill();
        },
        update: function () {},
        render: function () { this.update(); this.draw(); }
    };

	    // 样式2: 樱花飘落 - 浪漫的飘落效果
	    function SakuraPetal(x, y, garden) {
	        this.p = new Vector(x, y);
	        this.origin = new Vector(x, y);
	        this.garden = garden;
	        this.size = Garden.random(4, 8);
	        this.rotation = Garden.random(0, Math.PI * 2);
	        this.rotationSpeed = Garden.random(0.02, 0.05);
	        this.swaySpeed = Garden.random(0.01, 0.02);
	        this.swayAmount = Garden.random(10, 20);
	        this.time = Garden.random(0, Math.PI * 2);
	        this.fallSpeed = Garden.random(0.1, 0.3);
	        this.color = Garden.getSakuraColor();
	        this.garden.addParticle(this);
	    }

	    SakuraPetal.prototype = {
	        draw: function () {
	            var ctx = this.garden.ctx;
	            
	            // 花瓣阴影
	            ctx.save();
	            ctx.translate(this.p.x + 2, this.p.y + 2);
	            ctx.rotate(this.rotation);
	            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
	            this.drawPetal(ctx, this.size);
	            ctx.restore();
	            
	            // 花瓣主体
	            ctx.save();
	            ctx.translate(this.p.x, this.p.y);
	            ctx.rotate(this.rotation);
	            
	            var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
	            gradient.addColorStop(0, this.color.replace('0.8', '0.95'));
	            gradient.addColorStop(0.7, this.color);
	            gradient.addColorStop(1, this.color.replace('0.8', '0.5'));
	            
	            ctx.fillStyle = gradient;
	            this.drawPetal(ctx, this.size);
	            
	            // 花瓣纹理
	            ctx.strokeStyle = this.color.replace('0.8', '0.4');
	            ctx.lineWidth = 0.5;
	            ctx.beginPath();
	            ctx.moveTo(0, -this.size * 0.5);
	            ctx.lineTo(0, this.size * 0.5);
	            ctx.stroke();
	            
	            ctx.restore();
	        },
	        drawPetal: function(ctx, size) {
	            ctx.beginPath();
	            ctx.moveTo(0, -size * 0.5);
	            ctx.bezierCurveTo(size * 0.3, -size * 0.3, size * 0.5, 0, 0, size * 0.7);
	            ctx.bezierCurveTo(-size * 0.5, 0, -size * 0.3, -size * 0.3, 0, -size * 0.5);
	            ctx.closePath();
	            ctx.fill();
	        },
	        update: function () {
	            this.time += this.swaySpeed;
	            this.p.x = this.origin.x + Math.sin(this.time) * this.swayAmount;
	            this.p.y += this.fallSpeed;
	            this.rotation += this.rotationSpeed;
	            
	            // 循环飘落
	            if (this.p.y > this.origin.y + 30) {
	                this.p.y = this.origin.y - 30;
	            }
	        },
	        render: function () { this.update(); this.draw(); }
	    };

	    // 样式3: 星空粒子 - 梦幻的星空效果
	    function StarParticle(x, y, garden) {
	        this.p = new Vector(x, y);
	        this.garden = garden;
	        this.size = Garden.random(1, 3);
	        this.baseSize = this.size;
	        this.twinkleSpeed = Garden.random(0.001, 0.003);
	        this.twinklePhase = Garden.random(0, Math.PI * 2);
	        this.brightness = Garden.random(0.5, 1);
	        this.color = Garden.getStarColor();
	        this.particles = [];
	        // 增加环绕小星点数量，让填充更密集
	        var count = Garden.randomInt(7, 9); // 从3提升到7-9
	        for (var i = 0; i < count; i++) {
	            this.particles.push({
	                angle: Garden.random(0, Math.PI * 2),
	                // 距离范围略微调整，让分布更均匀密集
	                distance: Garden.random(1.2, 4.5),
	                speed: Garden.random(0.01, 0.02)
	            });
	        }
	        this.garden.addParticle(this);
	    }

	    StarParticle.prototype = {
	        draw: function () {
	            var ctx = this.garden.ctx;
	            // 确保 twinkle 始终为正数，范围 [0.3, 1.0]
	            var twinkle = 0.65 + 0.35 * Math.sin(Date.now() * this.twinkleSpeed + this.twinklePhase);
	            var currentSize = this.baseSize * twinkle * this.brightness;
	            
	            // 让单个星星更大一点，看起来更饱满
	            currentSize *= 1.4; // 从1.3提升到1.4
	            
	            // 获取颜色的 RGB 值
	            var colorMatch = this.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	            var r = parseInt(colorMatch[1]);
	            var g = parseInt(colorMatch[2]);
	            var b = parseInt(colorMatch[3]);
	            
	            // 绘制小粒子（半径扩大，配合数量提升整体填充感）
	            for (var i = 0; i < this.particles.length; i++) {
	                var p = this.particles[i];
	                var px = this.p.x + Math.cos(p.angle) * p.distance;
	                var py = this.p.y + Math.sin(p.angle) * p.distance;
	                
	                var gradient = ctx.createRadialGradient(px, py, 0, px, py, currentSize * 2.5); // 从2.2提升到2.5
	                gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (0.65 * twinkle) + ')'); // 透明度从0.55提升到0.65
	                gradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
	                
	                ctx.fillStyle = gradient;
	                ctx.beginPath();
	                ctx.arc(px, py, currentSize * 2.5, 0, Math.PI * 2);
	                ctx.fill();
	            }
	            
	            // 主星光（范围稍微扩大）
	            var mainGradient = ctx.createRadialGradient(this.p.x, this.p.y, 0, this.p.x, this.p.y, currentSize * 7);
	            mainGradient.addColorStop(0, 'rgba(255, 255, 255, ' + (twinkle * 0.8) + ')');
	            mainGradient.addColorStop(0.2, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (twinkle * 0.6) + ')');
	            mainGradient.addColorStop(0.5, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (twinkle * 0.3) + ')');
	            mainGradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
	            
	            ctx.fillStyle = mainGradient;
	            ctx.beginPath();
	            ctx.arc(this.p.x, this.p.y, currentSize * 7, 0, Math.PI * 2);
	            ctx.fill();
	            
	            // 十字星芒
	            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (twinkle * 0.6) + ')';
	            ctx.lineWidth = 1;
	            ctx.beginPath();
	            ctx.moveTo(this.p.x - currentSize * 4, this.p.y);
	            ctx.lineTo(this.p.x + currentSize * 4, this.p.y);
	            ctx.moveTo(this.p.x, this.p.y - currentSize * 4);
	            ctx.lineTo(this.p.x, this.p.y + currentSize * 4);
	            ctx.stroke();
	        },
	        update: function () {
	            for (var i = 0; i < this.particles.length; i++) {
	                this.particles[i].angle += this.particles[i].speed;
	            }
	        },
	        render: function () { this.update(); this.draw(); }
	    };

	    // 样式4: 爱心泡泡 - 可爱的泡泡效果
	    function BubbleHeart(x, y, garden) {
	        this.p = new Vector(x, y);
	        this.origin = new Vector(x, y);
	        this.garden = garden;
	        this.size = Garden.random(5, 10);
	        this.baseSize = this.size;
	        this.pulseSpeed = Garden.random(0.003, 0.006);
	        this.pulsePhase = Garden.random(0, Math.PI * 2);
	        this.floatSpeed = Garden.random(0.1, 0.2);
	        this.swaySpeed = Garden.random(0.02, 0.04);
	        this.swayAmount = Garden.random(3, 6);
	        this.time = Garden.random(0, Math.PI * 2);
	        this.color = Garden.getBubbleColor();
	        this.garden.addParticle(this);
	    }

	    BubbleHeart.prototype = {
	        draw: function () {
	            var ctx = this.garden.ctx;
	            var pulse = 0.9 + 0.1 * Math.sin(Date.now() * this.pulseSpeed + this.pulsePhase);
	            var currentSize = this.baseSize * pulse;
	            
	            // 泡泡阴影
	            var shadowGradient = ctx.createRadialGradient(
	                this.p.x + currentSize * 0.3, 
	                this.p.y + currentSize * 0.3, 
	                0, 
	                this.p.x, 
	                this.p.y, 
	                currentSize * 1.2
	            );
	            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
	            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
	            ctx.fillStyle = shadowGradient;
	            ctx.beginPath();
	            ctx.arc(this.p.x, this.p.y, currentSize * 1.2, 0, Math.PI * 2);
	            ctx.fill();
	            
	            // 泡泡主体
	            var bubbleGradient = ctx.createRadialGradient(
	                this.p.x - currentSize * 0.3, 
	                this.p.y - currentSize * 0.3, 
	                0, 
	                this.p.x, 
	                this.p.y, 
	                currentSize
	            );
	            bubbleGradient.addColorStop(0, this.color.replace('0.5', '0.7'));
	            bubbleGradient.addColorStop(0.5, this.color);
	            bubbleGradient.addColorStop(1, this.color.replace('0.5', '0.3'));
	            
	            ctx.fillStyle = bubbleGradient;
	            ctx.beginPath();
	            ctx.arc(this.p.x, this.p.y, currentSize, 0, Math.PI * 2);
	            ctx.fill();
	            
	            // 高光
	            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
	            ctx.beginPath();
	            ctx.arc(this.p.x - currentSize * 0.3, this.p.y - currentSize * 0.3, currentSize * 0.3, 0, Math.PI * 2);
	            ctx.fill();
	            
	            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
	            ctx.beginPath();
	            ctx.arc(this.p.x + currentSize * 0.2, this.p.y + currentSize * 0.2, currentSize * 0.15, 0, Math.PI * 2);
	            ctx.fill();
	            
	            // 边缘光泽
	            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
	            ctx.lineWidth = 1;
	            ctx.beginPath();
	            ctx.arc(this.p.x, this.p.y, currentSize, Math.PI * 0.7, Math.PI * 1.3);
	            ctx.stroke();
	        },
	        update: function () {
	            this.time += this.swaySpeed;
	            this.p.x = this.origin.x + Math.sin(this.time) * this.swayAmount;
	            this.p.y -= this.floatSpeed;
	            
	            // 循环上浮
	            if (this.p.y < this.origin.y - 30) {
	                this.p.y = this.origin.y + 30;
	            }
	        },
	        render: function () { this.update(); this.draw(); }
	    };

	    // 样式5: 流光溢彩 - 极光般柔和的渐变流动效果
	    function FlowingLight(x, y, garden) {
	        this.p = new Vector(x, y);
	        this.garden = garden;
	        this.size = Garden.random(2.5, 4.5);
	        this.baseSize = this.size;
	        // 使用更宽的粉紫蓝色相范围，模拟极光效果
	        this.hue = Garden.random(300, 350);
	        this.hueSpeed = Garden.random(0.3, 0.8);
	        this.pulseSpeed = Garden.random(0.002, 0.005);
	        this.pulsePhase = Garden.random(0, Math.PI * 2);
	        this.trails = [];
	        this.maxTrails = 8;
	        this.garden.addParticle(this);
	    }

	    FlowingLight.prototype = {
	        draw: function () {
	            var ctx = this.garden.ctx;
	            var pulse = 0.8 + 0.2 * Math.sin(Date.now() * this.pulseSpeed + this.pulsePhase);
	            var currentSize = this.baseSize * pulse;
	            
	            // 更新拖尾
	            this.trails.push({ x: this.p.x, y: this.p.y, hue: this.hue, size: currentSize });
	            if (this.trails.length > this.maxTrails) {
	                this.trails.shift();
	            }
	            
	            // 绘制拖尾（极淡的拖尾，饱和度和透明度都大幅降低）
	            for (var i = 0; i < this.trails.length; i++) {
	                var trail = this.trails[i];
	                var alpha = (i / this.trails.length) * 0.18; // 从0.35降到0.18
	                var trailSize = trail.size * (i / this.trails.length);
	                
	                var gradient = ctx.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, trailSize * 3);
	                // 饱和度从80%降到45%，亮度提升到88%
	                gradient.addColorStop(0, 'hsla(' + trail.hue + ', 45%, 88%, ' + alpha + ')');
	                gradient.addColorStop(0.5, 'hsla(' + trail.hue + ', 40%, 82%, ' + (alpha * 0.4) + ')');
	                gradient.addColorStop(1, 'hsla(' + trail.hue + ', 40%, 82%, 0)');
	                
	                ctx.fillStyle = gradient;
	                ctx.beginPath();
	                ctx.arc(trail.x, trail.y, trailSize * 3, 0, Math.PI * 2);
	                ctx.fill();
	            }
	            
	            // 主光点（极淡的雾光，像薄纱一样）
	            var mainGradient = ctx.createRadialGradient(this.p.x, this.p.y, 0, this.p.x, this.p.y, currentSize * 3.8);
	            // 饱和度降到35-40%，亮度提升，透明度大幅降低
	            mainGradient.addColorStop(0, 'hsla(' + this.hue + ', 40%, 96%, 0.4)');  // 从0.8降到0.4
	            mainGradient.addColorStop(0.3, 'hsla(' + this.hue + ', 38%, 88%, 0.28)'); // 从0.55降到0.28
	            mainGradient.addColorStop(0.6, 'hsla(' + this.hue + ', 35%, 80%, 0.15)'); // 从0.3降到0.15
	            mainGradient.addColorStop(1, 'hsla(' + this.hue + ', 35%, 80%, 0)');
	            
	            ctx.fillStyle = mainGradient;
	            ctx.beginPath();
	            ctx.arc(this.p.x, this.p.y, currentSize * 3.8, 0, Math.PI * 2);
	            ctx.fill();
	            
	            // 白色核心（更柔和的高光）
	            ctx.fillStyle = 'rgba(255, 255, 255, ' + (pulse * 0.35) + ')'; // 从0.7降到0.35
	            ctx.beginPath();
	            ctx.arc(this.p.x, this.p.y, currentSize * 0.6, 0, Math.PI * 2);
	            ctx.fill();
	        },
	        update: function () {
	            this.hue += this.hueSpeed;
	            if (this.hue > 360) this.hue = 300;
	        },
	        render: function () { this.update(); this.draw(); }
	    };

	    // 样式6: 烟花绽放 - 璀璨的烟花效果（首闪后保持淡淡余晖）
	    function FireworkParticle(x, y, garden) {
	        this.p = new Vector(x, y);
	        this.garden = garden;
	        this.size = Garden.random(2.5, 4);
	        this.color = Garden.getFireworkColor();
	        this.sparks = [];
	        this.sparkCount = Garden.randomInt(8, 12);
	        this.age = 0;
	        // 延长一点寿命，让烟花有更长的余晖时间
	        this.maxAge = Garden.randomInt(80, 120);
	        
	        for (var i = 0; i < this.sparkCount; i++) {
	            var angle = (Math.PI * 2 / this.sparkCount) * i;
	            this.sparks.push({
	                angle: angle,
	                speed: Garden.random(0.3, 0.8),
	                distance: 0,
	                maxDistance: Garden.random(8, 15)
	            });
	        }
	        
	        this.garden.addParticle(this);
	    }

	    FireworkParticle.prototype = {
	        draw: function () {
	            var ctx = this.garden.ctx;
	            var progress = this.age / this.maxAge;
	            if (progress > 1) progress = 1;
	            // 保持更高的最低透明度，让烟花始终可见，形成持久的余晖
	            var alpha = 0.7 * (1 - progress) + 0.45; // 理论范围 [0.45, 1.15]
	            if (alpha > 1) alpha = 1;
	            
	            // 绘制火花（使用柔和的颜色）
	            for (var i = 0; i < this.sparks.length; i++) {
	                var spark = this.sparks[i];
	                var x = this.p.x + Math.cos(spark.angle) * spark.distance;
	                var y = this.p.y + Math.sin(spark.angle) * spark.distance;
	                
	                // 火花拖尾（保持柔和的渐变）
	                var gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size * 3.2);
	                gradient.addColorStop(0, this.color.replace('1)', (alpha * 0.6) + ')'));
	                gradient.addColorStop(0.5, this.color.replace('1)', (alpha * 0.32) + ')'));
	                gradient.addColorStop(1, this.color.replace('1)', '0)'));
	                
	                ctx.fillStyle = gradient;
	                ctx.beginPath();
	                ctx.arc(x, y, this.size * 3.2, 0, Math.PI * 2);
	                ctx.fill();
	                
	                // 火花核心（保持温柔的白光）
	                ctx.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.6) + ')';
	                ctx.beginPath();
	                ctx.arc(x, y, this.size * 0.9, 0, Math.PI * 2);
	                ctx.fill();
	            }
	            
	            // 中心光点：持续保持温柔的光晕，不完全消失
	            var centerStrength = 1 - Math.min(progress, 0.6) / 0.6; // [0,1]
	            var centerAlpha = 0.65 * centerStrength + 0.5; // [0.5, 1.15]，保持更高的最低值
	            if (centerAlpha > 1) centerAlpha = 1;
	            var centerGradient = ctx.createRadialGradient(this.p.x, this.p.y, 0, this.p.x, this.p.y, this.size * 5.2);
	            centerGradient.addColorStop(0, 'rgba(255, 255, 255, ' + centerAlpha + ')');
	            centerGradient.addColorStop(0.5, this.color.replace('1)', (centerAlpha * 0.65) + ')'));
	            centerGradient.addColorStop(1, this.color.replace('1)', '0)'));
	            
	            ctx.fillStyle = centerGradient;
	            ctx.beginPath();
	            ctx.arc(this.p.x, this.p.y, this.size * 5.2, 0, Math.PI * 2);
	            ctx.fill();
	        },
	        update: function () {
	            // 让烟花扩散但不被移除，到达最大半径后保持在最后状态
	            if (this.age < this.maxAge) {
	                this.age++;
	            }
	            
	            for (var i = 0; i < this.sparks.length; i++) {
	                var spark = this.sparks[i];
	                if (spark.distance < spark.maxDistance) {
	                    spark.distance += spark.speed;
	                }
	            }
	        },
	        render: function () { this.update(); this.draw(); }
	    };

	    // Garden类
	    function Garden(ctx, element) {
	        this.particles = [];
	        this.element = element;
	        this.ctx = ctx;
	        this.styleType = Garden.selectRandomStyle();
	    }
	    
	    Garden.prototype = {
	        render: function () {
	            this.ctx.clearRect(0, 0, this.element.width, this.element.height);
	            for (var i = 0; i < this.particles.length; i++) {
	                this.particles[i].render();
	            }
	        },
	        addParticle: function (particle) {
	            this.particles.push(particle);
	        },
	        removeParticle: function (particle) {
	            var index = this.particles.indexOf(particle);
	            if (index > -1) {
	                this.particles.splice(index, 1);
	            }
	        },
	        createParticle: function (x, y) {
	            switch(this.styleType) {
	                case 'neon':
	                    new NeonHeart(x, y, this);
	                    break;
	                case 'sakura':
	                    new SakuraPetal(x, y, this);
	                    break;
	                case 'star':
	                    new StarParticle(x, y, this);
	                    break;
	                case 'bubble':
	                    new BubbleHeart(x, y, this);
	                    break;
	                case 'flowing':
	                    new FlowingLight(x, y, this);
	                    break;
	                case 'firework':
	                    new FireworkParticle(x, y, this);
	                    break;
	                default:
	                    new NeonHeart(x, y, this);
	            }
	        },
	        clear: function () {
	            this.particles = [];
	            this.ctx.clearRect(0, 0, this.element.width, this.element.height);
	        }
	    };

	    Garden.options = {
	        renderSpeed: 1000 / 60
	    };
	    
	    Garden.random = function (min, max) {
	        return Math.random() * (max - min) + min;
	    };
	    
	    Garden.randomInt = function (min, max) {
	        return Math.floor(Math.random() * (max - min + 1)) + min;
	    };
	    
	    Garden.circle = 2 * Math.PI;
	    
	    Garden.degrad = function (angle) {
	        return Garden.circle / 360 * angle;
	    };
	    
	    Garden.raddeg = function (angle) {
	        return angle / Garden.circle * 360;
	    };
	    
	    Garden.rgba = function (r, g, b, a) {
	        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	    };
	    
	    // 随机选择样式
	    Garden.selectRandomStyle = function () {
	        var styles = ['neon', 'sakura', 'star', 'bubble', 'flowing', 'firework'];
	        var selected = styles[Garden.randomInt(0, styles.length - 1)];
	        console.log('🎨 当前心形填充样式: ' + selected + ' | 样式说明: ' + Garden.getStyleDescription(selected));
	        return selected;
	    };
	    
	    // 样式说明
	    Garden.getStyleDescription = function(style) {
	        var descriptions = {
	            'neon': '霓虹发光 - 强烈的霓虹光效',
	            'sakura': '樱花飘落 - 浪漫的花瓣飘落',
	            'star': '星空粒子 - 梦幻的星空闪烁',
	            'bubble': '爱心泡泡 - 可爱的泡泡漂浮',
	            'flowing': '流光溢彩 - 渐变色彩流动',
	            'firework': '烟花绽放 - 璀璨的烟花效果'
	        };
	        return descriptions[style] || style;
	    };
	    
	    // 霓虹颜色
	    Garden.getNeonColor = function () {
	        var colors = [
	            'rgba(255, 0, 255, 1)',      // 洋红
	            'rgba(0, 255, 255, 1)',      // 青色
	            'rgba(255, 0, 128, 1)',      // 玫红
	            'rgba(255, 105, 180, 1)',    // 粉红
	            'rgba(138, 43, 226, 1)',     // 蓝紫
	            'rgba(255, 20, 147, 1)'      // 深粉红
	        ];
	        return colors[Garden.randomInt(0, colors.length - 1)];
	    };
	    
	    // 樱花颜色
	    Garden.getSakuraColor = function () {
	        var colors = [
	            'rgba(255, 192, 203, 0.8)',  // 淡粉
	            'rgba(255, 182, 193, 0.8)',  // 浅粉
	            'rgba(255, 228, 225, 0.8)',  // 雪白粉
	            'rgba(255, 218, 224, 0.8)',  // 樱花粉
	            'rgba(255, 240, 245, 0.8)'   // 淡玫瑰
	        ];
	        return colors[Garden.randomInt(0, colors.length - 1)];
	    };
	    
	    // 星空颜色
	    Garden.getStarColor = function () {
	        var colors = [
	            'rgba(173, 216, 230, 0.9)',  // 浅蓝
	            'rgba(255, 182, 193, 0.9)',  // 浅粉
	            'rgba(255, 255, 224, 0.9)',  // 浅黄
	            'rgba(230, 230, 250, 0.9)',  // 淡紫
	            'rgba(255, 255, 255, 0.9)'   // 白色
	        ];
	        return colors[Garden.randomInt(0, colors.length - 1)];
	    };
	    
	    // 泡泡颜色
	    Garden.getBubbleColor = function () {
	        var colors = [
	            'rgba(255, 192, 203, 0.5)',  // 粉红泡泡
	            'rgba(255, 182, 193, 0.5)',  // 浅粉泡泡
	            'rgba(255, 160, 122, 0.5)',  // 珊瑚泡泡
	            'rgba(255, 218, 185, 0.5)',  // 桃色泡泡
	            'rgba(255, 228, 225, 0.5)'   // 雪粉泡泡
	        ];
	        return colors[Garden.randomInt(0, colors.length - 1)];
	    };
	    
	    // 烟花颜色（柔和版本，降低饱和度，更加温柔）
	    Garden.getFireworkColor = function () {
	        var colors = [
	            'rgba(255, 182, 193, 1)',    // 浅粉
	            'rgba(255, 192, 203, 1)',    // 淡粉红
	            'rgba(255, 218, 224, 1)',    // 樱花粉
	            'rgba(230, 190, 210, 1)',    // 藕粉
	            'rgba(255, 228, 225, 1)',    // 雪粉
	            'rgba(240, 200, 220, 1)'     // 淡紫粉
	        ];
	        return colors[Garden.randomInt(0, colors.length - 1)];
	    };
