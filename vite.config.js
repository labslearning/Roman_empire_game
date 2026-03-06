/**
 * AETHER-ROME: VITE CONFIGURATION v14.0.0 (SILICON VALLEY GOD TIER)
 * Architecture:
 * - Dynamic Environment Loading
 * - Quantum Proxy Telemetry (CORS Bypass & Deep Logging)
 * - Advanced Rollup Chunk Splitting (O(1) Cache Invalidation)
 * - Automated Security Stripping (ESBuild Drop)
 */
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
    // 1. CARGA DE ENTORNOS (Extrae el .env de forma segura en memoria)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // ==========================================
        // 🚀 1. INFRAESTRUCTURA DEL SERVIDOR (DEV)
        // ==========================================
        server: {
            host: '0.0.0.0', // Permite pruebas en dispositivos móviles en la misma red LAN
            port: 3000,
            strictPort: true, // Si el 3000 está ocupado, detiene la ejecución (Evita colisiones de memoria)
            cors: true,
            
            // EL TÚNEL CUÁNTICO (CORS Bypass)
            proxy: {
                '/api/deepseek': {
                    target: 'https://api.deepseek.com',
                    changeOrigin: true,
                    secure: true, 
                    rewrite: (path) => path.replace(/^\/api\/deepseek/, ''),
                    
                    // 🔥 TELEMETRÍA DEL PROXY (Deep Debugging Level)
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            console.error('🚨 [AETHER-PROXY ERROR]: Conexión fallida.', err.message);
                        });
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log(`⚡ [NEURAL LINK INITIATED]: Ruteando hacia -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
                        });
                        proxy.on('proxyRes', (proxyRes, req, _res) => {
                            const statusColor = proxyRes.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Rojo o Verde
                            console.log(`${statusColor}✅ [NEURAL LINK RESPONSE]: Estado ${proxyRes.statusCode} \x1b[0m`);
                        });
                    }
                }
            }
        },

        // ==========================================
        // 🧬 2. MATRIZ DE RESOLUCIÓN (Absolute Aliasing)
        // ==========================================
        resolve: {
            alias: {
                // Permite hacer importaciones limpias. Ej: import { AI } from '@/ai_tutor.js'
                '@': fileURLToPath(new URL('./js', import.meta.url)),
                '@assets': fileURLToPath(new URL('./assets', import.meta.url))
            }
        },

        // ==========================================
        // 🛠️ 3. MOTOR DE COMPILACIÓN (Rollup + ESBuild)
        // ==========================================
        build: {
            target: 'esnext', // Aprovecha motores V8/SpiderMonkey modernos
            minify: 'esbuild', // Algoritmo en Go (100x más rápido que Terser)
            sourcemap: mode === 'development', // Cierra la puerta a hackers en producción
            chunkSizeWarningLimit: 1000,
            
            rollupOptions: {
                output: {
                    // CODE SPLITTING EXTREMO (Aislamiento de dependencias)
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            // Empaqueta librerías externas (ej. axios) en un binario separado para caché eterna
                            return id.toString().split('node_modules/')[1].split('/')[0].toString();
                        }
                    },
                    // Limpieza de nombres de archivos compilados
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]'
                }
            }
        },

        // ==========================================
        // 🛡️ 4. LIMPIEZA DE SEGURIDAD EN EJECUCIÓN
        // ==========================================
        esbuild: {
            // Elimina telemetría interna si lanzamos a producción
            drop: mode === 'production' ? ['console', 'debugger'] : [],
        }
    };
});
