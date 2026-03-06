/**
 * AETHER-ROME: MICRO-KERNEL BOOTSTRAP v9.0 (GOD TIER)
 * Architecture: Event-Driven Ignition, Hardware Diagnostics, WebPerf Telemetry
 * Security: CSP-Compliant Error Boundaries (Zero innerHTML interpolation)
 */
import { RomanEngine } from './engine.js';
import { AudioSystem } from './audio_engine.js';

class SystemBootstrap {
    /**
     * Secuencia de Ignición Asíncrona del Sistema
     */
    static async ignite() {
        try {
            // 1. TELEMETRÍA: Iniciar rastreo de rendimiento
            performance.mark('boot-start');
            console.group("%c[AETHER-ROME] Initializing Kernel...", "color: #b89b5e; font-weight: bold; background: #0a0a0c; padding: 4px; border: 1px solid #b89b5e;");

            // 2. DIAGNÓSTICO DE HARDWARE: Chequeo de compatibilidad
            this.#runHardwareDiagnostics();

            // 3. DESBLOQUEO DE AUDIO (Requisito estricto de navegadores modernos)
            console.log("Unlocking Audio Subsystem...");
            AudioSystem.unlock();

            // 4. YIELDING: Ceder el hilo principal para que el navegador pinte la UI sin congelarse
            console.log("Allocating Memory & Yielding Main Thread...");
            await this.#yieldToMain(); 

            // 5. INSTANCIACIÓN DEL MOTOR
            console.log("Mounting Core Engine...");
            const AetherInstance = new RomanEngine();
            
            console.log("Executing Boot Sequence...");
            AetherInstance.boot();

            // 6. EVALUACIÓN DE RENDIMIENTO (Time To Interactive)
            performance.mark('boot-end');
            performance.measure('Boot Sequence', 'boot-start', 'boot-end');
            const bootTime = performance.getEntriesByName('Boot Sequence')[0].duration.toFixed(2);
            
            console.log(`%c✔ SYSTEM ONLINE (Time-To-Interactive: ${bootTime}ms)`, "color: #00ffcc; font-weight: bold;");
            console.groupEnd();

            // 7. PROTECCIÓN DE MEMORIA: Congelar la instancia para evitar manipulaciones externas en consola
            Object.freeze(AetherInstance);

        } catch (error) {
            console.groupEnd();
            this.#triggerFatalPanic(error);
        }
    }

    // ==========================================
    // RUTINAS DEL KERNEL (Sub-Routines)
    // ==========================================

    static #runHardwareDiagnostics() {
        const missing = [];
        if (!window.AudioContext && !window.webkitAudioContext) missing.push("Web Audio API");
        if (!window.speechSynthesis) missing.push("Speech Synthesis Engine");
        if (!document.createElement('canvas').getContext('2d')) missing.push("HTML5 Canvas 2D");
        
        if (missing.length > 0) {
            throw new Error(`Incompatible Hardware/Browser detected. Missing Modules: [${missing.join(', ')}]`);
        }
        console.log("Hardware Diagnostics: PASSED");
    }

    static #yieldToMain() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    /**
     * BSoD (Blue Screen of Death) - Versión Sci-Fi Vintage.
     * Crea nodos de forma segura para evitar ataques XSS por interpolación.
     */
    static #triggerFatalPanic(error) {
        console.error("%c🔥 KERNEL PANIC:", "color: #ff3366; font-size: 1.2rem; font-weight: bold;", error);

        // Limpiar el DOM de forma segura
        document.body.textContent = ''; 
        
        // Estilos de Emergencia inyectados de forma programática
        Object.assign(document.body.style, {
            backgroundColor: '#0a0a0c',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: '"Share Tech Mono", monospace, Courier',
            margin: '0',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 51, 102, 0.05) 2px, rgba(255, 51, 102, 0.05) 4px)'
        });

        const container = document.createElement('div');
        Object.assign(container.style, {
            textAlign: 'center',
            border: '1px solid #ff3366',
            padding: '40px 60px',
            backgroundColor: 'rgba(20, 10, 15, 0.9)',
            boxShadow: '0 0 30px rgba(255, 51, 102, 0.3)'
        });

        const title = document.createElement('h1');
        title.textContent = 'SYSTEM FAILURE';
        title.style.color = '#ff3366';
        title.style.margin = '0 0 20px 0';
        title.style.letterSpacing = '5px';

        const msg = document.createElement('p');
        msg.textContent = error.message;
        msg.style.color = '#fff';
        msg.style.fontSize = '1.2rem';

        const sub = document.createElement('p');
        sub.textContent = 'Check DevTools Console (F12) for stack trace & Neural Link status.';
        sub.style.color = '#888';
        sub.style.marginTop = '25px';
        sub.style.fontSize = '0.9rem';

        container.append(title, msg, sub);
        document.body.appendChild(container);
    }
}

// ==========================================
// EL ENLACE DE RADIO (Event-Driven Ignition)
// ==========================================
// En lugar de arrancar solo, el Kernel espera la señal del Bootloader del HTML
window.addEventListener('aether-ignite', () => {
    SystemBootstrap.ignite();
});