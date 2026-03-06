/**
 * AETHER-ROME ENGINE: GENERATIVE CORE v13.0.0 (MEMORABLE TIER)
 * Architecture: 
 * - Strict Viewport Stacking (Zero Colission Guarantee)
 * - Staggered Entrance Animations for UI Vectors
 * - Procedural Async State Machine
 */
import { ROMAN_SKILL_TREE } from './database.js'; 
import { AITutor } from './ai_tutor.js';
import { AudioSystem } from './audio_engine.js';
import { RomanDefense } from './defense.js';

const UI_DICTIONARY = {
    'en': { lives: "Integrity", score: "Glory", ai: "Neural Link Established...", over: "CRITICAL FAILURE: TIMELINE COLLAPSED.", win: "TOTAL VICTORY.", engage: "[!] ENGAGE TRIVIA", close: "CLOSE LINK", loading: "Consulting Akashic Records..." },
    'es': { lives: "Integridad", score: "Gloria", ai: "Enlace Neuronal Establecido...", over: "FALLO CRÍTICO: LÍNEA TEMPORAL COLAPSADA.", win: "VICTORIA TOTAL.", engage: "[!] INICIAR TRIVIA", close: "CERRAR ENLACE", loading: "Consultando Registros Akáshicos..." },
    'fr': { lives: "Intégrité", score: "Gloire", ai: "Lien Neuronal Établi...", over: "ÉCHEC CRITIQUE: CHRONOLOGIE EFFONDRÉE.", win: "VICTOIRE TOTALE.", engage: "[!] DÉMARRER TRIVIA", close: "FERMER LIEN", loading: "Consultation des Archives..." },
    'de': { lives: "Integrität", score: "Ruhm", ai: "Neuronale Verbindung Hergestellt...", over: "KRITISCHER FEHLER: ZEITLINIE KOLLABIERT.", win: "TOTALER SIEG.", engage: "[!] TRIVIA STARTEN", close: "VERBINDUNG TRENNEN", loading: "Akasha-Chronik wird konsultiert..." }
};

export class RomanEngine {
    #state; #dom; #tutor; #defenseMinigame;

    constructor() {
        this.#initState();
        this.#initDOM();
        this.#initNeuralLink();
    }

    #initState() {
        this.#state = {
            currentEra: 0,
            clickCount: 0,
            lives: 4,
            score: 0,
            language: 'es-ES',    
            isAIProcessing: false,
            maxEras: ROMAN_SKILL_TREE.eras.length,
            currentLevelData: null
        };
        this.#defenseMinigame = null;
    }

    #initDOM() {
        const safeQuery = (selector, isClass = false) => {
            const el = isClass ? document.querySelector(selector) : document.getElementById(selector);
            if (!el) {
                console.warn(`⚠️ [DOM DIAGNOSTIC]: Missing '${selector}'. Creating Phantom Node.`);
                return document.createElement(selector.includes('btn') ? 'button' : 'div'); 
            }
            return el;
        };

        this.#dom = {
            layers: {
                classroom: safeQuery('classroom-layer'),
                trivia: safeQuery('trivia-layer'),
                defense: safeQuery('defense-layer'),
                modal: safeQuery('ai-modal')
            },
            ui: {
                actionFooter: safeQuery('action-controls'),
                langSelector: safeQuery('language-selector'),
                btnTrivia: safeQuery('btn-engage-trivia'),
                btnAskAI: safeQuery('btn-ask-ai'), 
                btnCloseAI: safeQuery('btn-close-ai'),
                classTitle: safeQuery('#classroom-layer h2', true),
                classLesson: safeQuery('.lesson-content', true),
                lifeCount: safeQuery('life-count'),
                scoreCount: safeQuery('current-score'),
                triviaContainer: safeQuery('trivia-container'),
                aiResponseText: safeQuery('ai-response-text')
            }
        };

        if (this.#dom.ui.triviaContainer.parentNode === null && this.#dom.layers.trivia) {
             this.#dom.layers.trivia.appendChild(this.#dom.ui.triviaContainer);
        }
    }

    #initNeuralLink() {
        const apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DEEPSEEK_API_KEY : '';
        this.#tutor = new AITutor(apiKey);
    }

    async boot() {
        this.#setupListeners();
        this.#syncLanguage();
        await this.#generateAndRenderLesson(); 
    }

    #setupListeners() {
        document.body.addEventListener('pointerdown', () => AudioSystem.unlock(), { once: true });

        this.#dom.ui.langSelector.addEventListener('change', (e) => this.#handleLanguageChange(e));
        
        this.#dom.ui.btnTrivia.addEventListener('click', () => {
            if (this.#state.isAIProcessing || !this.#state.currentLevelData) return;
            this.#silenceAI(); 
            AudioSystem.playSuccess();
            this.#switchLayer('trivia');
        });
        
        this.#dom.ui.btnAskAI.addEventListener('click', () => this.#invokeProactiveAI(false));

        this.#dom.ui.btnCloseAI.addEventListener('click', () => {
            if(this.#dom.layers.modal.classList) this.#dom.layers.modal.classList.add('hidden');
            this.#silenceAI(); 
        });

        document.body.addEventListener('click', (e) => {
            if (this.#state.isAIProcessing || e.target.closest('#ai-modal')) return;
            
            this.#state.clickCount++;
            if (this.#state.clickCount >= 10) {
                this.#state.clickCount = 0;
                this.#invokeProactiveAI(true);
            }
        });

        this.#dom.ui.triviaContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-option');
            if (!btn || this.#state.isAIProcessing || !this.#state.currentLevelData) return;
            
            const selectedIndex = parseInt(btn.dataset.index, 10);
            this.#processAnswer(selectedIndex);
        });
    }

    async #handleLanguageChange(e) {
        this.#state.language = e.target.value;
        this.#syncLanguage();
        this.#silenceAI();
        await this.#generateAndRenderLesson(); 
    }

    #silenceAI() {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    // 🔥 EL FIX MAESTRO DE CAPAS (Cero Colisiones)
    #switchLayer(target) {
        // 1. APAGADO ESTRICTO: Remueve active-layer y añade hidden a todas las capas
        Object.values(this.#dom.layers).forEach(el => {
            if (el && el.classList) {
                el.classList.remove('active-layer'); 
                el.classList.add('hidden');
            }
        });
        
        // 2. ENCENDIDO CINEMÁTICO: Añade active-layer a la capa objetivo
        const targetLayer = this.#dom.layers[target];
        if (targetLayer && targetLayer.classList) {
            targetLayer.classList.remove('hidden');
            targetLayer.classList.add('active-layer'); 
        }
        
        // 3. Controles
        if (this.#dom.ui.actionFooter && this.#dom.ui.actionFooter.style) {
            this.#dom.ui.actionFooter.style.display = (target === 'classroom') ? 'flex' : 'none';
        }
        
        // 4. Inyección
        if (target === 'trivia') this.#renderTrivia();
        else if (target === 'defense') this.#launchDefenseProtocol();
    }

    async #generateAndRenderLesson() {
        if (this.#state.currentEra >= this.#state.maxEras) return;
        
        this.#state.isAIProcessing = true;
        if (this.#dom.ui.btnTrivia.classList) this.#dom.ui.btnTrivia.classList.add('opacity-50', 'pointer-events-none'); 
        
        const era = ROMAN_SKILL_TREE.eras[this.#state.currentEra];
        const langCode = this.#getLangCode();
        
        this.#dom.ui.classTitle.textContent = UI_DICTIONARY[langCode].loading;
        this.#dom.ui.classLesson.innerHTML = `<span class="animate-pulse">DeepSeek AI Synthesizing Timeline...</span>`;
        
        const promptSeed = era.nodes.politics.promptSeed; 
        
        const levelData = await this.#tutor.generateLevel(promptSeed, this.#state.language);
        this.#state.currentLevelData = levelData;

        this.#dom.ui.classTitle.textContent = era.title[langCode];
        this.#dom.ui.classLesson.innerHTML = this.#escapeHTML(levelData.lesson);
        
        if (this.#dom.ui.btnTrivia.classList) this.#dom.ui.btnTrivia.classList.remove('opacity-50', 'pointer-events-none');
        this.#state.isAIProcessing = false;

        this.#tutor.speak(levelData.lesson, this.#state.language);

        if (this.#dom.layers.trivia.classList && !this.#dom.layers.trivia.classList.contains('hidden')) {
            this.#renderTrivia();
        }
    }

    // 🔥 RENDERIZADO MEMORABLE (Animación Escalonada)
    #renderTrivia() {
        if (!this.#state.currentLevelData) return;
        const level = this.#state.currentLevelData;
        
        if(this.#dom.ui.lifeCount) this.#dom.ui.lifeCount.textContent = "❤".repeat(this.#state.lives);
        if(this.#dom.ui.scoreCount) this.#dom.ui.scoreCount.textContent = this.#state.score.toString().padStart(4, '0');

        const opacityClass = this.#state.isAIProcessing ? 'opacity-50 pointer-events-none' : '';
        
        // La animación usa la variable i (índice) para calcular el retraso de entrada de cada botón
        this.#dom.ui.triviaContainer.innerHTML = `
            <div class="${opacityClass}">
                <h3 class="sci-fi-text" style="animation: modalSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
                    ${this.#escapeHTML(level.question)}
                </h3>
                <div class="options-grid">
                    ${level.options.map((opt, i) => `
                        <button class="btn-option" data-index="${i}" style="opacity: 0; animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${0.15 + (i * 0.1)}s forwards;">
                            ${this.#escapeHTML(opt)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async #invokeProactiveAI(isFromEngagementLoop = false) {
        if (this.#state.isAIProcessing) return;
        this.#state.isAIProcessing = true;
        
        this.#silenceAI();
        AudioSystem.playSuccess();
        
        if (this.#dom.layers.modal.classList) this.#dom.layers.modal.classList.remove('hidden');
        const langCode = this.#getLangCode();
        this.#dom.ui.aiResponseText.textContent = UI_DICTIONARY[langCode].loading;
        
        const era = ROMAN_SKILL_TREE.eras[this.#state.currentEra];
        
        let prompt;
        if (isFromEngagementLoop) {
            prompt = `El usuario ha interactuado mucho. Haz una pregunta retórica o un comentario provocador sobre: "${era.title[langCode]}" para mantener su atención.`;
        } else {
            prompt = `Cuéntame un dato oscuro, épico y desconocido de la época de "${era.title[langCode]}". Que sea alucinante.`;
        }
        
        const responseText = await this.#tutor.getPedagogicalSupport(prompt, this.#state.language);
        this.#dom.ui.aiResponseText.textContent = responseText;
        this.#tutor.speak(responseText, this.#state.language);
        
        this.#state.isAIProcessing = false;
    }

    async #processAnswer(index) {
        const level = this.#state.currentLevelData;

        if (index === level.answerIndex) {
            AudioSystem.playSuccess();
            this.#state.score += 100;
            this.#switchLayer('defense'); 
        } else {
            AudioSystem.playError();
            await this.#handleIncorrectAnswer(level.question); 
        }
    }

    async #handleIncorrectAnswer(failedQuestion) {
        this.#state.lives--;
        this.#state.isAIProcessing = true;
        this.#renderTrivia(); 
        
        const langCode = this.#getLangCode();
        if (this.#dom.layers.modal.classList) this.#dom.layers.modal.classList.remove('hidden');
        this.#dom.ui.aiResponseText.textContent = UI_DICTIONARY[langCode].loading;
        
        const supportText = await this.#tutor.getPedagogicalSupport(failedQuestion, this.#state.language);
        
        this.#dom.ui.aiResponseText.textContent = supportText;
        this.#tutor.speak(supportText, this.#state.language);
        
        this.#state.isAIProcessing = false;
        
        if (this.#state.lives <= 0) {
            this.#triggerSystemState(UI_DICTIONARY[langCode].over, false);
        } else {
            this.#renderTrivia(); 
        }
    }

    #launchDefenseProtocol() {
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

    async #advanceEra() {
        this.#state.currentEra++;
        this.#state.lives = Math.min(this.#state.lives + 1, 4);
        
        if (this.#state.currentEra >= this.#state.maxEras) {
            this.#triggerSystemState(UI_DICTIONARY[this.#getLangCode()].win, true);
        } else {
            this.#switchLayer('classroom');
            await this.#generateAndRenderLesson(); 
        }
    }

    #getLangCode() {
        return this.#state.language.split('-')[0];
    }

    #syncLanguage() {
        const langCode = this.#getLangCode();
        const dict = UI_DICTIONARY[langCode] || UI_DICTIONARY['en'];
        
        if(this.#dom.ui.btnTrivia) this.#dom.ui.btnTrivia.textContent = dict.engage;
        if(this.#dom.ui.btnCloseAI) this.#dom.ui.btnCloseAI.textContent = dict.close;
        if (this.#dom.ui.btnAskAI) this.#dom.ui.btnAskAI.textContent = "[?] AI TUTOR";
    }

    #triggerSystemState(message, isVictory) {
        alert(message);
        if (isVictory) {
            window.location.href = "https://github.com/labslearning/Roman_empire_game"; 
        } else {
            window.location.reload(); 
        }
    }

    #escapeHTML(str) {
        if (!str) return "";
        return str.toString().replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
    }
}