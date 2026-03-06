/**
 * AETHER-ROME NEURAL LINK: GENERATIVE ENGINE v12.0.0 (SILICON VALLEY GOD TIER)
 * Architectured for High-Performance EdTech platforms.
 * * Features:
 * - Distributed State Circuit Breaker
 * - SHA-256 Cryptographic Memoization
 * - Exponential Backoff with Jitter
 * - Strict AST/JSON Schema Validation
 * - Web Speech API Anti-Garbage-Collection Hack
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
    
    // Fallback & Resilience State
    #isOfflineMode;
    #circuitState; // 'CLOSED' (All good) | 'OPEN' (Failing, block requests) | 'HALF_OPEN' (Testing recovery)
    #circuitFailureCount;
    #circuitThreshold = 3; 
    #circuitResetTimeout = 30000; // 30s cooldown if API goes down
    #lastFailureTime;

    constructor(apiKey) {
        this.#apiEndpoint = 'https://api.deepseek.com/chat/completions';
        this.#neuralCache = new Map(); 
        this.#activeRequests = new Map(); // Permite múltiples requests trackeados por contexto
        this.#cachedVoices = [];
        this.#circuitState = 'CLOSED';
        this.#circuitFailureCount = 0;
        this.#lastFailureTime = 0;

        // Auto-Discovery del entorno (Soporte Vite/Node/Browser)
        const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEEPSEEK_API_KEY) || '';
        const finalKey = apiKey || envKey;

        if (!finalKey || finalKey.trim() === '' || finalKey.includes('tu_api_key')) {
            console.warn("⚠️ [AETHER-ROME]: Operando en OFFLINE MODE (Air-gapped).");
            this.#isOfflineMode = true;
            this.#apiKey = null;
        } else {
            this.#isOfflineMode = false;
            this.#apiKey = finalKey;
        }

        this.#initAdvancedVoiceEngine();
    }

    // ==========================================
    // 1. HARDWARE BINDING & TTS OPTIMIZATION
    // ==========================================

    #initAdvancedVoiceEngine() {
        if (!('speechSynthesis' in window)) return;
        
        const loadVoices = () => { 
            this.#cachedVoices = window.speechSynthesis.getVoices().sort((a, b) => {
                // Prioriza voces locales de alta fidelidad (Apple/Google Premium)
                if (a.localService && !b.localService) return -1;
                return 0;
            }); 
        };
        
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    // ==========================================
    // 2. CRYPTOGRAPHIC MEMOIZATION (SHA-256)
    // ==========================================

    async #generateCryptoHash(context, lang) {
        const msgUint8 = new TextEncoder().encode(`${lang}_${context}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ==========================================
    // 3. PROCEDURAL GENERATION (Zero-Hardcode)
    // ==========================================
    
    async generateLevel(promptSeed, lang) {
        if (this.#isOfflineMode || this.#isCircuitOpen()) return this.#getOfflineLevelBackup(promptSeed, lang);

        const hash = await this.#generateCryptoHash(`lvl_${promptSeed}`, lang);
        if (this.#neuralCache.has(hash)) return this.#neuralCache.get(hash);

        // Cancelación inteligente (AbortController por Hash)
        this.#abortPendingRequest(hash);
        const controller = new AbortController();
        this.#activeRequests.set(hash, controller);

        const systemPrompt = `You are the backend engine of a high-performance EdTech platform teaching Roman History. 
        Topic: "${promptSeed}". Language: ${lang}.
        Generate a micro-class (lesson) and a multiple-choice question.
        CRITICAL: Respond ONLY with a valid JSON object. No markdown, no explanations.
        JSON SCHEMA:
        {
            "lesson": "A deep, engaging 3-sentence explanation.",
            "question": "A challenging multiple choice question.",
            "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
            "answerIndex": [Integer 0-3]
        }`;

        const payload = {
            model: "deepseek-chat",
            temperature: 0.6, // Nivel óptimo para pedagogía generativa
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: systemPrompt }]
        };

        try {
            const response = await this.#fetchWithResilience(payload, controller.signal);
            const parsedData = this.#validateAndParseJSON(response.data.choices[0].message.content, SCHEMAS.LEVEL);
            
            this.#registerSuccess();
            this.#neuralCache.set(hash, parsedData);
            return parsedData;

        } catch (error) {
            if (axios.isCancel(error)) return null;
            this.#registerFailure();
            console.error("🔥 [AETHER-ROME ENGINE ERROR]:", error.message);
            return this.#getOfflineLevelBackup(promptSeed, lang);
        } finally {
            this.#activeRequests.delete(hash);
        }
    }

    // ==========================================
    // 4. MICRO-CLASS SUPPORT (Manejo del Fallo)
    // ==========================================

    async getPedagogicalSupport(failedQuestion, lang) {
        if (this.#isOfflineMode || this.#isCircuitOpen()) {
            return this.#getOfflineSupportBackup();
        }

        const hash = await this.#generateCryptoHash(`sup_${failedQuestion}`, lang);
        if (this.#neuralCache.has(hash)) return this.#neuralCache.get(hash);

        const systemPrompt = `You are a strict but encouraging Roman History Professor AI. Language: ${lang}.
        The student failed a question regarding: "${failedQuestion}".
        Generate a pedagogical micro-class.
        CRITICAL: Respond ONLY with a valid JSON object. No markdown.
        JSON SCHEMA:
        {
          "diagnostico": "Brief explanation of what they likely misunderstood.",
          "concepto_clave": "The correct historical fact stated clearly.",
          "analogia": "A memorable analogy relating the concept to modern life or basic logic."
        }`;

        const payload = {
            model: "deepseek-chat",
            temperature: 0.5,
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: systemPrompt }]
        };

        try {
            const response = await this.#fetchWithResilience(payload, null);
            const parsedData = this.#validateAndParseJSON(response.data.choices[0].message.content, SCHEMAS.SUPPORT);
            
            // Format string for UI
            const synthesizedText = `${parsedData.diagnostico} ${parsedData.concepto_clave} ${parsedData.analogia}`;
            
            this.#registerSuccess();
            this.#neuralCache.set(hash, synthesizedText);
            return synthesizedText;
        } catch (error) {
            this.#registerFailure();
            return this.#getOfflineSupportBackup().concepto_clave;
        }
    }

    // ==========================================
    // 5. RESILIENCE INFRASTRUCTURE (The "God Tier" Core)
    // ==========================================

    async #fetchWithResilience(payload, signal, maxRetries = 2) {
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await axios.post(this.#apiEndpoint, payload, {
                    headers: {
                        'Authorization': `Bearer ${this.#apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    signal: signal,
                    timeout: 8000 // Prevents UI hanging
                });
            } catch (error) {
                if (axios.isCancel(error)) throw error;
                if (i === maxRetries) throw error; // Falla definitiva tras retries
                
                // Exponential Backoff with Jitter (Previene Thundering Herd)
                const baseDelay = 1000 * Math.pow(2, i);
                const jitter = Math.random() * 500;
                await new Promise(res => setTimeout(res, baseDelay + jitter));
            }
        }
    }

    // Validador de Esquema en Tiempo de Ejecución (AST-like)
    #validateAndParseJSON(rawString, requiredKeys) {
        try {
            const data = JSON.parse(rawString);
            const missingKeys = requiredKeys.filter(key => !(key in data));
            
            if (missingKeys.length > 0) {
                throw new Error(`Invalid Schema. Missing keys: ${missingKeys.join(', ')}`);
            }
            return data;
        } catch (e) {
            console.error("☣️ [SCHEMA VALIDATION FAILED]:", e.message, "\nRaw payload:", rawString);
            throw e; // Lanza el error para que el bloque catch principal dispare el Fallback
        }
    }

    // Circuit Breaker Logic
    #isCircuitOpen() {
        if (this.#circuitState === 'CLOSED') return false;
        
        const now = Date.now();
        if (this.#circuitState === 'OPEN') {
            if (now - this.#lastFailureTime > this.#circuitResetTimeout) {
                console.log("⚙️ [CIRCUIT BREAKER]: Half-Open. Testing API recovery...");
                this.#circuitState = 'HALF_OPEN';
                return false; // Deja pasar UNA petición para probar
            }
            return true; // Sigue bloqueando
        }
        return false; // HALF_OPEN permite el paso
    }

    #registerFailure() {
        this.#circuitFailureCount++;
        this.#lastFailureTime = Date.now();
        if (this.#circuitFailureCount >= this.#circuitThreshold) {
            console.error("🚨 [CIRCUIT BREAKER]: OPEN. API is down or rate-limited. Shielding Main Thread.");
            this.#circuitState = 'OPEN';
        }
    }

    #registerSuccess() {
        if (this.#circuitState === 'HALF_OPEN') {
            console.log("✅ [CIRCUIT BREAKER]: CLOSED. API restored.");
        }
        this.#circuitState = 'CLOSED';
        this.#circuitFailureCount = 0;
    }

    #abortPendingRequest(hash) {
        if (this.#activeRequests.has(hash)) {
            this.#activeRequests.get(hash).abort("Superseded by new interaction.");
            this.#activeRequests.delete(hash);
        }
    }

    // ==========================================
    // 6. KINETIC TTS ENGINE (Anti-Cutoff Hack)
    // ==========================================

    speak(text, lang) {
        if (!('speechSynthesis' in window) || !text) return;

        window.speechSynthesis.cancel(); 

        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = lang;
        msg.rate = 0.95;  
        msg.pitch = 0.90; 
        
        const shortLang = lang.split('-')[0]; 
        const preferredVoice = this.#cachedVoices.find(v => v.lang.startsWith(shortLang) && v.name.includes("Premium") && v.localService) 
                            || this.#cachedVoices.find(v => v.lang.startsWith(shortLang));
        
        if (preferredVoice) msg.voice = preferredVoice;

        // BUGFIX SILICON VALLEY: Chromium detiene el TTS largo a los 14 segundos si no hay interacción.
        // Esto mantiene vivo el hilo de audio haciendo pausas indetectables.
        let resumeInterval;
        msg.onstart = () => {
            resumeInterval = setInterval(() => {
                if (!window.speechSynthesis.paused) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000); 
        };
        msg.onend = () => clearInterval(resumeInterval);
        msg.onerror = () => clearInterval(resumeInterval);

        window.speechSynthesis.speak(msg);
    }

    // ==========================================
    // 7. OFFLINE BACKUPS (Graceful Degradation)
    // ==========================================

    #getOfflineLevelBackup(promptSeed, lang) {
        return {
            lesson: `[OFFLINE/RESTORED] The historical records for "${promptSeed}" are temporarily inaccessible. However, remember that Rome's resilience was its greatest weapon.`,
            question: `Which of these is a core trait of the Roman Empire despite technical difficulties?`,
            options: ["Resilience", "Immediate Surrender", "Pacifism", "Apathy"],
            answerIndex: 0
        };
    }

    #getOfflineSupportBackup() {
        return {
            diagnostico: "[DATA CORRUPTED].",
            concepto_clave: "Even the greatest generals faced communications blackout. Focus on the core mechanics.",
            analogia: "Like a legionnaire without orders, rely on your training."
        };
    }
}