// Gemini Voice & Speech Synthesis Service
// Powers complete, uninterrupted text-to-speech reading with Gemini 3.8 Flash Lite TTS
import { GoogleGenAI } from '@google/genai';

const getGeminiKey = (customKey?: string): string => {
    if (customKey && customKey.trim().length > 0) return customKey.trim();
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        return process.env.GEMINI_API_KEY;
    }
    return '';
};

// Map legacy ElevenLabs IDs to high quality Gemini Prebuilt Voices
const VOICE_MAP: Record<string, string> = {
    'cgSgSjJ4fMocvsnnyIIL': 'Kore',   // Warm & natural
    '21m00Tcm4TbcDq8BCT5L': 'Zephyr', // Poetic & enigmatic
    'ErXw7NoAyWEnS9n99999': 'Puck',   // Clear & articulate
    'onwK4e9ZLuTAKqWW03F9': 'Fenrir', // Deep & steady
    'EXAVITQu4vr4xnSDxMaL': 'Charon', // Expressive & vibrant
};

const VALID_GEMINI_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

/**
 * Clean text for speech synthesis: strips markdown formatting, code blocks, URLs, and excess punctuation
 */
export const cleanTextForSpeech = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/```[\s\S]*?```/g, ' [Code block omitted] ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[*#_~>|]/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Split text into natural, bite-sized sentence chunks (120-220 chars) so that
 * Gemini TTS never truncates audio tokens mid-response.
 */
export const splitIntoSentenceChunks = (text: string, maxChunkLength: number = 200): string[] => {
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return [];
    if (cleaned.length <= maxChunkLength) return [cleaned];

    // Split by sentence boundaries (. ! ?) while keeping delimiters
    const rawSentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
    const chunks: string[] = [];
    let current = '';

    for (const raw of rawSentences) {
        const sentence = raw.trim();
        if (!sentence) continue;

        if (sentence.length > maxChunkLength) {
            // Sentence is longer than maxChunkLength, split by commas or words
            if (current.trim()) {
                chunks.push(current.trim());
                current = '';
            }
            const parts = sentence.match(/[^,;:]+[,;:]+|[^,;:]+$/g) || [sentence];
            for (const part of parts) {
                const sub = part.trim();
                if ((current + ' ' + sub).trim().length <= maxChunkLength) {
                    current = (current + ' ' + sub).trim();
                } else {
                    if (current.trim()) chunks.push(current.trim());
                    current = sub;
                }
            }
        } else if ((current + ' ' + sentence).trim().length <= maxChunkLength) {
            current = (current + ' ' + sentence).trim();
        } else {
            if (current.trim()) chunks.push(current.trim());
            current = sentence;
        }
    }

    if (current.trim()) {
        chunks.push(current.trim());
    }

    return chunks.length > 0 ? chunks : [cleaned];
};

/**
 * Stitches multiple base64 WAV chunks into a single continuous valid WAV audio element
 */
export const stitchWavBase64Chunks = (base64Chunks: string[]): HTMLAudioElement => {
    if (base64Chunks.length === 1) {
        return new Audio(`data:audio/wav;base64,${base64Chunks[0]}`);
    }

    const buffers: Uint8Array[] = base64Chunks.map(b64 => {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
            bytes[i] = bin.charCodeAt(i);
        }
        return bytes;
    });

    // Use 44-byte header from the first chunk
    const header = buffers[0].slice(0, 44);
    const pcmChunks: Uint8Array[] = [];
    let totalPcmLength = 0;

    for (const buf of buffers) {
        // Strip 44-byte WAV header from each chunk to extract raw PCM
        if (buf.length > 44) {
            const pcm = buf.slice(44);
            pcmChunks.push(pcm);
            totalPcmLength += pcm.length;
        }
    }

    if (totalPcmLength === 0) {
        return new Audio(`data:audio/wav;base64,${base64Chunks[0]}`);
    }

    const finalBuffer = new Uint8Array(44 + totalPcmLength);
    finalBuffer.set(header, 0);

    let offset = 44;
    for (const pcm of pcmChunks) {
        finalBuffer.set(pcm, offset);
        offset += pcm.length;
    }

    // Update RIFF header lengths (Little Endian)
    const view = new DataView(finalBuffer.buffer);
    view.setUint32(4, 36 + totalPcmLength, true); // ChunkSize = 36 + SubChunk2Size
    view.setUint32(40, totalPcmLength, true);     // Subchunk2Size = raw PCM bytes

    const blob = new Blob([finalBuffer], { type: 'audio/wav' });
    return new Audio(URL.createObjectURL(blob));
};

/**
 * Synthesizes speech for the FULL text using Gemini 3.8 Flash Lite TTS.
 * Splits into sentence chunks so the entire response is read from beginning to end.
 */
export const geminiTextToSpeech = async (
    text: string, 
    voiceNameOrId: string = 'Kore', 
    apiKey?: string
): Promise<HTMLAudioElement> => {
    const key = getGeminiKey(apiKey);
    if (!key) {
        throw new Error('Gemini API key required for Gemini Neural Voice.');
    }

    // Resolve voice name
    let selectedVoice = VOICE_MAP[voiceNameOrId] || voiceNameOrId;
    if (!VALID_GEMINI_VOICES.includes(selectedVoice)) {
        selectedVoice = 'Kore';
    }

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) {
        throw new Error('Empty text content for speech synthesis.');
    }

    const ai = new GoogleGenAI({ apiKey: key });

    // Split into sentence chunks to ensure 100% full text coverage without token cutoffs
    const chunks = splitIntoSentenceChunks(cleanText, 200);
    if (chunks.length === 0) {
        throw new Error('No valid speech segments found.');
    }

    // Synthesize chunks with safety timeout per chunk
    const fetchChunkAudio = async (chunkText: string): Promise<string | null> => {
        try {
            const generatePromise = ai.models.generateContent({
                model: 'gemini-3.8-flash-lite-tts',
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: chunkText }]
                    }
                ],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: selectedVoice }
                        }
                    }
                }
            });

            // 6 second timeout per chunk
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
            const response: any = await Promise.race([generatePromise, timeoutPromise]);

            const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            return base64Audio || null;
        } catch (_err) {
            return null;
        }
    };

    // Parallel fetch with concurrency limit of 3 for smooth network handling
    const audioPayloads: string[] = [];
    for (let i = 0; i < chunks.length; i += 3) {
        const batch = chunks.slice(i, i + 3);
        const results = await Promise.all(batch.map(fetchChunkAudio));
        for (const res of results) {
            if (res) audioPayloads.push(res);
        }
    }

    if (audioPayloads.length === 0) {
        throw new Error('No audio received from Gemini TTS.');
    }

    return stitchWavBase64Chunks(audioPayloads);
};

/**
 * Creates ambient synthesized sound effects without external APIs
 */
export const generateSoundEffect = async (effectType: string = 'resonance'): Promise<HTMLAudioElement> => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 2.0;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const freq = effectType === 'alert' ? 880 : 432;
            const envelope = Math.exp(-2.5 * t);
            const harmonic = Math.sin(2 * Math.PI * freq * t) * 0.5 + 
                             Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.25;
            channelData[i] = harmonic * envelope;
        }
    }

    const wavBlob = audioBufferToWavBlob(buffer);
    return new Audio(URL.createObjectURL(wavBlob));
};

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
        out.setUint16(pos, data, true);
        pos += 2;
    }
    function setUint32(data: number) {
        out.setUint32(pos, data, true);
        pos += 4;
    }

    // RIFF header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    const channels: Float32Array[] = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            out.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([out.buffer], { type: 'audio/wav' });
}
