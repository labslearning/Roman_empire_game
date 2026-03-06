/**
 * AETHER-ROME: PROCEDURAL KNOWLEDGE MATRIX v11.0 (GOD TIER)
 * Architecture: Dynamic Skill Tree, AI Prompt Seeds, Immutable State
 * Description: Replaces hardcoded strings with Procedural Generation Nodes for DeepSeek.
 */

// ==========================================
// 1. ENGINE UTILITIES (Memory Locking)
// ==========================================

/**
 * Recursively freezes the memory object to prevent runtime mutations.
 * Mandatory FAANG standard for state management (Redux/Vuex style).
 */
const deepFreeze = (obj) => {
    Object.keys(obj).forEach(prop => {
        if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
};

// ==========================================
// 2. THE SKILL TREE (Procedural Prompt Seeds)
// ==========================================

/**
 * @typedef {Object} SkillNode
 * @property {string} promptSeed - The exact context fed to DeepSeek to generate the level.
 * @property {string} focus - The pedagogical objective for the AI to emphasize.
 */

export const ROMAN_SKILL_TREE = deepFreeze({
    _meta: {
        version: "11.0.0",
        engineMode: "Procedural Generative AI",
        lastCompiled: new Date().toISOString(),
        integrityHash: "sha256-1NF1N1T3-SYLL4B0S-G0D-T13R"
    },
    
    // El estudiante avanza por estas Eras, eligiendo una rama (Militar, Política, Cultura)
    eras: [
        {
            id: "monarchy",
            level: 1,
            timeframe: "753 BC - 509 BC",
            difficultyMultiplier: 1.0, // Kinetic engine speed
            title: { en: "The Age of Kings", es: "La Era de los Reyes", fr: "L'Âge des Rois", de: "Das Zeitalter der Könige" },
            nodes: {
                military: {
                    promptSeed: "The first Roman armies, the Phalanx formation, and early weapons under the Roman Kings.",
                    focus: "Tactical evolution from tribal warfare."
                },
                politics: {
                    promptSeed: "Romulus, the 7 Kings of Rome, and the creation of the early Senate (Senatus).",
                    focus: "The transition of power and early laws."
                },
                culture: {
                    promptSeed: "Early Roman Religion, Numa Pompilius, the Vestal Virgins, and infrastructure like the Cloaca Maxima.",
                    focus: "Civic identity and engineering."
                }
            }
        },
        {
            id: "republic",
            level: 2,
            timeframe: "509 BC - 27 BC",
            difficultyMultiplier: 1.25,
            title: { en: "The Republic", es: "La República", fr: "La République", de: "Die Republik" },
            nodes: {
                military: {
                    promptSeed: "The Punic Wars, Hannibal vs Scipio Africanus, and the creation of the Manipular Legion.",
                    focus: "Strategic adaptability and expansion."
                },
                politics: {
                    promptSeed: "The Consuls, the power of the Senate, the Tribunes of the Plebs, and the assassination of Julius Caesar.",
                    focus: "Checks and balances, and the fall of the Republic."
                },
                culture: {
                    promptSeed: "Engineering the Republic: The first Aqueducts, the Appian Way, and the origins of Gladiatorial games.",
                    focus: "Public works and social control."
                }
            }
        },
        {
            id: "empire",
            level: 3,
            timeframe: "27 BC - 476 AD",
            difficultyMultiplier: 1.5,
            title: { en: "The Pax Romana", es: "El Imperio", fr: "L'Empire", de: "Das Kaiserreich" },
            nodes: {
                military: {
                    promptSeed: "The Praetorian Guard, Hadrian's Wall, the Legions at their peak, and border defense against barbarians.",
                    focus: "Logistics and defensive imperialism."
                },
                politics: {
                    promptSeed: "Augustus establishing the Pax Romana, the Julio-Claudian dynasty (Nero, Caligula), and the eventual split of the Empire.",
                    focus: "Absolute power and administrative division."
                },
                culture: {
                    promptSeed: "The building of the Colosseum, the Pantheon, daily life in Pompeii, and the rise of Christianity.",
                    focus: "Monumental architecture and religious shifts."
                }
            }
        },
        {
            id: "fall",
            level: 4,
            timeframe: "476 AD - 1453 AD",
            difficultyMultiplier: 2.0, // Maximum Kinetic Defense Difficulty
            title: { en: "The Fall & Legacy", es: "La Caída y el Legado", fr: "La Chute", de: "Der Untergang" },
            nodes: {
                military: {
                    promptSeed: "The Sack of Rome by Alaric the Visigoth, the Hun invasions, and the fall of Constantinople in 1453.",
                    focus: "The collapse of military infrastructure."
                },
                politics: {
                    promptSeed: "Economic hyperinflation, political corruption, the last Western Emperor Romulus Augustulus, and the Byzantine survival.",
                    focus: "Systemic collapse and the shift to the East."
                },
                culture: {
                    promptSeed: "The preservation of Roman law (Corpus Juris Civilis), the loss of ancient technologies, and the transition into the Dark Ages.",
                    focus: "The fading of antiquity and cultural preservation."
                }
            }
        }
    ]
});