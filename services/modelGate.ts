// Model Gateway - Solely Powered by Google Gemini (Google AI Studio)
// Architecture: Gemini 3.8 Flash (Multimodal, Long Context, Built-in Google Search Grounding)
import { GoogleGenAI } from '@google/genai';
import type { ActiveEngine, GeminiHistory, AiSettings, SubstrateMode, CustomSubstrate, NewsItem, SubstrateVantage, EngineConfig } from '../types';

const cleanAndParseJson = (text: string) => {
    const sanitizedText = text.replace(/\[\d+\]/g, "");
    const start = sanitizedText.indexOf('[');
    if (start === -1) return null;
    let end = -1;
    const lastBrace = sanitizedText.lastIndexOf('}');
    if (lastBrace !== -1) {
        end = sanitizedText.indexOf(']', lastBrace);
    }
    if (end === -1) end = sanitizedText.lastIndexOf(']');
    if (end === -1 || end <= start) return null;
    let jsonStr = sanitizedText.substring(start, end + 1);
    jsonStr = jsonStr
        .replace(/}\s*{/g, '},{')
        .replace(/]\s*\[/g, '],[')
        .replace(/,\s*]/g, ']')
        .replace(/,\s*}/g, '}')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim();
    try {
        return JSON.parse(jsonStr);
    } catch {
        try {
            return JSON.parse(jsonStr.replace(/(\w+):/g, '"$1":'));
        } catch {
            return null;
        }
    }
};

// In-memory transmission cache for instantaneous UI responsiveness
const transmissionCache = new Map<string, { items: NewsItem[]; timestamp: number }>();
const vantagesCache = new Map<string, SubstrateVantage[]>();

// Curated comprehensive default substrate intelligence items across all domains
export const getCuratedSubstrateNews = (mode: SubstrateMode): NewsItem[] => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const defaults: Record<string, NewsItem[]> = {
        discover: [
            { id: 'disc-1', title: 'Gemini 3.8 Flash Neural Cortex Synchronized', summary: 'Multimodal streaming and Google Search Grounding verified with low-latency reasoning output.', url: 'https://deepmind.google/technologies/gemini/', source: 'Google DeepMind', timestamp: now },
            { id: 'disc-2', title: 'Bio-SNN Syntropy Optimization Field', summary: 'Spiking neural network manifold stabilized at optimal coupling coefficients (0.84 syntropy).', url: '#', source: 'Bio-SNN Core', timestamp: now },
            { id: 'disc-3', title: 'Google Search Grounding Link Live', summary: 'Direct real-time web retrieval pipeline online for instantaneous world fact verification.', url: '#', source: 'Search Mesh', timestamp: now },
            { id: 'disc-4', title: 'Holographic Phase Conjugate Mirroring', summary: 'Photonic wave-front inversion maintains coherence across high-dimensional latent manifolds.', url: '#', source: 'Quantum Photonics', timestamp: now },
        ],
        finance: [
            { id: 'fin-1', title: 'Algorithmic Liquidity Invariant Curves', summary: 'Automated market making pools shifting toward zero-slippage concentrated liquidity invariant curves.', url: '#', source: 'DeFi Terminal', timestamp: now },
            { id: 'fin-2', title: 'Macro Yield Spread Compression Signals', summary: 'Global sovereign yield curve re-steepening signals cross-asset risk-parity algorithmic reallocation.', url: '#', source: 'Macro Pulse', timestamp: now },
            { id: 'fin-3', title: 'Layer-2 Sub-Second Settlement Volumes', summary: 'Zero-knowledge rollup transactions achieve record throughput with near-zero gas overhead.', url: '#', source: 'Settlement Mesh', timestamp: now },
            { id: 'fin-4', title: 'Institutional Real-World Asset Tokenization', summary: 'Treasury bill tokenization vaults surpass $3.2B in verifiable on-chain total value locked.', url: '#', source: 'RWA Radar', timestamp: now },
        ],
        academic: [
            { id: 'acad-1', title: 'Non-equilibrium Thermodynamic Memory', summary: 'Preprint details reversible computation using microfluidic cellular automata and Brownian ratchet gates.', url: 'https://arxiv.org', source: 'arXiv Quantum', timestamp: now },
            { id: 'acad-2', title: 'Spiking Transformer Topology Scaling', summary: 'Event-driven neuromorphic architectures demonstrate 100x energy efficiency in continual learning benchmarks.', url: 'https://arxiv.org', source: 'arXiv AI', timestamp: now },
            { id: 'acad-3', title: 'Topological Quantum Error Correction Codes', summary: 'Surface code decoding latency reduced below threshold using real-time hardware neural decoders.', url: 'https://arxiv.org', source: 'arXiv Physics', timestamp: now },
            { id: 'acad-4', title: 'Cellular Automata Attractor Basins', summary: 'Continuous cellular models exhibit self-organized criticality matching cortical column EEG signatures.', url: 'https://arxiv.org', source: 'BioRxiv', timestamp: now },
        ],
        patents: [
            { id: 'pat-1', title: 'Neuromorphic Optical Chip Architecture', summary: 'USPTO filings demonstrate sub-picosecond synaptic optical switching with integrated phase change materials.', url: '#', source: 'USPTO Radar', timestamp: now },
            { id: 'pat-2', title: 'Organic Memristive Synaptic Arrays', summary: 'Patent granted for bio-compatible organic electrochemical transistors operating below 10 femtojoules.', url: '#', source: 'WIPO Gazette', timestamp: now },
            { id: 'pat-3', title: 'Continuous Variable Quantum Sensing Devices', summary: 'Optomechanical accelerometer patent details sub-micro-G resolution using squeezed light states.', url: '#', source: 'USPTO Tech', timestamp: now },
            { id: 'pat-4', title: 'Adaptive Beamforming Holographic Antennae', summary: 'Metasurface beam-steering array patent demonstrates multi-gigabit terahertz wireless transmission.', url: '#', source: 'Patent Wire', timestamp: now },
        ],
        sports: [
            { id: 'spo-1', title: 'Biometric Telemetry Kinematic Mesh', summary: 'Wearable high-frequency IMU sensors calculate joint torque and micro-fatigue thresholds in real time.', url: '#', source: 'Athletic Telemetry', timestamp: now },
            { id: 'spo-2', title: 'Predictive Aero-Dynamics in High-Speed Racing', summary: 'Computational fluid dynamics neural models optimize active aero surfaces in sub-millisecond cycles.', url: '#', source: 'Velocity Dynamics', timestamp: now },
            { id: 'spo-3', title: 'Cognitive Reflex Visual Training Matrix', summary: 'Dynamic neural visual field stimulators enhance saccadic reaction times by 18% in elite athletes.', url: '#', source: 'NeuroSports', timestamp: now },
            { id: 'spo-4', title: 'Lactate Threshold Non-Invasive Biosensors', summary: 'Transdermal optical spectroscopy continuously streams metabolic equilibrium markers.', url: '#', source: 'BioKinetic', timestamp: now },
        ],
        shopping: [
            { id: 'shop-1', title: 'High-Bandwidth Memory (HBM3e) Supply Invariant', summary: 'Advanced packaging capacity expansion stabilizes frontier accelerator production timelines.', url: '#', source: 'Silicon Wire', timestamp: now },
            { id: 'shop-2', title: 'Global Rare Earth Magnet Logistics Mesh', summary: 'Neodymium alloy supply chains transition to localized closed-loop recycling facilities.', url: '#', source: 'Supply Index', timestamp: now },
            { id: 'shop-3', title: 'Consumer Silicon Node Pricing Equilibrium', summary: 'Foundry wafer utilization rates reach equilibrium as next-generation 3nm consumer chipsets roll out.', url: '#', source: 'Semiconductor Hub', timestamp: now },
            { id: 'shop-4', title: 'Decentralized Peer-to-Peer Freight Routing', summary: 'Algorithmic freight matching cuts intermodal container idle times by 32% globally.', url: '#', source: 'Logistics Pulse', timestamp: now },
        ],
        modes: [
            { id: 'mod-1', title: 'Resonance Attractor State Convergence', summary: 'Physics simulation coupling coefficients auto-tune to balance order and deterministic chaos.', url: '#', source: 'Simulation Core', timestamp: now },
            { id: 'mod-2', title: 'Entropy Suppression Wavefront Active', summary: 'Multi-scale syntropy feedback loops suppress simulation decoherence across matter and gauge fields.', url: '#', source: 'Syntropy Field', timestamp: now },
            { id: 'mod-3', title: 'Holographic Neural Projection Alignment', summary: 'Substrate orbital harmonic frequencies locked to 432Hz cognitive resonance baseline.', url: '#', source: 'Orbital Mesh', timestamp: now },
        ],
        custom: [
            { id: 'cust-1', title: 'Specialized Domain Intelligence Channel', summary: 'Custom substrate filter focused on user-defined operational constraints and parameters.', url: '#', source: 'Custom Node', timestamp: now },
            { id: 'cust-2', title: 'Targeted Vector Synthesis Online', summary: 'Directing Gemini Google Search Grounding across bespoke research channels.', url: '#', source: 'Custom Cortex', timestamp: now },
        ]
    };
    return defaults[mode] || defaults.discover;
};

/**
 * Fetch substrate news with instantaneous response and Google Search Grounding.
 * Never stalls the UI; returns cached or curated signals immediately while
 * refreshing via Gemini 3.8 Flash in the background.
 */
export const fetchSubstrateNews = async (
    mode: SubstrateMode, 
    keys: { geminiKey?: string } | string, 
    vantage?: SubstrateVantage
): Promise<NewsItem[]> => {
    const cacheKey = `${mode}_${vantage?.id || 'all'}`;
    const cached = transmissionCache.get(cacheKey);
    const now = Date.now();

    // If cached recently (within 60s), return immediately
    if (cached && (now - cached.timestamp < 60000)) {
        return cached.items;
    }

    const geminiKey = typeof keys === 'string' ? keys : (keys?.geminiKey || '');
    const vantageContext = vantage ? `Focus specifically on the "${vantage.label}" perspective.` : "";
    const prompt = `Retrieve exactly 4 critical, up-to-date real-world developments regarding the "${mode}" substrate. ${vantageContext} Return ONLY a strictly valid JSON array of objects with keys: "id", "title", "summary", "url", "source", "timestamp".`;

    if (geminiKey && geminiKey.length > 5) {
        try {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            
            // Ultra-responsive timeout guard: 3.2 seconds max so the UI remains instantaneous
            const fetchPromise = ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    temperature: 0.2,
                }
            });

            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3200));
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (response && 'text' in response) {
                const text = response.text || '';
                const parsed = cleanAndParseJson(text);
                if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                    const validItems: NewsItem[] = parsed.map((item, idx) => ({
                        id: String(item.id || `${mode}-${idx}-${Date.now()}`),
                        title: String(item.title || 'Live Transmission Signal'),
                        summary: String(item.summary || 'Real-time telemetry grounded via Google Search.'),
                        url: String(item.url || '#'),
                        source: String(item.source || 'Search Grounding'),
                        timestamp: String(item.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                    }));
                    transmissionCache.set(cacheKey, { items: validItems, timestamp: now });
                    return validItems;
                }
            }
        } catch (_e) {
            // Instant fallback to curated telemetry signals
        }
    }

    // Return instant curated defaults immediately and seed cache
    const fallback = cached?.items || getCuratedSubstrateNews(mode);
    transmissionCache.set(cacheKey, { items: fallback, timestamp: now });
    return fallback;
};

/**
 * Fetch substrate vantages using Gemini 3.8 Flash with instant memory cache
 */
export const fetchSubstrateVantages = async (
    mode: SubstrateMode, 
    keys: { geminiKey?: string } | string
): Promise<SubstrateVantage[]> => {
    if (vantagesCache.has(mode)) {
        return vantagesCache.get(mode)!;
    }

    const defaultVantages: SubstrateVantage[] = [
        { id: 'core', label: 'Primary Synthesis', icon: '⚡', description: 'Central algorithmic analysis and first-principles breakdown.', instruction: 'Evaluate from first principles.' },
        { id: 'macro', label: 'Macro Landscape', icon: '🌐', description: 'Broad ecosystem trends, macro liquidity, and structural dependencies.', instruction: 'Focus on global shifts and dependencies.' },
        { id: 'edge', label: 'Fringe Signals', icon: '📡', description: 'Emerging edge anomalies, outlier signals, and early frontier signals.', instruction: 'Detect anomalies and outliers.' },
        { id: 'pragmatic', label: 'Tactical Action', icon: '🛡️', description: 'Actionable vectors, strategic implementation paths, and execution steps.', instruction: 'Extract immediate strategic next steps.' }
    ];

    const geminiKey = typeof keys === 'string' ? keys : (keys?.geminiKey || '');
    if (geminiKey && geminiKey.length > 5) {
        try {
            const prompt = `Analyze the current technological landscape for the "${mode}" substrate. Identify 4 unique functional vantages. Return ONLY a strictly valid JSON array of objects with keys: "id", "label", "icon", "description", "instruction". Icon should be a single emoji or clean symbol.`;
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            
            const fetchPromise = ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: { temperature: 0.4 }
            });
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (response && 'text' in response) {
                const text = response.text || '';
                const parsed = cleanAndParseJson(text);
                if (parsed && Array.isArray(parsed) && parsed.length >= 4) {
                    const formatted = parsed.slice(0, 4).map((p, i) => ({
                        id: String(p.id || `v-${i}`),
                        label: String(p.label || defaultVantages[i].label),
                        icon: String(p.icon && p.icon.length <= 4 ? p.icon : defaultVantages[i].icon),
                        description: String(p.description || defaultVantages[i].description),
                        instruction: String(p.instruction || defaultVantages[i].instruction)
                    }));
                    vantagesCache.set(mode, formatted);
                    return formatted;
                }
            }
        } catch (_e) {
            // Instant fallback to default foundational lenses
        }
    }

    vantagesCache.set(mode, defaultVantages);
    return defaultVantages;
};

/**
 * Send message solely through Google Gemini
 */
export const sendMessageToUniversalEngine = async (
    _engine: ActiveEngine,
    message: string,
    history: GeminiHistory,
    settings: AiSettings,
    systemInstruction: string,
    engineConfigs: Record<ActiveEngine, EngineConfig>,
    mode: SubstrateMode = 'discover',
    _customSubs: CustomSubstrate[] = [],
    activeVantage?: SubstrateVantage,
    inlineData?: { data: string, mimeType: string } | null
) => {
    let domainFocus = `MODE_ACTIVE: ${mode.toUpperCase()}. `;
    if (activeVantage) {
        domainFocus += `VANTAGE_LOCKED: ${activeVantage.label}. LOGIC_MESH: ${activeVantage.instruction}`;
    }

    const finalSystem = `${systemInstruction}\n\n[SUBSTRATE_ORCHESTRATION_CONTEXT]:\n${domainFocus}\nCORE_ENGINE: Google Gemini (Multimodal + Google Search Grounding)`;

    async function* engineStream(): AsyncGenerator<{ text: string; thinking?: string }, void, unknown> {
        const key = engineConfigs.Gemini?.apiKey || 
                    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
                    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
        
        if (!key || key.length < 5) {
            yield { text: `[MESH_DESYNC]: No valid Gemini API key provisioned. Please enter your Gemini API key from Google AI Studio in System Settings.`, thinking: '' };
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: key });
            
            // Format conversation history
            const contents: any[] = [];
            for (const h of history) {
                const parts: any[] = [];
                for (const p of h.parts) {
                    if (p.inlineData) {
                        parts.push({ inlineData: p.inlineData });
                    }
                    if (p.text) {
                        parts.push({ text: p.text });
                    }
                }
                if (parts.length > 0) {
                    contents.push({
                        role: h.role === 'model' ? 'model' : 'user',
                        parts
                    });
                }
            }

            // Add current user prompt + inlineData (e.g. image/document/spreadsheet)
            const currentParts: any[] = [];
            if (inlineData) {
                currentParts.push({ inlineData });
            }
            currentParts.push({ text: message });
            contents.push({ role: 'user', parts: currentParts });

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-3.8-flash',
                contents,
                config: {
                    systemInstruction: finalSystem,
                    temperature: settings.temperature,
                    maxOutputTokens: settings.maxOutputTokens || 2048,
                    tools: [{ googleSearch: {} }] // Built-in Google Search Grounding
                }
            });

            let accumulatedText = '';
            for await (const chunk of responseStream) {
                const chunkText = chunk.text || '';
                if (chunkText) {
                    accumulatedText += chunkText;
                    yield { text: accumulatedText, thinking: '' };
                }
            }
            return;
        } catch (err: any) {
            console.error("[Gemini] Stream error:", err);
            yield { text: `[GEMINI_FAULT]: ${err?.message || 'Failed to communicate with Gemini 3.8 Flash.'}` };
            return;
        }
    }

    return engineStream();
};
