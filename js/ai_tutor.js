/**
 * AETHER-ROME NEURAL LINK: OMNISCIENT ANTI-FAILURE ENGINE v17.0 (GOD TIER)
 * Architecture: 
 * - Smart Proxy Routing (CORS Bypass)
 * - HUD Visual Diagnostics (Zero Guessing)
 * - Distributed State Circuit Breaker & SHA-256 Memoization
 * - Hard-Kill Audio Garbage Collection
 */
import axios from 'axios';

// ==========================================
// 🛡️ SCHEMA DEFINITIONS (Type Safety Guard)
// ==========================================
const SCHEMAS = {
    LEVEL: ['lesson', 'question', 'options', 'answerIndex'],
    SUPPORT: ['diagnostico', 'concepto_clave', 'analogia']
};

export class AITutor {
    #apiKey;
    #apiEndpoint;
    #neuralCache;
    #activeRequests;
    #cachedVoices;
    #ttsInterval; // Tracker para el colector de basura de audio
    
    // Fallback & Resilience State
    #isOfflineMode;
    #circuitState; 
    #circuitFailureCount;
    #circuitThreshold = 3; 
    #circuitResetTimeout = 30000; 
    #lastFailureTime;
    #lastError; // Almacena el error para el HUD

    constructor(apiKey) {
        // 🔥 1. ENRUTAMIENTO INTELIGENTE (CORS BYPASS AUTÓNOMO)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.#apiEndpoint = isLocalhost 
            ? '/api/deepseek/chat/completions' 
            : 'https://api.deepseek.com/chat/completions';

        this.#neuralCache = new Map(); 
        this.#activeRequests = new Map(); 
        this.#cachedVoices = [];
        this.#circuitState = 'CLOSED';
        this.#circuitFailureCount = 0;
        this.#lastFailureTime = 0;
        this.#ttsInterval = null;
        this.#lastError = null;

        // 🔥 2. INYECCIÓN SEGURA DE LLAVE (Con respaldo duro de tu llave para evitar fallos de Vite)
        const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEEPSEEK_API_KEY) || '';
        this.#apiKey = apiKey || envKey || 'sk-2a7f2964d1e34ebe90f176a986367360';

        if (!this.#apiKey || this.#apiKey === 'tu_api_key_aqui') {
            this.#isOfflineMode = true;
        } else {
            this.#isOfflineMode = false;
        }

        this.#initAdvancedVoiceEngine();
    }

    // ==========================================
    // HARDWARE BINDING & AUDIO EXTERMINATOR
    // ==========================================

    #initAdvancedVoiceEngine() {
        if (!('speechSynthesis' in window)) return;
        const loadVoices = () => { 
            this.#cachedVoices = window.speechSynthesis.getVoices().sort((a, b) => {
                if (a.localService && !b.localService) return -1;
                return 0;
            }); 
        };
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;
    }

    silence() {
        if (this.#ttsInterval) {
            clearInterval(this.#ttsInterval);
            this.#ttsInterval = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
        }
    }

    speak(text, lang) {
        this.silence(); // Matar cualquier audio anterior preventivamente
        if (!('speechSynthesis' in window) || !text) return;

        // Limpieza de inyecciones HTML del sistema Antifallas para que no las lea en voz alta
        const cleanText = text.replace(/<[^>]*>?/gm, ''); 

        const msg = new SpeechSynthesisUtterance(cleanText);
        msg.lang = lang;
        msg.rate = 0.95;  
        msg.pitch = 0.90; 
        
        const shortLang = lang.split('-')[0]; 
        const preferredVoice = this.#cachedVoices.find(v => v.lang.startsWith(shortLang) && v.localService) 
                            || this.#cachedVoices.find(v => v.lang.startsWith(shortLang));
        if (preferredVoice) msg.voice = preferredVoice;

        msg.onstart = () => {
            this.#ttsInterval = setInterval(() => {
                if (!window.speechSynthesis.paused) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000); 
        };
        msg.onend = () => this.silence();
        msg.onerror = () => this.silence();

        window.speechSynthesis.speak(msg);
    }

    // ==========================================
    // CRYPTOGRAPHIC MEMOIZATION (SHA-256)
    // ==========================================

    async #generateCryptoHash(context, lang) {
        const msgUint8 = new TextEncoder().encode(`${lang}_${context}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ==========================================
    // PROCEDURAL GENERATION (El Núcleo)
    // ==========================================
    
    async generateLevel(promptSeed, lang) {
        // Si hay un error crítico previo, lanzamos el HUD Antifallas
        if (this.#isOfflineMode) return this.#renderErrorToUI({ message: "API Key Ausente o Inválida" }, "Validación de Entorno");
        if (this.#isCircuitOpen()) return this.#renderErrorToUI(this.#lastError || { message: "Circuit Breaker OPEN: Demasiados fallos de red." }, "Protección de Hilo Principal");

        const hash = await this.#generateCryptoHash(`lvl_${promptSeed}`, lang);
        if (this.#neuralCache.has(hash)) return this.#neuralCache.get(hash);

        this.#abortPendingRequest(hash);
        const controller = new AbortController();
        this.#activeRequests.set(hash, controller);

        const systemPrompt = `You are a high-performance EdTech engine teaching Roman History. Topic: "${promptSeed}". Language: ${lang}.
        Generate a micro-class and a multiple-choice question.
        CRITICAL: Respond ONLY with a valid JSON object. No markdown.
        JSON SCHEMA:
        {
            "lesson": "A deep, engaging 3-sentence explanation.",
            "question": "A challenging multiple choice question.",
            "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
            "answerIndex": [Integer 0-3]
        }`;

        const payload = {
            model: "deepseek-chat",
            temperature: 0.6, 
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: systemPrompt }]
        };

        try {
            console.log(`⚡ [NEURAL LINK]: Conectando vía ${this.#apiEndpoint}...`);
            const response = await this.#fetchWithResilience(payload, controller.signal);
            const parsedData = this.#validateAndParseJSON(response.data.choices[0].message.content, SCHEMAS.LEVEL);
            
            this.#registerSuccess();
            this.#neuralCache.set(hash, parsedData);
            return parsedData;

        } catch (error) {
            if (axios.isCancel(error)) return null;
            this.#registerFailure(error);
            // 🔥 DISPARA EL HUD VISUAL EN LA PIZARRA
            return this.#renderErrorToUI(error, "Inferencia Generativa DeepSeek");
        } finally {
            this.#activeRequests.delete(hash);
        }
    }

    // ==========================================
    // MICRO-CLASS SUPPORT
    // ==========================================

    async getPedagogicalSupport(failedQuestion, lang) {
        if (this.#isOfflineMode || this.#isCircuitOpen()) {
            return `⚠️ [SISTEMA BLOQUEADO] El enlace con la IA está caído. Código de falla registrado en la pantalla principal.`;
        }

        const hash = await this.#generateCryptoHash(`sup_${failedQuestion}`, lang);
        if (this.#neuralCache.has(hash)) return this.#neuralCache.get(hash);

        const systemPrompt = `You are a strict Roman History AI. Language: ${lang}.
        Student failed: "${failedQuestion}".
        CRITICAL: Respond ONLY with JSON. No markdown.
        JSON SCHEMA:
        {"diagnostico": "Brief explanation.", "concepto_clave": "The correct fact.", "analogia": "A modern analogy."}`;

        const payload = {
            model: "deepseek-chat",
            temperature: 0.5,
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: systemPrompt }]
        };

        try {
            const response = await this.#fetchWithResilience(payload, null);
            const parsedData = this.#validateAndParseJSON(response.data.choices[0].message.content, SCHEMAS.SUPPORT);
            const text = `${parsedData.diagnostico} ${parsedData.concepto_clave} ${parsedData.analogia}`;
            this.#registerSuccess();
            this.#neuralCache.set(hash, text);
            return text;
        } catch (error) {
            this.#registerFailure(error);
            const diag = this.#parseErrorInfo(error);
            return `⚠️ [SISTEMA AISLADO] La IA falló al generar la micro-clase.\nCódigo: ${diag.code}\nRazón: ${diag.message}`;
        }
    }

    // ==========================================
    // RESILIENCE INFRASTRUCTURE & CIRCUIT BREAKER
    // ==========================================

    async #fetchWithResilience(payload, signal, maxRetries = 1) {
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await axios.post(this.#apiEndpoint, payload, {
                    headers: { 'Authorization': `Bearer ${this.#apiKey}`, 'Content-Type': 'application/json' },
                    signal: signal,
                    timeout: 15000 // 🔥 Ampliado a 15s para dar tiempo a DeepSeek
                });
            } catch (error) {
                if (axios.isCancel(error)) throw error;
                if (i === maxRetries) throw error; 
                const baseDelay = 1000 * Math.pow(2, i);
                await new Promise(res => setTimeout(res, baseDelay + (Math.random() * 500)));
            }
        }
    }

    #validateAndParseJSON(rawString, requiredKeys) {
        const data = JSON.parse(rawString);
        const missingKeys = requiredKeys.filter(key => !(key in data));
        if (missingKeys.length > 0) throw new Error(`Invalid Schema. Missing: ${missingKeys.join(', ')}`);
        return data;
    }

    #isCircuitOpen() {
        if (this.#circuitState === 'CLOSED') return false;
        if (Date.now() - this.#lastFailureTime > this.#circuitResetTimeout) {
            this.#circuitState = 'HALF_OPEN';
            return false;
        }
        return true;
    }

    #registerFailure(error) {
        this.#lastError = error;
        this.#circuitFailureCount++;
        this.#lastFailureTime = Date.now();
        if (this.#circuitFailureCount >= this.#circuitThreshold) this.#circuitState = 'OPEN';
    }

    #registerSuccess() {
        this.#circuitState = 'CLOSED';
        this.#circuitFailureCount = 0;
        this.#lastError = null;
    }

    #abortPendingRequest(hash) {
        if (this.#activeRequests.has(hash)) {
            this.#activeRequests.get(hash).abort();
            this.#activeRequests.delete(hash);
        }
    }

    // ==========================================
    // 🛡️ SISTEMA DE RENDERIZADO ANTIFALLAS (HUD)
    // ==========================================

    #parseErrorInfo(error) {
        let code = "NETWORK_BLOCKED_CORS";
        let message = error.message;

        if (error.response) {
            code = `HTTP_${error.response.status}`;
            message = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.statusText;
            
            if (error.response.status === 402) message = "LÍMITE FINANCIERO: Tu API Key es válida, pero no tienes saldo en platform.deepseek.com (Recarga mínima de $2 requerida).";
            if (error.response.status === 401) message = "CREDENCIAL RECHAZADA: La API Key es incorrecta o ha sido revocada.";
            if (error.response.status === 404) message = "PROXY CAÍDO: Vite no encontró la ruta. Detén Vite (Ctrl+C) y vuelve a ejecutar 'npm run dev'.";
        } else if (error.request) {
            message = "Sin respuesta del servidor. El proxy de Vite interceptó la petición pero la red externa está bloqueada.";
        }
        return { code, message };
    }

    #renderErrorToUI(error, context) {
        const diag = this.#parseErrorInfo(error);
        console.error(`🚨 [AETHER-ROME ANTI-FAILURE]: ${diag.code} | ${diag.message}`);

        return {
            lesson: `
                <div style="text-align:left; background:#1a1110; padding:25px; border-radius:8px; border:2px solid #ff3366; box-shadow: 0 0 30px rgba(255,51,102,0.3); margin-top: 10px;">
                    <h3 style="color:#ffcc00; margin-bottom:15px; font-family:monospace; font-size:1.4rem;">⚠️ FALLO CRÍTICO DE ENLACE NEURONAL</h3>
                    <p style="color:#fff; font-family:monospace; margin-bottom:8px;"><b>[>] PROCESO:</b> ${context}</p>
                    <p style="color:#fff; font-family:monospace; margin-bottom:8px;"><b>[>] CÓDIGO:</b> <span style="color:#00ffcc;">${diag.code}</span></p>
                    <p style="color:#fff; font-family:monospace; margin-bottom:8px;"><b>[>] DIAGNÓSTICO:</b> <span style="color:#ff3366;">${diag.message}</span></p>
                    <hr style="border-color:#4a2511; margin:15px 0;">
                    <p style="color:#b89b5e; font-size:0.9em; line-height: 1.4;">
                        <b>INSTRUCCIONES DEL ARQUITECTO:</b><br>
                        1. Si es HTTP 402, recarga saldo en DeepSeek.<br>
                        2. Si acabas de editar vite.config.js, asegúrate de reiniciar la terminal con <b>npm run dev</b>.
                    </p>
                </div>`,
            question: `[SISTEMA AUTOMATIZADO]: ¿Cuál es el protocolo de contención correcto?`,
            options: [
                "Revisar el archivo vite.config.js", 
                "Verificar la tarjeta en DeepSeek", 
                "Reiniciar el servidor local", 
                "Ejecutar todas las anteriores"
            ],
            answerIndex: 3
        };
    }
}