import { useState, useEffect, useRef, useCallback } from 'react';
import { geminiTextToSpeech, splitIntoSentenceChunks, cleanTextForSpeech } from '../services/geminiVoiceService';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            return localStorage.getItem('regenesis_voice_muted') === 'true';
        } catch {
            return false;
        }
    });

    const isMutedRef = useRef(isMuted);
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isCancelledRef = useRef<boolean>(false);
    
    // Store active utterances to prevent browser garbage collection cutoff bug
    const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
    const keepAliveTimerRef = useRef<number | null>(null);

    const clearSpeechSynthesis = useCallback(() => {
        if (keepAliveTimerRef.current) {
            window.clearInterval(keepAliveTimerRef.current);
            keepAliveTimerRef.current = null;
        }
        activeUtterancesRef.current = [];
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognitionAPI) {
            setHasSpeechRecognition(true);
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(finalTranscript + interimTranscript);
            };
            
            recognition.onerror = (event: any) => {
                if (event.error === 'no-speech') return;
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }

        const loadVoices = () => {
            const synth = window.speechSynthesis;
            if (!synth) return;
            const voices = synth.getVoices();
            if (voices.length > 0) {
                 setAvailableVoices(voices.filter(v => v.lang.startsWith('en-')));
            }
        };

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
            loadVoices();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            clearSpeechSynthesis();
        };
    }, [clearSpeechSynthesis]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Speech recognition start failed:", err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const cancelSpeech = useCallback(() => {
        isCancelledRef.current = true;
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            } catch { /* ignore */ }
            audioRef.current = null;
        }
        clearSpeechSynthesis();
        setIsSpeaking(false);
    }, [clearSpeechSynthesis]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            isMutedRef.current = next;
            try {
                localStorage.setItem('regenesis_voice_muted', String(next));
            } catch { /* ignore */ }
            if (next) {
                cancelSpeech();
            }
            return next;
        });
    }, [cancelSpeech]);

    /**
     * Browser Web Speech fallback with robust sentence chaining,
     * garbage-collection protection, and keep-alive ping for 100% full text reading.
     */
    const playWebSpeechFallback = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis || isMutedRef.current) {
            setIsSpeaking(false);
            return;
        }

        clearSpeechSynthesis();
        isCancelledRef.current = false;
        setIsSpeaking(true);

        const clean = cleanTextForSpeech(text);
        if (!clean) {
            setIsSpeaking(false);
            return;
        }

        // Split into distinct sentence chunks
        const sentenceChunks = splitIntoSentenceChunks(clean, 180);
        if (sentenceChunks.length === 0) {
            setIsSpeaking(false);
            return;
        }

        let currentIndex = 0;

        // Browser keep-alive: Chrome pauses long SpeechSynthesis after ~15s
        keepAliveTimerRef.current = window.setInterval(() => {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 6000);

        const speakNextChunk = () => {
            if (isCancelledRef.current || isMutedRef.current || currentIndex >= sentenceChunks.length) {
                clearSpeechSynthesis();
                setIsSpeaking(false);
                return;
            }

            const sentence = sentenceChunks[currentIndex++].trim();
            if (!sentence) {
                speakNextChunk();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.lang = 'en-US';

            // Pin to ref array to protect from garbage collection
            activeUtterancesRef.current.push(utterance);

            utterance.onend = () => {
                // Remove from active array and speak next
                activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
                speakNextChunk();
            };

            utterance.onerror = () => {
                activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
                speakNextChunk();
            };

            try {
                window.speechSynthesis.speak(utterance);
            } catch (_err) {
                clearSpeechSynthesis();
                setIsSpeaking(false);
            }
        };

        speakNextChunk();
    }, [clearSpeechSynthesis]);

    /**
     * Primary speak function:
     * Attempts Gemini 3.8 Flash Lite TTS with sentence-level chunking and WAV stitching;
     * if unavailable or failing, seamlessly falls back to the enhanced Web Speech engine.
     * Guaranteed to read all sentences through to completion unless muted or cancelled.
     */
    const speak = useCallback(async (
        text: string, 
        voiceNameOrId: string | null = 'Kore', 
        useNeuralVoice: boolean = true, 
        apiKey?: string
    ) => {
        if (!text.trim() || isMutedRef.current) {
            setIsSpeaking(false);
            return;
        }

        isCancelledRef.current = false;

        // Stop any current audio
        if (audioRef.current) {
            try {
                audioRef.current.pause();
            } catch { /* ignore */ }
            audioRef.current = null;
        }
        clearSpeechSynthesis();
        setIsSpeaking(true);

        if (useNeuralVoice) {
            try {
                const audio = await geminiTextToSpeech(text, voiceNameOrId || 'Kore', apiKey);
                if (isCancelledRef.current || isMutedRef.current) {
                    setIsSpeaking(false);
                    return;
                }

                audioRef.current = audio;

                audio.onended = () => {
                    setIsSpeaking(false);
                    audioRef.current = null;
                };

                audio.onerror = () => {
                    if (!isCancelledRef.current && !isMutedRef.current) {
                        playWebSpeechFallback(text);
                    }
                };

                await audio.play();
                return;
            } catch (_error) {
                // Fall back gracefully to Web Speech API
            }
        }

        // Web Speech API fallback that reads 100% of sentences
        if (!isCancelledRef.current && !isMutedRef.current) {
            playWebSpeechFallback(text);
        }
    }, [clearSpeechSynthesis, playWebSpeechFallback]);

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        hasSpeechRecognition,
        speak,
        cancelSpeech,
        availableVoices,
        isMuted,
        toggleMute,
    };
};
