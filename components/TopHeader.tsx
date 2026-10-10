import React from 'react';
import type { ActiveEngine, Personality } from '../types';

interface TopHeaderProps {
    activeEngine: ActiveEngine;
    onEngineChange: (engine: ActiveEngine) => void;
    selectedPersona: Personality;
    stability: number;
    bond: number;
    isSpeaking: boolean;
    onAlignLayout: () => void;
    onOpenSettings: () => void;
    
    // Window visibility toggles
    isChatOpen: boolean;
    onToggleChat: () => void;
    isAvatarVisible: boolean;
    onToggleAvatar: () => void;
    isSubstrateVisible: boolean;
    onToggleSubstrate: () => void;
    isTelemetryOpen: boolean;
    onToggleTelemetry: () => void;
    isHubOpen: boolean;
    onToggleHub: () => void;
    isFeedOpen: boolean;
    onToggleFeed: () => void;
    
    neuralVoiceActive: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
}

const ENGINES: ActiveEngine[] = ['Gemini'];

const TopHeader: React.FC<TopHeaderProps> = ({
    activeEngine,
    onEngineChange,
    selectedPersona,
    stability,
    bond,
    isSpeaking,
    onAlignLayout,
    onOpenSettings,
    isChatOpen,
    onToggleChat,
    isAvatarVisible,
    onToggleAvatar,
    isSubstrateVisible,
    onToggleSubstrate,
    isTelemetryOpen,
    onToggleTelemetry,
    isHubOpen,
    onToggleHub,
    isFeedOpen,
    onToggleFeed,
    neuralVoiceActive,
    isMuted,
    onToggleMute
}) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-slate-950/85 backdrop-blur-2xl border-b border-violet-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between px-3 sm:px-5 pointer-events-auto select-none">
            {/* Left: App Logo & Name */}
            <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.4)] group cursor-pointer" onClick={onAlignLayout} title="Click to auto-align layout">
                    <svg className="w-5 h-5 text-violet-300 animate-[pulse_3s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                    </svg>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-ping" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm sm:text-base font-black tracking-[0.2em] uppercase bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent font-sans">
                            RE-GENESIS INTELLIGENCE
                        </h1>
                        <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest bg-violet-500/15 text-violet-300 border border-violet-500/30">
                            v2.4 NEURAL OS
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-2">
                        <span>CORE STATUS: <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span></span>
                        <span className="text-slate-600">•</span>
                        <span className="text-violet-300 font-semibold">{selectedPersona.name.toUpperCase()}</span>
                    </span>
                </div>
            </div>

            {/* Center: System Status & Engine Switcher */}
            <div className="hidden lg:flex items-center gap-2.5 bg-slate-900/60 border border-violet-500/20 rounded-full px-3 py-1 backdrop-blur-md">
                {/* Active Engine Pills */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400 font-bold tracking-widest uppercase mr-0.5">ENGINE:</span>
                    <button
                        type="button"
                        onClick={() => onEngineChange('Gemini')}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)] border border-violet-400 flex items-center gap-1.5"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>GEMINI 3.8 FLASH</span>
                    </button>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        SEARCH GROUNDED
                    </span>
                </div>

                <div className="w-px h-4 bg-violet-500/20" />

                {/* Stability Meter */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono" title="Simulation Syntropy & Stability">
                    <span className="text-slate-500 font-bold">STABILITY</span>
                    <span className={`font-bold ${stability > 0.6 ? 'text-emerald-400' : stability > 0.3 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {Math.round(stability * 100)}%
                    </span>
                </div>

                <div className="w-px h-4 bg-violet-500/20" />

                {/* Bond Level */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono" title="Neural Resonance Bond">
                    <span className="text-slate-500 font-bold">BOND</span>
                    <span className="text-cyan-400 font-bold">{Math.round(bond)}%</span>
                </div>

                {/* Voice / Audio Status & Mute Control */}
                <div className="w-px h-4 bg-violet-500/20" />
                <button
                    type="button"
                    onClick={onToggleMute}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition-all shadow-sm ${
                        isMuted
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                            : isSpeaking
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                            : 'bg-purple-500/15 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30'
                    }`}
                    title={isMuted ? "Voice is MUTED (Click to Unmute)" : isSpeaking ? "Voice is SPEAKING (Click to Mute/Stop)" : "Voice is ON (Click to Mute)"}
                >
                    {isMuted ? (
                        <>
                            <span>🔇</span>
                            <span>MUTED</span>
                        </>
                    ) : (
                        <>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'}`} />
                            <span>{isSpeaking ? 'SPEAKING' : 'VOICE ON'}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Right: Layout Controls & Window Dock */}
            <div className="flex items-center gap-2">
                {/* Auto-Align Button */}
                <button
                    type="button"
                    onClick={onAlignLayout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-violet-600/20 hover:bg-violet-600/40 text-violet-200 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all active:scale-95"
                    title="Align all windows, avatar, and substrate into an immaculate balanced grid"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span className="hidden sm:inline">Align Layout</span>
                </button>

                <div className="w-px h-5 bg-violet-500/20 mx-1 hidden sm:block" />

                {/* Window Toggles Dock */}
                <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-700/60 rounded-lg p-1">
                    {/* Chat Node Toggle */}
                    <button
                        type="button"
                        onClick={onToggleChat}
                        className={`p-1.5 rounded-md transition-all ${
                            isChatOpen 
                                ? 'bg-violet-600/40 text-violet-200 border border-violet-400/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title="Toggle Chat Node Window"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>

                    {/* Avatar Toggle */}
                    <button
                        type="button"
                        onClick={onToggleAvatar}
                        className={`p-1.5 rounded-md transition-all ${
                            isAvatarVisible 
                                ? 'bg-violet-600/40 text-violet-200 border border-violet-400/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title="Toggle Neural Avatar Head"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="5" />
                            <path d="M20 21a8 8 0 0 0-16 0" />
                        </svg>
                    </button>

                    {/* Substrate Orbit Toggle */}
                    <button
                        type="button"
                        onClick={onToggleSubstrate}
                        className={`p-1.5 rounded-md transition-all ${
                            isSubstrateVisible 
                                ? 'bg-violet-600/40 text-violet-200 border border-violet-400/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title="Toggle Substrate Orbit Circle"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 3a9 9 0 0 0 0 18" />
                        </svg>
                    </button>

                    {/* Telemetry Hub Toggle */}
                    <button
                        type="button"
                        onClick={onToggleTelemetry}
                        className={`p-1.5 rounded-md transition-all ${
                            isTelemetryOpen 
                                ? 'bg-violet-600/40 text-violet-200 border border-violet-400/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title="Toggle Telemetry Hub Window"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </button>

                    {/* Substrate Orchestrator Toggle */}
                    <button
                        type="button"
                        onClick={onToggleHub}
                        className={`p-1.5 rounded-md transition-all ${
                            isHubOpen 
                                ? 'bg-violet-600/40 text-violet-200 border border-violet-400/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title="Toggle Substrate Orchestrator Hub"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="8" rx="2" />
                            <rect x="2" y="14" width="20" height="8" rx="2" />
                            <line x1="6" y1="6" x2="6.01" y2="6" />
                            <line x1="6" y1="18" x2="6.01" y2="18" />
                        </svg>
                    </button>

                    {/* Live Stream / Feed Toggle */}
                    <button
                        type="button"
                        onClick={onToggleFeed}
                        className={`p-1.5 rounded-md transition-all ${
                            isFeedOpen 
                                ? 'bg-violet-600/40 text-violet-200 border border-violet-400/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title="Toggle Live Transmission Feed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 11a9 9 0 0 1 9 9" />
                            <path d="M4 4a16 16 0 0 1 16 16" />
                            <circle cx="5" cy="19" r="1" />
                        </svg>
                    </button>
                </div>

                {/* Audio Mute Quick Toggle */}
                <button
                    type="button"
                    onClick={onToggleMute}
                    className={`p-2 border rounded-lg transition-all shadow-lg active:scale-95 ${
                        isMuted 
                            ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:border-rose-400' 
                            : isSpeaking
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-white hover:border-violet-500'
                    }`}
                    title={isMuted ? "Unmute Voice Output" : isSpeaking ? "Voice is speaking — click to mute/stop" : "Mute Voice Output"}
                >
                    {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                    )}
                </button>

                {/* Settings Button */}
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="p-2 bg-slate-900/60 border border-slate-700/60 hover:border-violet-500 rounded-lg text-slate-300 hover:text-white transition-all shadow-lg active:scale-95"
                    title="Open System Settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default TopHeader;
