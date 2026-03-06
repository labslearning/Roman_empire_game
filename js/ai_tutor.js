/**
 * AETHER-ROME NEURAL LINK: GENERATIVE ENGINE v11.0 (GOD TIER)
 * Architecture: Procedural Syllabus Generation, Strict JSON Mode, Graceful Degradation
 * Security: Safe UTF-8 Hashing, Memory Isolation, Circuit Breakers
 */
import axios from 'axios';

export class AITutor {
    // 🔒 CAMPOS PRIVADOS (Aislamiento Estricto)
    #apiKey;
    #apiEndpoint;
    #neuralCache;
    #activeRequest;
    #isOfflineMode;
    #cachedVoices;

    constructor(apiKey) {
        this.#apiEndpoint = 'https://api.deepseek.com/chat/completions';
        this.#neuralCache = new Map(); 
        this.#activeRequest = null;    
        this.#cachedVoices = [];

        // DEGRADACIÓN ELEGANTE (Fallback Offline)
        if (!apiKey || apiKey.trim() === '' || apiKey === 'tu_api_key_aqui') {
            console.warn("⚠️ [AETHER-ROME]: VITE_DEEPSEEK_API_KEY missing. Generative Engine operating in OFFLINE MODE.");
            this.#isOfflineMode = true;
            this.#apiKey = null;
        } else {
            this.#isOfflineMode = false;
            this.#apiKey = apiKey;
        }

        this.#initVoiceEngine();
    }

    // ==========================================
    // 1. HARDWARE BINDING (Voz Asíncrona)
    // ==========================================

    #initVoiceEngine() {
        if ('speechSynthesis' in window) {
            const loadVoices = () => { this.#cachedVoices = window.speechSynthesis.getVoices(); };
            loadVoices(); // Intento síncrono
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices; // Captura asíncrona real
            }
        }
    }

    // ==========================================
    // 2. PROCEDURAL LEVEL GENERATOR (JSON MODE)
    // ==========================================
    
    /**
     * Motor Generativo: Lee la semilla (Prompt Seed) y crea un nivel jugable.
     * @returns {Promise<Object>} JSON con { lesson, question, options, answerIndex }
     */
    async generateLevel(promptSeed, lang) {
        // Fallback inmediato si no hay internet o API
        if (this.#isOfflineMode) return this.#getOfflineLevelBackup(lang);

        // 1. MEMOIZATION: Si ya generamos este nivel, lo sacamos de la RAM (0ms latencia)
        const cacheKey = `lvl_${this.#generateSafeHash(promptSeed, lang)}`;
        if (this.#neuralCache.has(cacheKey)) {
            console.log("⚡ [NEURAL CACHE]: Retrieving pre-generated procedural level...");
            return this.#neuralCache.get(cacheKey);
        }

        if (this.#activeRequest) this.#activeRequest.abort("Overriding level generation.");
        this.#activeRequest = new AbortController();

        // INGENIERÍA DE PROMPT ESTRICTA (FAANG Standard)
        const systemPrompt = `You are the backend engine of a Roman History Game. 
        Generate a micro-class and a multiple-choice question based on this topic: "${promptSeed}". 
        Language: ${lang}.
        CRITICAL: You MUST respond ONLY with a valid JSON object. Do not use markdown blocks like \`\`\`json.
        The JSON MUST strictly match this structure:
        {
            "lesson": "A fascinating 3-sentence explanation of the topic.",
            "question": "A multiple choice question about the lesson.",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answerIndex": 0
        }
        Note: 'answerIndex' must be a number between 0 and 3 corresponding to the correct option.`;

        const payload = {
            model: "deepseek-chat",
            temperature: 0.6, // Creatividad controlada para variabilidad histórica
            response_format: { type: "json_object" }, // 🔥 MODO JSON ESTRICTO
            messages: [{ role: "system", content: systemPrompt }]
        };

        try {
            console.log(`[AETHER-ROME]: Generating Procedural Level via Neural Link...`);
            const response = await this.#fetchWithRetry(payload, this.#activeRequest.signal);
            const rawContent = response.data.choices[0].message.content;
            
            // Parseo Seguro (Evita que el juego crashee si la IA alucina un carácter raro)
            const parsedData = JSON.parse(rawContent);
            this.#neuralCache.set(cacheKey, parsedData); // Guardar en RAM
            
            return parsedData;

        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error("🔥 PROCEDURAL_GENERATION_FAILURE:", error.message);
            return this.#getOfflineLevelBackup(lang); // Salva la partida si DeepSeek falla
        } finally {
            this.#activeRequest = null;
        }
    }

    // ==========================================
    // 3. SENTINEL PENALTY (Micro-Clase / Castigo)
    // ==========================================

    /**
     * Genera la micro-clase de apoyo cuando el estudiante falla la pregunta de la trivia.
     */
    async getPedagogicalSupport(context, lang) {
        if (this.#isOfflineMode) return "The temporal archives are damaged. Focus on the core principles of Rome.";

        const cacheKey = `sup_${this.#generateSafeHash(context, lang)}`;
        if (this.#neuralCache.has(cacheKey)) return this.#neuralCache.get(cacheKey);

        const payload = {
            model: "deepseek-chat",
            temperature: 0.5,
            messages: [
                { role: "system", content: `You are an elite Roman History Professor AI. Respond strictly in: ${lang}. Tone: Sci-Fi / Vintage Academic. Concise, pedagogical, encouraging. Maximum 3 sentences. Emphasize why the concept matters.` },
                { role: "user", content: `The student failed a question regarding: "${context}". Explain the core concept and guide them.` }
            ]
        };

        try {
            const response = await this.#fetchWithRetry(payload, null);
            const synthesizedText = response.data.choices[0].message.content;
            this.#neuralCache.set(cacheKey, synthesizedText);
            return synthesizedText;
        } catch (error) {
            return "Focus, recruit! Your failure destabilizes the timeline.";
        }
    }

    // ==========================================
    // 4. SYNTHETIC VOX ENGINE (Web Speech API)
    // ==========================================

    speak(text, lang) {
        if (!('speechSynthesis' in window) || !text) return;

        window.speechSynthesis.cancel(); // Evitar solapamientos

        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = lang;
        msg.rate = 0.95;  // Ritmo de profesor
        msg.pitch = 0.85; // Voz autoritaria
        
        const shortLang = lang.split('-')[0]; 
        const preferredVoice = this.#cachedVoices.find(v => v.lang.startsWith(shortLang) && v.localService) 
                            || this.#cachedVoices.find(v => v.lang.startsWith(shortLang));
        
        if (preferredVoice) msg.voice = preferredVoice;

        window.speechSynthesis.speak(msg);
    }

    // ==========================================
    // 5. PRIVATE INFRASTRUCTURE (Utilities)
    // ==========================================

    async #fetchWithRetry(payload, signal, retries = 2) {
        for (let i = 0; i < retries; i++) {
            try {
                return await axios.post(this.#apiEndpoint, payload, {
                    headers: {
                        'Authorization': `Bearer ${this.#apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    signal: signal,
                    timeout: 8000 // 8 segundos máximo para no congelar la pantalla de carga
                });
            } catch (error) {
                if (axios.isCancel(error) || i === retries - 1) throw error;
                await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i))); // Exponential Backoff real
            }
        }
    }

    #generateSafeHash(context, lang) {
        const safeContext = encodeURIComponent(context);
        return `${lang}_${btoa(safeContext).substring(0, 20)}`;
    }

    #getOfflineLevelBackup(lang) {
        // Este JSON simula la respuesta de la IA para que el juego no muera sin internet
        return {
            lesson: "The timeline is fractured. Offline backup engaged: Rome was founded in 753 BC by Romulus after defeating his brother Remus.",
            question: "When was Rome founded according to the offline backup?",
            options: ["753 BC", "476 AD", "1492 AD", "2024 AD"],
            answerIndex: 0
        };
    }
}