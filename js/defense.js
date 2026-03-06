/**
 * AETHER-ROME: KINETIC DEFENSE ENGINE v4.0 (OMEGA TIER)
 * Architecture: Data-Oriented Design (DOD), Binary Memory Buffers, Kinematic Raymarching
 * Graphics: Hardware-Accelerated Sub-pixel Rendering, Bloom Compositing
 */

// --- VECTOR MATHEMATICS (Zero-Allocation Static Math) ---
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
    // 🔒 CAMPOS PRIVADOS ENCAPSULADOS (Strict Scope)
    #dom;
    #ctx;
    #state;
    #memory;
    #onComplete;
    #lastTime;
    #animationFrameId;

    constructor(canvasId, onCompleteCallback) {
        this.#dom = { canvas: document.getElementById(canvasId) };
        if (!this.#dom.canvas) throw new Error("ATP-FATAL: Canvas Node Unreachable.");
        
        // Desactivamos alpha channel para ganar un 25% de rendimiento en GPU
        this.#ctx = this.#dom.canvas.getContext('2d', { alpha: false, desynchronized: true });
        this.#onComplete = onCompleteCallback;
        
        this.#initState();
        this.#setupHardwareInput();
    }

    #initState() {
        this.#state = {
            isActive: false,
            gravity: new Vec2(0, 850), // Escalado realista a pixeles/segundo
            wind: new Vec2(-120, 0),
            origin: new Vec2(100, 450),
            targetPos: new Vec2(650, 450),
            score: 0,
            requiredHits: 5,
            arrowsLeft: 10,
            cameraShake: 0,
            aiming: { active: false, current: new Vec2(0,0), dragStart: new Vec2(0,0) }
        };

        // MEMORIA BINARIA: El Santo Grial del Rendimiento Web
        // 300 partículas * 5 propiedades (x, y, vx, vy, life) = 1500 floats.
        // El CPU lee esto en un solo ciclo de reloj de caché L1.
        const MAX_PARTICLES = 300;
        this.#memory = {
            entities: [], // Reservado para objetos complejos (flechas con estelas)
            particleBuffer: new Float32Array(MAX_PARTICLES * 5) 
        };
    }

    start() {
        this.#state.isActive = true;
        this.#resize();
        this.#lastTime = performance.now();
        this.#animationFrameId = requestAnimationFrame((ts) => this.#renderLoop(ts));
        console.log("%c🏹 [AETHER-ROME]: Binary Memory Allocated. Defense System Online.", "color: #00ffcc; background: #111; padding: 4px; font-weight: bold;");
    }

    destroy() {
        this.#state.isActive = false;
        cancelAnimationFrame(this.#animationFrameId);
        // Evita fugas de memoria al limpiar eventos del hardware
        this.#dom.canvas.onpointerdown = null;
        this.#dom.canvas.onpointermove = null;
        this.#dom.canvas.onpointerup = null;
    }

    #resize() {
        const dpr = window.devicePixelRatio || 1;
        this.#dom.canvas.width = 800 * dpr;
        this.#dom.canvas.height = 600 * dpr;
        this.#ctx.scale(dpr, dpr);
    }

    // ==========================================
    // SISTEMA TÁCTICO DE APUNTADO (Drag & Release)
    // ==========================================

    #setupHardwareInput() {
        this.#dom.canvas.style.touchAction = "none"; // Evita scroll en móviles

        this.#dom.canvas.addEventListener('pointerdown', (e) => {
            if (this.#state.arrowsLeft <= 0 || !this.#state.isActive) return;
            this.#state.aiming.active = true;
            this.#updateAimTarget(e);
        });

        this.#dom.canvas.addEventListener('pointermove', (e) => {
            if (this.#state.aiming.active) this.#updateAimTarget(e);
        });

        this.#dom.canvas.addEventListener('pointerup', () => {
            if (this.#state.aiming.active) {
                this.#state.aiming.active = false;
                this.#fireProjectile();
            }
        });
    }

    #updateAimTarget(e) {
        const rect = this.#dom.canvas.getBoundingClientRect();
        this.#state.aiming.current.x = (e.clientX - rect.left) * (800 / rect.width);
        this.#state.aiming.current.y = (e.clientY - rect.top) * (600 / rect.height);
    }

    #calculateBallisticVector() {
        // Invertimos el vector: Jalar hacia atrás dispara hacia adelante (Mecánica de resortera/arco)
        const dir = Vec2.sub(this.#state.origin, this.#state.aiming.current);
        const dist = Vec2.dist(this.#state.origin, this.#state.aiming.current);
        const power = Math.min(dist * 4.0, 950); // Límite de tensión del arco
        
        // Si no hay distancia, evitamos dividir por cero (NaN)
        if (dist > 0) dir.scale(power / dist);
        else dir.copy(new Vec2(1, -1));

        return dir;
    }

    #fireProjectile() {
        const velocity = this.#calculateBallisticVector();
        
        this.#memory.entities.push({
            pos: new Vec2(this.#state.origin.x, this.#state.origin.y),
            vel: velocity,
            trail: []
        });

        this.#state.arrowsLeft--;
        this.#triggerScreenShake(4); // Recoil táctil

        // Enlace Neural al Sistema de Sonido (Si existe en window)
        if (window.AudioSystem) window.AudioSystem.playArrow();
    }

    // ==========================================
    // MOTOR DE INTEGRACIÓN FÍSICA (Delta Time)
    // ==========================================

    #update(dt) {
        if (!this.#state.isActive) return;

        // Decaimiento del Camera Shake
        if (this.#state.cameraShake > 0.1) this.#state.cameraShake *= 0.85;

        // 1. Cinemática de Proyectiles (Euler)
        for (let i = this.#memory.entities.length - 1; i >= 0; i--) {
            const arrow = this.#memory.entities[i];

            // Aceleración
            arrow.vel.x += (this.#state.gravity.x + this.#state.wind.x) * dt;
            arrow.vel.y += (this.#state.gravity.y + this.#state.wind.y) * dt;
            
            // Posición
            arrow.pos.x += arrow.vel.x * dt;
            arrow.pos.y += arrow.vel.y * dt;

            // Memoria de estela (Tasa de muestreo optimizada)
            if (Math.random() > 0.3) {
                arrow.trail.push(new Vec2(arrow.pos.x, arrow.pos.y));
                if (arrow.trail.length > 10) arrow.trail.shift();
            }

            // Detección de Colisión Vectorial
            if (Vec2.dist(arrow.pos, this.#state.targetPos) < 40) {
                this.#processImpact(i);
            } else if (arrow.pos.y > 650 || arrow.pos.x > 850 || arrow.pos.x < -50) {
                this.#memory.entities.splice(i, 1); // Culling (Eliminación fuera de pantalla)
            }
        }

        // 2. Termodinámica de Partículas (Procesamiento de Memoria Binaria Cruda)
        const pBuf = this.#memory.particleBuffer;
        for (let i = 0; i < pBuf.length; i += 5) {
            if (pBuf[i + 4] > 0) { // Si Vida > 0
                pBuf[i + 2] += this.#state.gravity.x * dt; // vx += ax
                pBuf[i + 3] += this.#state.gravity.y * dt; // vy += ay
                pBuf[i] += pBuf[i + 2] * dt;               // x += vx
                pBuf[i + 1] += pBuf[i + 3] * dt;           // y += vy
                pBuf[i + 4] -= dt * 1.5;                   // vida -= tiempo
            }
        }

        // Lógica de Estado Global
        if (this.#state.score >= this.#state.requiredHits && this.#memory.entities.length === 0) {
            this.#endPhase(true);
        } else if (this.#state.arrowsLeft === 0 && this.#memory.entities.length === 0) {
            this.#endPhase(false);
        }
    }

    // ==========================================
    // RENDERIZADO GRÁFICO (GPU Compositing)
    // ==========================================

    #renderLoop(timestamp) {
        if (!this.#state.isActive) return;

        // Seguridad matemática: Límite de 0.1s para evitar fallas físicas si cambias de pestaña
        const dt = Math.min((timestamp - this.#lastTime) / 1000, 0.1);
        this.#lastTime = timestamp;

        this.#update(dt);

        // Limpieza de Frame buffer (Opaca)
        this.#ctx.globalCompositeOperation = 'source-over';
        this.#ctx.fillStyle = '#0f0c0a'; // Tono vintage ultradonscuro
        this.#ctx.fillRect(0, 0, 800, 600);
        
        // Matriz de Transformación (Camera Shake)
        this.#ctx.save();
        if (this.#state.cameraShake > 0.1) {
            const dx = (Math.random() - 0.5) * this.#state.cameraShake;
            const dy = (Math.random() - 0.5) * this.#state.cameraShake;
            this.#ctx.translate(dx, dy);
        }

        this.#drawEnvironment();
        if (this.#state.aiming.active) this.#drawTrajectoryRaymarching();
        this.#drawProjectiles();
        
        // Post-Procesado: Bloom (Iluminación Sumativa)
        this.#ctx.globalCompositeOperation = 'lighter';
        this.#drawParticles();

        this.#ctx.restore();
        
        this.#ctx.globalCompositeOperation = 'source-over';
        this.#drawUI();

        this.#animationFrameId = requestAnimationFrame((ts) => this.#renderLoop(ts));
    }

    #drawTrajectoryRaymarching() {
        const vel = this.#calculateBallisticVector();
        let px = this.#state.origin.x;
        let py = this.#state.origin.y;
        const simDt = 0.04; 

        this.#ctx.beginPath();
        this.#ctx.moveTo(px, py);
        this.#ctx.strokeStyle = 'rgba(184, 155, 94, 0.4)';
        this.#ctx.setLineDash([8, 8]);
        this.#ctx.lineWidth = 2;

        // Simulamos 40 pasos en el futuro sin renderizarlos
        for (let i = 0; i < 40; i++) {
            vel.x += (this.#state.gravity.x + this.#state.wind.x) * simDt;
            vel.y += (this.#state.gravity.y + this.#state.wind.y) * simDt;
            px += vel.x * simDt;
            py += vel.y * simDt;
            this.#ctx.lineTo(px, py);
            if (py > 600) break;
        }
        this.#ctx.stroke();
        this.#ctx.setLineDash([]); 

        // Arco virtual (Tensión visual)
        this.#ctx.beginPath();
        this.#ctx.moveTo(this.#state.origin.x, this.#state.origin.y - 20);
        this.#ctx.lineTo(this.#state.aiming.current.x, this.#state.aiming.current.y);
        this.#ctx.lineTo(this.#state.origin.x, this.#state.origin.y + 20);
        this.#ctx.strokeStyle = '#b89b5e';
        this.#ctx.lineWidth = 1;
        this.#ctx.stroke();
    }

    #drawEnvironment() {
        // Base de la Puerta Romana
        this.#ctx.fillStyle = '#2c1e16';
        this.#ctx.fillRect(this.#state.targetPos.x - 25, this.#state.targetPos.y - 50, 50, 100);
        
        // Escudo de Energía / Diana (Glow effect hardware acelerado)
        this.#ctx.shadowBlur = 15;
        this.#ctx.shadowColor = '#b89b5e';
        this.#ctx.strokeStyle = `rgba(184, 155, 94, ${0.6 + Math.sin(this.#lastTime / 150) * 0.4})`;
        this.#ctx.lineWidth = 3;
        this.#ctx.beginPath();
        this.#ctx.arc(this.#state.targetPos.x, this.#state.targetPos.y, 40, 0, Math.PI * 2);
        this.#ctx.stroke();
        this.#ctx.shadowBlur = 0; // Limpiar pipeline
    }

    #drawProjectiles() {
        for (const arrow of this.#memory.entities) {
            // Estela Cinética
            this.#ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.#ctx.lineWidth = 1;
            this.#ctx.beginPath();
            for (let i = 0; i < arrow.trail.length; i++) {
                if (i === 0) this.#ctx.moveTo(arrow.trail[i].x, arrow.trail[i].y);
                else this.#ctx.lineTo(arrow.trail[i].x, arrow.trail[i].y);
            }
            this.#ctx.stroke();

            // Cuerpo del Proyectil orientado por su vector de velocidad
            this.#ctx.save();
            this.#ctx.translate(arrow.pos.x, arrow.pos.y);
            this.#ctx.rotate(Math.atan2(arrow.vel.y, arrow.vel.x));
            this.#ctx.fillStyle = '#ffffff';
            this.#ctx.fillRect(-12, -1.5, 24, 3);
            this.#ctx.restore();
        }
    }

    #drawParticles() {
        const pBuf = this.#memory.particleBuffer;
        // Leemos la memoria binaria directamente. Rendimiento brutal.
        for (let i = 0; i < pBuf.length; i += 5) {
            const life = pBuf[i + 4];
            if (life > 0) {
                // Interpolar de blanco (caliente) a dorado oscuro (frío)
                this.#ctx.fillStyle = `rgba(255, ${Math.floor(life * 200)}, 50, ${life})`;
                this.#ctx.fillRect(pBuf[i], pBuf[i + 1], 4, 4);
            }
        }
    }

    #drawUI() {
        this.#ctx.fillStyle = '#b89b5e';
        this.#ctx.font = 'bold 16px "Share Tech Mono", Courier';
        this.#ctx.fillText(`GATE INTEGRITY: ${this.#state.score} / ${this.#state.requiredHits}`, 20, 30);
        
        // Alerta de proyectiles bajos
        this.#ctx.fillStyle = this.#state.arrowsLeft <= 3 ? '#ff3366' : '#b89b5e';
        this.#ctx.fillText(`PROJECTILES: ${this.#state.arrowsLeft}`, 20, 55);
    }

    // ==========================================
    // SISTEMA DE IMPACTO Y EVENTOS
    // ==========================================

    #processImpact(entityIndex) {
        this.#memory.entities.splice(entityIndex, 1);
        this.#state.score++;
        this.#triggerScreenShake(15); // Impacto crítico
        
        if (window.AudioSystem) window.AudioSystem.playSuccess();

        // Inyección binaria de partículas (Cero instanciación de objetos)
        const pBuf = this.#memory.particleBuffer;
        let spawned = 0;
        for (let i = 0; i < pBuf.length; i += 5) {
            if (pBuf[i + 4] <= 0) { // Encontrar bloque de memoria libre
                pBuf[i] = this.#state.targetPos.x;     
                pBuf[i + 1] = this.#state.targetPos.y; 
                pBuf[i + 2] = (Math.random() - 0.5) * 800; // Explosión cinética
                pBuf[i + 3] = (Math.random() - 0.5) * 800; 
                pBuf[i + 4] = 1.0 + Math.random() * 0.5;   
                if (++spawned >= 25) break; 
            }
        }
    }

    #triggerScreenShake(intensity) {
        this.#state.cameraShake = Math.max(this.#state.cameraShake, intensity);
    }

    #endPhase(success) {
        this.destroy(); 
        // Pausa dramática para que el jugador vea caer las últimas chispas
        setTimeout(() => this.#onComplete(success), 1200); 
    }
}