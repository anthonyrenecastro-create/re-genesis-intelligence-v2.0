// Gemini Services for Multimodal & Media Capabilities
import { GoogleGenAI } from '@google/genai';
import type { GeminiHistory, AiSettings, ActiveEngine } from '../types';

/**
 * Legacy wrapper redirecting to modelGate
 */
export const sendMessageToBot = async (
    message: string, 
    history: GeminiHistory, 
    settings: AiSettings, 
    systemInstruction: string,
    activeEngine: ActiveEngine,
    connectedSources: string[]
) => {
    throw new Error("sendMessageToBot is deprecated. Use sendMessageToUniversalEngine from modelGate.ts");
};

/**
 * Generate Avatar / Image using Gemini Image generation (gemini-3.1-flash-lite-image)
 * with graceful fallback to vector neural avatar.
 */
export const generateImage = async (prompt: string, apiKey?: string): Promise<string> => {
    const key = apiKey || (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';
    
    if (key && key.length > 5) {
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                }
            });

            const base64Bytes = response.generatedImages?.[0]?.image?.imageBytes;
            if (base64Bytes) {
                return `data:image/jpeg;base64,${base64Bytes}`;
            }
        } catch (_error) {
            // Graceful fallback to crisp vector hologram avatar
        }
    }

    // Dynamic vector hologram avatar fallback
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 40));
    const svg = `
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#0f0728;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#1e104a;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#080417;stop-opacity:1" />
                </linearGradient>
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
                    <stop offset="60%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0" />
                </radialGradient>
            </defs>
            <rect width="512" height="512" fill="url(#bgGrad)"/>
            <circle cx="256" cy="256" r="180" fill="url(#coreGlow)" />
            <circle cx="256" cy="256" r="120" fill="none" stroke="#a78bfa" stroke-width="2" stroke-dasharray="8 6" opacity="0.6"/>
            <circle cx="256" cy="256" r="90" fill="none" stroke="#60a5fa" stroke-width="1.5" opacity="0.5"/>
            <circle cx="256" cy="256" r="60" fill="none" stroke="#c084fc" stroke-width="1" opacity="0.7"/>
            <!-- Cybernetic eye markers -->
            <circle cx="216" cy="230" r="8" fill="#a78bfa" filter="drop-shadow(0 0 6px #8b5cf6)"/>
            <circle cx="296" cy="230" r="8" fill="#60a5fa" filter="drop-shadow(0 0 6px #3b82f6)"/>
            <path d="M 236 280 Q 256 295 276 280" stroke="#c084fc" stroke-width="2" fill="none" opacity="0.7"/>
            <text x="50%" y="370" text-anchor="middle" fill="#e2e8f0" font-size="14" font-family="monospace" letter-spacing="3">
                GENESIS // COGNITIVE CORE
            </text>
            <text x="50%" y="395" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="monospace">
                ${prompt.slice(0, 36)}...
            </text>
        </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
};

/**
 * Video Generation placeholder / state handler
 */
export const generateVideo = async (prompt: string, onProgress?: (msg: string) => void): Promise<string> => {
    if (onProgress) onProgress("Veo video substrate pipeline initializing...");
    await new Promise(resolve => setTimeout(resolve, 800));
    throw new Error("Video generation requires Veo endpoint authorization.");
};
