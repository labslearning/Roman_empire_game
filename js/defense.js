/**
 * AETHER-ROME: ROMAN SIEGE ENGINE v8.0 (GOD TIER - HISTORICAL SIMULATION)
 * Architecture: Predictive Point-and-Shoot Artillery, DOD Particle Buffer
 * Theme: Roman Siege (Onager vs Barbarian Fortress), SPQR Banners, Fire Physics
 * Pedagogy: Historical contextualization of Roman siege warfare.
 */

class Vec2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    scale(s) { this.x *= s; this.y *= s; return this; }
    copy(v) { this.x = v.x; this.y = v.y; return this; }
    static sub(v1, v2) { return new Vec2(v1.x - v2.x, v1.y - v2.y); }
    static dist(v1, v2) { return Math.hypot(v1.x - v2.x, v1.y - v2.y); }
}

export class RomanDefense {
    #dom; #ctx; #state; #memory; #onComplete; #lastTime; #animationFrameId; #audioCtx;

    constructor(canvasId, onCompleteCallback) {
        this.#dom = { canvas: document.getElementById(canvasId) };
        if (!this.#dom.canvas) throw new Error("ATP-FATAL: Canvas Node Unreachable.");
        
        this.#ctx = this.#dom.canvas.getContext('2d', { alpha: false });
        this.#onComplete = onCompleteCallback;
        
        this.#initAudioSynthesizer();
        this.#initState();
        this.#setupHardwareInput();
    }

    // ==========================================
    // 1. PROCEDURAL AUDIO (Sonidos Matemáticos)
    // ==========================================
    #initAudioSynthesizer() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.#audioCtx = new AudioContext();
    }

    #playCatapultFire() {
        if (this.#audioCtx.state === 'suspended') this.#audioCtx.resume();
        const osc = this.#audioCtx.createOscillator();
        const gain = this.#audioCtx.createGain();
        osc.type = 'square'; // Sonido grueso de madera y tensión
        osc.frequency.setValueAtTime(120, this.#audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.#audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.6, this.#audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.#audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.#audioCtx.destination);
        osc.start();
        osc.stop(this.#audioCtx.currentTime + 0.4);
    }

    #playStoneImpact() {
        if (this.#audioCtx.state === 'suspended') this.#audioCtx.resume();
        const noise = this.#audioCtx.createBufferSource();
        const buffer = this.#audioCtx.createBuffer(1, this.#audioCtx.sampleRate * 0.6, this.#audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1; // Ruido blanco (Escombros)
        noise.buffer = buffer;

        const noiseFilter = this.#audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, this.#audioCtx.currentTime);
        noiseFilter.frequency.linearRampToValueAtTime(50, this.#audioCtx.currentTime + 0.6);

        const noiseGain = this.#audioCtx.createGain();
        noiseGain.gain.setValueAtTime(1.5, this.#audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.#audioCtx.currentTime + 0.6);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.#audioCtx.destination);
        noise.start();
    }

    // ==========================================
    // 2. FÍSICAS Y ESTADO DEL ASEDIO
    // ==========================================
    #initState() {
        this.#state = {
            isActive: false,
            gravity: new Vec2(0, 1200), // Gravedad pesada para rocas reales
            origin: new Vec2(120, 480), // Posición de tu catapulta (Onagro)
            target: { x: 650, y: 350, w: 80, h: 150 }, // Fortaleza enemiga
            score: 0,
            requiredHits: 2, 
            arrowsLeft: 6, // Tienes 6 rocas
            cameraShake: 0,
            mousePos: new Vec2(400, 300) // Rastrear el cursor para auto-apuntar
        };

        const MAX_PARTICLES = 800; // Humo, fuego y escombros
        this.#memory = {
            entities: [], 
            particleBuffer: new Float32Array(MAX_PARTICLES * 5) 
        };
    }

    start() {
        this.#state.isActive = true;
        this.#resize();
        this.#lastTime = performance.now();
        this.#animationFrameId = requestAnimationFrame((ts) => this.#renderLoop(ts));
    }

    destroy() {
        this.#state.isActive = false;
        cancelAnimationFrame(this.#animationFrameId);
        this.#dom.canvas.onpointerdown = null;
        this.#dom.canvas.onpointermove = null;
        if(this.#audioCtx) this.#audioCtx.close();
    }

    // Resolviendo la pantalla negra para siempre
    #resize() {
        this.#dom.canvas.width = 800;
        this.#dom.canvas.height = 600;
        this.#dom.canvas.style.width = '100%';
        this.#dom.canvas.style.maxWidth = '900px';
        this.#dom.canvas.style.aspectRatio = '8 / 6';
        this.#dom.canvas.style.objectFit = 'contain';
        this.#dom.canvas.style.border = '4px solid #4a2511';
        this.#dom.canvas.style.borderRadius = '8px';
    }

    // ==========================================
    // 3. NUEVO CONTROL: POINT & SHOOT
    // ==========================================
    #setupHardwareInput() {
        this.#dom.canvas.style.touchAction = "none"; 

        this.#dom.canvas.addEventListener('pointermove', (e) => {
            if (!this.#state.isActive) return;
            const rect = this.#dom.canvas.getBoundingClientRect();
            // Mapeo perfecto del ratón sin importar el tamaño de tu monitor
            this.#state.mousePos.x = (e.clientX - rect.left) * (800 / rect.width);
            this.#state.mousePos.y = (e.clientY - rect.top) * (600 / rect.height);
        });

        this.#dom.canvas.addEventListener('pointerdown', () => {
            if (this.#state.arrowsLeft <= 0 || !this.#state.isActive) return;
            this.#fireProjectile();
        });
    }

    #calculateBallisticVector() {
        // La fuerza se calcula apuntando DIRECTAMENTE hacia donde tienes el ratón
        const dir = Vec2.sub(this.#state.mousePos, this.#state.origin);
        dir.scale(2.5); // Multiplicador de inercia
        
        // Límite de potencia para no romper las físicas
        const maxSpeed = 1600;
        const speed = Math.hypot(dir.x, dir.y);
        if (speed > maxSpeed) dir.scale(maxSpeed / speed);
        
        return dir;
    }

    #fireProjectile() {
        const velocity = this.#calculateBallisticVector();
        
        this.#memory.entities.push({
            pos: new Vec2(this.#state.origin.x, this.#state.origin.y - 40), 
            vel: velocity,
            trail: []
        });

        this.#state.arrowsLeft--;
        this.#triggerScreenShake(8); 
        this.#playCatapultFire();
    }

    // ==========================================
    // 4. MOTOR DE FÍSICAS (Actualización)
    // ==========================================
    #update(dt) {
        if (!this.#state.isActive) return;

        if (this.#state.cameraShake > 0.1) this.#state.cameraShake *= 0.85;

        for (let i = this.#memory.entities.length - 1; i >= 0; i--) {
            const rock = this.#memory.entities[i];

            rock.vel.x += this.#state.gravity.x * dt;
            rock.vel.y += this.#state.gravity.y * dt;
            rock.pos.x += rock.vel.x * dt;
            rock.pos.y += rock.vel.y * dt;

            // Rastro de la trayectoria
            rock.trail.push(new Vec2(rock.pos.x, rock.pos.y));
            if (rock.trail.length > 15) rock.trail.shift();

            // Instanciar humo y fuego
            this.#spawnFireParticles(rock.pos.x, rock.pos.y, 2);

            // 🎯 COLISIÓN CON EL MURO ENEMIGO
            const t = this.#state.target;
            if (rock.pos.x > t.x && rock.pos.x < t.x + t.w && 
                rock.pos.y > t.y && rock.pos.y < t.y + t.h) {
                this.#processImpact(i);
            } 
            // Eliminar si cae al piso
            else if (rock.pos.y > 550 || rock.pos.x > 850) {
                this.#memory.entities.splice(i, 1); 
                this.#triggerScreenShake(4); 
            }
        }

        // Físicas de Partículas (Memoria Binaria)
        const pBuf = this.#memory.particleBuffer;
        for (let i = 0; i < pBuf.length; i += 5) {
            if (pBuf[i + 4] > 0) { 
                pBuf[i + 2] += this.#state.gravity.x * 0.1 * dt; // Humo flota un poco
                pBuf[i + 3] += this.#state.gravity.y * 0.1 * dt; 
                pBuf[i] += pBuf[i + 2] * dt;               
                pBuf[i + 1] += pBuf[i + 3] * dt;           
                pBuf[i + 4] -= dt * 1.2;                   
            }
        }

        if (this.#state.score >= this.#state.requiredHits && this.#memory.entities.length === 0) {
            this.#endPhase(true);
        } else if (this.#state.arrowsLeft === 0 && this.#memory.entities.length === 0) {
            this.#endPhase(false);
        }
    }

    // ==========================================
    // 5. RENDERIZADO VISUAL (Gráficos)
    // ==========================================
    #renderLoop(timestamp) {
        if (!this.#state.isActive) return;

        const dt = Math.min((timestamp - this.#lastTime) / 1000, 0.05);
        this.#lastTime = timestamp;

        this.#update(dt);

        // 🌅 CIELO DE ATARDECER BÉLICO
        const skyGrad = this.#ctx.createLinearGradient(0, 0, 0, 600);
        skyGrad.addColorStop(0, '#1a1025'); // Cielo nocturno arriba
        skyGrad.addColorStop(0.6, '#8b2e16'); // Atardecer fuego
        skyGrad.addColorStop(1, '#4a1506');
        this.#ctx.fillStyle = skyGrad;
        this.#ctx.fillRect(0, 0, 800, 600);
        
        this.#ctx.save();
        if (this.#state.cameraShake > 0.1) {
            const dx = (Math.random() - 0.5) * this.#state.cameraShake;
            const dy = (Math.random() - 0.5) * this.#state.cameraShake;
            this.#ctx.translate(dx, dy);
        }

        this.#drawEnvironment();
        this.#drawPredictiveTrajectory(); // LÍNEA DE APUNTADO
        this.#drawProjectiles();
        
        this.#ctx.globalCompositeOperation = 'lighter';
        this.#drawParticles();

        this.#ctx.restore();
        this.#ctx.globalCompositeOperation = 'source-over';
        this.#drawUI();

        this.#animationFrameId = requestAnimationFrame((ts) => this.#renderLoop(ts));
    }

    // 🎯 ASISTENTE DE TIRO: Dibuja por dónde irá la piedra
    #drawPredictiveTrajectory() {
        if (this.#state.arrowsLeft <= 0 || this.#memory.entities.length > 0) return;

        const vel = this.#calculateBallisticVector();
        let px = this.#state.origin.x;
        let py = this.#state.origin.y - 40;
        const simDt = 0.04; 

        this.#ctx.beginPath();
        this.#ctx.moveTo(px, py);
        this.#ctx.strokeStyle = 'rgba(255, 204, 0, 0.6)'; // Línea dorada
        this.#ctx.setLineDash([10, 10]);
        this.#ctx.lineWidth = 3;

        for (let i = 0; i < 50; i++) {
            vel.x += this.#state.gravity.x * simDt;
            vel.y += this.#state.gravity.y * simDt;
            px += vel.x * simDt;
            py += vel.y * simDt;
            this.#ctx.lineTo(px, py);
            if (py > 550) break; // Terminar si toca el piso
        }
        this.#ctx.stroke();
        this.#ctx.setLineDash([]); 
    }

    #drawEnvironment() {
        // ⛰️ TERRENO
        this.#ctx.fillStyle = '#1c130d'; 
        this.#ctx.fillRect(0, 500, 800, 100);
        this.#ctx.beginPath();
        this.#ctx.moveTo(500, 500);
        this.#ctx.lineTo(600, 350);
        this.#ctx.lineTo(800, 350);
        this.#ctx.lineTo(800, 500);
        this.#ctx.fill();

        // 🛡️ ESTANDARTE SPQR
        this.#ctx.fillStyle = '#9e1b1b'; 
        this.#ctx.fillRect(30, 380, 40, 120);
        this.#ctx.fillStyle = '#ffcc00';
        this.#ctx.font = 'bold 12px serif';
        this.#ctx.fillText('S P Q R', 32, 400);

        // 🪵 ONAGRO ROMANO (Catapulta)
        this.#ctx.fillStyle = '#4a2b15'; 
        this.#ctx.fillRect(this.#state.origin.x - 30, this.#state.origin.y - 10, 60, 30); 
        this.#ctx.beginPath();
        this.#ctx.arc(this.#state.origin.x - 15, this.#state.origin.y + 20, 15, 0, Math.PI*2); 
        this.#ctx.arc(this.#state.origin.x + 15, this.#state.origin.y + 20, 15, 0, Math.PI*2);
        this.#ctx.fillStyle = '#221105';
        this.#ctx.fill();
        
        // Brazo dinámico
        const aimAngle = Math.atan2(this.#state.mousePos.y - this.#state.origin.y, this.#state.mousePos.x - this.#state.origin.x);
        this.#ctx.save();
        this.#ctx.translate(this.#state.origin.x, this.#state.origin.y);
        this.#ctx.rotate(aimAngle);
        this.#ctx.fillStyle = '#6b3e1f';
        this.#ctx.fillRect(0, -5, 50, 10); 
        this.#ctx.restore();

        // 🏰 FORTALEZA BÁRBARA
        const t = this.#state.target;
        this.#ctx.fillStyle = '#5a5a5a'; 
        this.#ctx.fillRect(t.x, t.y, t.w, t.h);
        
        // Grietas por daño
        if (this.#state.score > 0) {
            this.#ctx.strokeStyle = '#222';
            this.#ctx.lineWidth = 3;
            this.#ctx.beginPath();
            this.#ctx.moveTo(t.x + 10, t.y + 20);
            this.#ctx.lineTo(t.x + 40, t.y + 80);
            this.#ctx.lineTo(t.x + 70, t.y + 140);
            this.#ctx.stroke();
            this.#spawnFireParticles(t.x + 40, t.y + 100, 1); // El muro arde
        }
    }

    #drawProjectiles() {
        for (const rock of this.#memory.entities) {
            // Estela de humo gris
            this.#ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
            this.#ctx.lineWidth = 6;
            this.#ctx.lineCap = 'round';
            this.#ctx.beginPath();
            for (let i = 0; i < rock.trail.length; i++) {
                if (i === 0) this.#ctx.moveTo(rock.trail[i].x, rock.trail[i].y);
                else this.#ctx.lineTo(rock.trail[i].x, rock.trail[i].y);
            }
            this.#ctx.stroke();

            // La Roca
            this.#ctx.fillStyle = '#ff6600'; 
            this.#ctx.beginPath();
            this.#ctx.arc(rock.pos.x, rock.pos.y, 14, 0, Math.PI * 2);
            this.#ctx.fill();
            this.#ctx.fillStyle = '#fff'; 
            this.#ctx.beginPath();
            this.#ctx.arc(rock.pos.x, rock.pos.y, 7, 0, Math.PI * 2);
            this.#ctx.fill();
        }
    }

    #spawnFireParticles(px, py, amount) {
        const pBuf = this.#memory.particleBuffer;
        let spawned = 0;
        for (let i = 0; i < pBuf.length; i += 5) {
            if (pBuf[i + 4] <= 0) { 
                pBuf[i] = px + (Math.random() * 20 - 10);     
                pBuf[i + 1] = py + (Math.random() * 20 - 10); 
                pBuf[i + 2] = (Math.random() - 0.5) * 100; 
                pBuf[i + 3] = (Math.random() - 1.0) * 150; 
                pBuf[i + 4] = 0.5 + Math.random() * 0.8;   
                if (++spawned >= amount) break; 
            }
        }
    }

    #drawParticles() {
        const pBuf = this.#memory.particleBuffer;
        for (let i = 0; i < pBuf.length; i += 5) {
            const life = pBuf[i + 4];
            if (life > 0) {
                // Color procedural: Amarillo -> Fuego -> Humo gris oscuro
                let color = `rgba(255, 200, 0, ${life})`; 
                if (life < 0.6) color = `rgba(255, 50, 0, ${life})`; 
                if (life < 0.3) color = `rgba(80, 80, 80, ${life})`; 

                this.#ctx.fillStyle = color;
                this.#ctx.beginPath();
                this.#ctx.arc(pBuf[i], pBuf[i + 1], 12 * life, 0, Math.PI * 2);
                this.#ctx.fill();
            }
        }
    }

    #drawUI() {
        this.#ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.#ctx.fillRect(0, 0, 800, 60);
        
        this.#ctx.fillStyle = '#ffcc00'; // Oro Romano
        this.#ctx.font = 'bold 22px "Cinzel", serif, Arial';
        this.#ctx.fillText('⚔️ ASEDIO ROMANO', 20, 30);
        
        this.#ctx.fillStyle = '#ffffff';
        this.#ctx.font = '16px Arial';
        this.#ctx.fillText(`Misión: Destruye el muro. Impactos: ${this.#state.score} / ${this.#state.requiredHits}`, 20, 50);
        
        this.#ctx.fillStyle = this.#state.arrowsLeft <= 2 ? '#ff3333' : '#00ffcc';
        this.#ctx.font = 'bold 20px Arial';
        this.#ctx.fillText(`ROCAS INCENDIARIAS: ${this.#state.arrowsLeft}`, 530, 35);

        if (this.#memory.entities.length === 0 && this.#state.score === 0 && this.#state.arrowsLeft === 6) {
            this.#ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.#ctx.font = 'bold 24px Arial';
            this.#ctx.textAlign = 'center';
            this.#ctx.fillText('¡MUEVE EL RATÓN PARA APUNTAR Y HAZ CLICK PARA DISPARAR!', 400, 200);
            this.#ctx.textAlign = 'left';
        }
    }

    #processImpact(entityIndex) {
        const rock = this.#memory.entities[entityIndex];
        this.#memory.entities.splice(entityIndex, 1);
        this.#state.score++;
        this.#triggerScreenShake(30); 
        this.#playStoneImpact();

        // Explosión masiva de la pared
        const pBuf = this.#memory.particleBuffer;
        let spawned = 0;
        for (let i = 0; i < pBuf.length; i += 5) {
            if (pBuf[i + 4] <= 0) { 
                pBuf[i] = rock.pos.x;     
                pBuf[i + 1] = rock.pos.y; 
                pBuf[i + 2] = (Math.random() - 0.8) * 800; // Caen hacia ti
                pBuf[i + 3] = (Math.random() - 1.0) * 800; 
                pBuf[i + 4] = 1.0 + Math.random() * 1.0;   
                if (++spawned >= 150) break; 
            }
        }
    }

    #triggerScreenShake(intensity) {
        this.#state.cameraShake = Math.max(this.#state.cameraShake, intensity);
    }

    #endPhase(success) {
        this.destroy(); 
        setTimeout(() => this.#onComplete(success), 1500); 
    }
}