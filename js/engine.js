/**
 * AETHER-ROME ENGINE: CORE LOGIC v10.0 (OMNISCIENT TIER)
 * Architecture: Central State-Machine, Proactive AI Orchestration, Auto-Vox Synthesis
 * Security: Strict Memory Encapsulation, XSS Prevention, GC-Safe Transitions
 */
import { ROMAN_DATA } from './database.js';
import { AITutor } from './ai_tutor.js';
import { AudioSystem } from './audio_engine.js';
import { RomanDefense } from './defense.js';

// --- DICCIONARIO GLOBAL DE INTERFAZ (i18n Dinámico) ---
const UI_DICTIONARY = {
    'en': { lives: "Integrity", score: "Glory", ai: "Neural Link Established...", over: "CRITICAL FAILURE: ROMAN LINEAGE TERMINATED.", win: "TOTAL VICTORY: ROME IS ETERNAL.", engage: "[!] ENGAGE TRIVIA", close: "CLOSE LINK" },
    'es': { lives: "Integridad", score: "Gloria", ai: "Enlace Neuronal Establecido...", over: "FALLO CRÍTICO: LINAJE ROMANO TERMINADO.", win: "VICTORIA TOTAL: ROMA ES ETERNA.", engage: "[!] INICIAR TRIVIA", close: "CERRAR ENLACE" },
    'fr': { lives: "Intégrité", score: "Gloire", ai: "Lien Neuronal Établi...", over: "ÉCHEC CRITIQUE: LIGNÉE ROMAINE TERMINÉE.", win: "VICTOIRE TOTALE: ROME EST ÉTERNELLE.", engage: "[!] DÉMARRER TRIVIA", close: "FERMER LIEN" },
    'de': { lives: "Integrität", score: "Ruhm", ai: "Neuronale Verbindung Hergestellt...", over: "KRITISCHER FEHLER: RÖMISCHE BLUTLINIE BEENDET.", win: "TOTALER SIEG: ROM IST EWIG.", engage: "[!] TRIVIA STARTEN", close: "VERBINDUNG TRENNEN" }
};

export class RomanEngine {
    // 🔒 CAMPOS PRIVADOS (Aislamiento Estricto de Memoria)
    #state;
    #dom;
    #tutor;
    #defenseMinigame;

    constructor() {
        this.#initState();
        this.#initDOM();
        this.#initNeuralLink();
    }

    #initState() {
        this.#state = {
            currentEra: 0,
            currentQuestion: 0,
            lives: 4,
            score: 0,
            language: 'es-ES', // Idioma por defecto
            isAIProcessing: false,
            maxEras: ROMAN_DATA.eras.length
        };
        this.#defenseMinigame = null;
    }

    #initDOM() {
        // Cacheo de nodos del DOM (Mejora el rendimiento al evitar querySelectors repetidos)
        this.#dom = {
            layers: {
                classroom: document.getElementById('classroom-layer'),
                trivia: document.getElementById('trivia-layer'),
                defense: document.getElementById('defense-layer'),
                modal: document.getElementById('ai-modal')
            },
            ui: {
                actionFooter: document.getElementById('action-controls'),
                langSelector: document.getElementById('language-selector'),
                btnTrivia: document.getElementById('btn-engage-trivia'),
                btnAskAI: document.getElementById('btn-ask-ai'), 
                btnCloseAI: document.getElementById('btn-close-ai'),
                classTitle: document.querySelector('#classroom-layer h2'),
                classLesson: document.querySelector('.lesson-content'),
                lifeCount: document.getElementById('life-count'),
                scoreCount: document.getElementById('current-score'),
                triviaContainer: document.getElementById('trivia-container'),
                aiResponseText: document.getElementById('ai-response-text')
            }
        };

        // Verificación de Integridad del DOM
        if (!this.#dom.ui.triviaContainer || !this.#dom.ui.btnAskAI) {
            throw new Error("ATP-ERROR: Matrix DOM binding failed. UI components missing.");
        }
    }

    #initNeuralLink() {
        // El Cognitive Engine v10.0 maneja automáticamente si la API falta (Modo Offline)
        const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
        this.#tutor = new AITutor(apiKey);
    }

    boot() {
        console.group("%c[AETHER-ROME ORCHESTRATOR] Engine Online", "color: #00ffcc; font-weight: bold;");
        this.#setupListeners();
        this.#syncLanguage();
        this.#renderLesson(); // Esto dispara la Auto-Vox (Lectura de lección)
        console.log("✔ State Machine Synchronized. Awaiting User Interaction.");
        console.groupEnd();
    }

    // ==========================================
    // DELEGACIÓN DE EVENTOS Y HARDWARE
    // ==========================================

    #setupListeners() {
        // Redundancia de Desbloqueo de Audio (Apple/Safari lo requieren estrictamente)
        document.body.addEventListener('pointerdown', () => AudioSystem.unlock(), { once: true });

        // Selector de Idioma
        this.#dom.ui.langSelector.addEventListener('change', (e) => this.#handleLanguageChange(e));
        
        // Transición a Trivia
        this.#dom.ui.btnTrivia.addEventListener('click', () => {
            this.#silenceAI(); // Corta al profesor si seguía hablando
            AudioSystem.playSuccess();
            this.#switchLayer('trivia');
        });
        
        // IA Proactiva (Dato Curioso)
        this.#dom.ui.btnAskAI.addEventListener('click', () => this.#invokeProactiveAI());

        // Cerrar Modal Neural
        this.#dom.ui.btnCloseAI.addEventListener('click', () => {
            this.#dom.layers.modal.classList.add('hidden');
            this.#silenceAI(); // Calla a la IA al cerrar la ventana
        });

        // Event Delegation para los botones de Trivia
        this.#dom.ui.triviaContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-option');
            // Bloqueo Anti-Spam: Si la IA está hablando, no puedes clickear
            if (!btn || this.#state.isAIProcessing) return;
            
            const selectedIndex = parseInt(btn.dataset.index, 10);
            this.#processAnswer(selectedIndex);
        });
    }

    #handleLanguageChange(e) {
        this.#state.language = e.target.value;
        this.#syncLanguage();
        this.#silenceAI();
        this.#renderLesson(); // Re-lee la lección en el nuevo idioma
        if (!this.#dom.layers.trivia.classList.contains('hidden')) {
            this.#renderTrivia();
        }
    }

    #silenceAI() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    // ==========================================
    // RENDERIZADO Y ENRUTAMIENTO DE CAPAS
    // ==========================================

    #switchLayer(target) {
        // Ocultar todas las capas
        Object.values(this.#dom.layers).forEach(el => el.classList.add('hidden'));
        // Mostrar la capa objetivo
        this.#dom.layers[target].classList.remove('hidden');
        
        // Gestión inteligente del Footer (Solo visible en la clase)
        if (target === 'classroom') {
            this.#dom.ui.actionFooter.style.display = 'flex';
        } else {
            this.#dom.ui.actionFooter.style.display = 'none';
        }
        
        if (target === 'trivia') this.#renderTrivia();
        else if (target === 'defense') this.#launchDefenseProtocol();
    }

    #renderLesson() {
        if (this.#state.currentEra >= this.#state.maxEras) return;
        
        const era = ROMAN_DATA.eras[this.#state.currentEra];
        const langCode = this.#getLangCode();
        
        this.#dom.ui.classTitle.textContent = era.title[langCode];
        this.#dom.ui.classLesson.textContent = era.lesson[langCode];

        // 🔥 AUTO-VOX: El profesor dicta la clase automáticamente
        this.#tutor.speak(era.lesson[langCode], this.#state.language);
    }

    #renderTrivia() {
        const era = ROMAN_DATA.eras[this.#state.currentEra];
        const questionData = era.exercises[this.#state.currentQuestion];
        
        // Renderizado del HUD Superior
        this.#dom.ui.lifeCount.textContent = "❤".repeat(this.#state.lives);
        this.#dom.ui.scoreCount.textContent = this.#state.score.toString().padStart(4, '0');

        // Renderizado de Seguridad (Anti-XSS e Inyección Dinámica)
        const opacityClass = this.#state.isAIProcessing ? 'opacity-50 pointer-events-none' : '';
        
        this.#dom.ui.triviaContainer.innerHTML = `
            <div class="${opacityClass} transition-all duration-300">
                <h3 class="sci-fi-text">${this.#escapeHTML(questionData.q)}</h3>
                <div class="options-grid">
                    ${questionData.options.map((opt, i) => `
                        <button class="btn-option" data-index="${i}">
                            ${this.#escapeHTML(opt)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ==========================================
    // ORQUESTACIÓN DE LA IA (Modo Reactivo y Proactivo)
    // ==========================================

    async #invokeProactiveAI() {
        if (this.#state.isAIProcessing) return;
        this.#state.isAIProcessing = true;
        
        this.#silenceAI();
        AudioSystem.playSuccess();
        
        this.#dom.layers.modal.classList.remove('hidden');
        this.#dom.ui.aiResponseText.textContent = UI_DICTIONARY[this.#getLangCode()].ai;
        
        const era = ROMAN_DATA.eras[this.#state.currentEra];
        const langCode = this.#getLangCode();
        
        // System Override Prompt: Forzamos a DeepSeek a dar datos curiosos
        const prompt = `[SYSTEM OVERRIDE]: The student did not fail. They pressed the AI Tutor button. Tell me a fascinating, unknown, mind-blowing historical fact about: "${era.title[langCode]}". Make it epic.`;
        
        const response = await this.#tutor.getPedagogicalSupport(prompt, this.#state.language);
        this.#dom.ui.aiResponseText.textContent = response;
        this.#tutor.speak(response, this.#state.language);
        
        this.#state.isAIProcessing = false;
    }

    // ==========================================
    // NÚCLEO LÓGICO DE LA TRIVIA
    // ==========================================

    async #processAnswer(index) {
        const era = ROMAN_DATA.eras[this.#state.currentEra];
        const questionData = era.exercises[this.#state.currentQuestion];

        if (index === questionData.a) {
            AudioSystem.playSuccess();
            this.#handleCorrectAnswer(era);
        } else {
            AudioSystem.playError();
            await this.#handleIncorrectAnswer(questionData.q, questionData.topic);
        }
    }

    #handleCorrectAnswer(era) {
        this.#state.score += 100;
        this.#state.currentQuestion++;
        
        if (this.#state.currentQuestion >= era.exercises.length) {
            console.log(`[AETHER-ROME]: Phase ${this.#state.currentEra + 1} Complete. Launching Kinetic Engine.`);
            this.#switchLayer('defense');
        } else {
            this.#renderTrivia();
        }
    }

    async #handleIncorrectAnswer(failedQuestion, topic) {
        this.#state.lives--;
        this.#state.isAIProcessing = true;
        this.#renderTrivia(); // Re-renderiza para mostrar el corazón perdido y bloquear clics
        
        const langCode = this.#getLangCode();
        this.#dom.layers.modal.classList.remove('hidden');
        this.#dom.ui.aiResponseText.textContent = UI_DICTIONARY[langCode].ai;
        
        // Prompt contextualizado usando el "Topic" que agregamos a la base de datos
        const response = await this.#tutor.getPedagogicalSupport(`Question failed: ${failedQuestion} (Context: ${topic}). Explain why.`, this.#state.language);
        
        this.#dom.ui.aiResponseText.textContent = response;
        this.#tutor.speak(response, this.#state.language);
        
        this.#state.isAIProcessing = false;
        
        if (this.#state.lives <= 0) {
            this.#triggerSystemState(UI_DICTIONARY[langCode].over, false);
        } else {
            this.#renderTrivia(); // Desbloquea la interfaz
        }
    }

    // ==========================================
    // PROTOCOLO DE DEFENSA CINÉTICA
    // ==========================================

    #launchDefenseProtocol() {
        // Prevención estricta de Memory Leaks
        if (this.#defenseMinigame) {
            this.#defenseMinigame.destroy();
            this.#defenseMinigame = null;
        }

        this.#defenseMinigame = new RomanDefense('defense-grid', (success) => {
            if (success) {
                this.#advanceEra();
            } else {
                this.#triggerSystemState(UI_DICTIONARY[this.#getLangCode()].over, false);
            }
        });

        this.#defenseMinigame.start();
    }

    #advanceEra() {
        this.#state.currentEra++;
        this.#state.currentQuestion = 0; 
        this.#state.lives = Math.min(this.#state.lives + 1, 4); // Recompensa: Recupera 1 escudo
        
        if (this.#state.currentEra >= this.#state.maxEras) {
            this.#triggerSystemState(UI_DICTIONARY[this.#getLangCode()].win, true);
        } else {
            this.#switchLayer('classroom');
            this.#renderLesson(); // Automáticamente inicia la voz de la nueva era
        }
    }

    // ==========================================
    // UTILIDADES Y SEGURIDAD
    // ==========================================

    #getLangCode() {
        return this.#state.language.split('-')[0];
    }

    #syncLanguage() {
        const langCode = this.#getLangCode();
        const dict = UI_DICTIONARY[langCode] || UI_DICTIONARY['en'];
        
        this.#dom.ui.btnTrivia.textContent = dict.engage;
        this.#dom.ui.btnCloseAI.textContent = dict.close;
        
        if (this.#dom.ui.btnAskAI) {
            this.#dom.ui.btnAskAI.textContent = "[?] AI TUTOR";
        }
    }

    #triggerSystemState(message, isVictory) {
        alert(message);
        if (isVictory) {
            window.location.href = "https://github.com/labslearning/Roman_empire_game"; 
        } else {
            window.location.reload(); // Hard Reset seguro
        }
    }

    /**
     * Motor de escape de caracteres para prevenir ataques Cross-Site Scripting (XSS).
     * Obligatorio en FAANG al inyectar HTML usando innerHTML.
     */
    #escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
    }
}