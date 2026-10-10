import React, { useState, useMemo, useEffect } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import type { SubstrateMode, CustomSubstrate, SubstrateVantage, NewsItem } from '../types';

interface SubstrateCircleProps {
    currentMode: SubstrateMode;
    onModeChange: (mode: SubstrateMode) => void;
    customSubstrates: CustomSubstrate[];
    onAddCustom: (sub: CustomSubstrate) => void;
    onOpenFeed: () => void;
    vantages: SubstrateVantage[];
    activeVantage: SubstrateVantage | null;
    onVantageChange: (vantage: SubstrateVantage | null) => void;
    isScanning: boolean;
    onSyncTransmissions?: () => void;
    transmissions?: NewsItem[];
    isTransmissionsLoading?: boolean;
    onAnalyzeTransmission?: (item: NewsItem) => void;
    isMuted?: boolean;
    onToggleMute?: () => void;
    isSpeaking?: boolean;
}

const BASE_MODES: { id: SubstrateMode; icon: string; label: string; desc: string; color: string; freq: string }[] = [
    { id: 'discover', icon: '🌐', label: 'Global', desc: 'Frontier AI & DeepMind Telemetry', color: '#8b5cf6', freq: '142.8 MHz' },
    { id: 'finance', icon: '📈', label: 'Finance', desc: 'Macro Yields & Liquidity Invariants', color: '#10b981', freq: '188.4 MHz' },
    { id: 'academic', icon: '🎓', label: 'Academic', desc: 'arXiv Quantum & SNN Preprints', color: '#3b82f6', freq: '215.1 MHz' },
    { id: 'patents', icon: '📜', label: 'Patents', desc: 'USPTO Photonic & Bio-Chips', color: '#f59e0b', freq: '270.6 MHz' },
    { id: 'sports', icon: '⚽', label: 'Sports', desc: 'Kinematic & Athletic Telemetry', color: '#ef4444', freq: '312.0 MHz' },
    { id: 'shopping', icon: '🛒', label: 'Shopping', desc: 'Silicon & Hardware Supply Chains', color: '#ec4899', freq: '344.5 MHz' },
    { id: 'modes', icon: '🕸️', label: 'Modes', desc: 'Simulation Attractor Dynamics', color: '#06b6d4', freq: '432.0 MHz' },
];

const VANTAGE_ICONS: Record<string, string> = {
    core: '⚡',
    macro: '🌐',
    edge: '📡',
    pragmatic: '🛡️',
};

const SubstrateCircle: React.FC<SubstrateCircleProps> = ({ 
    currentMode, 
    onModeChange, 
    customSubstrates, 
    onAddCustom,
    onOpenFeed,
    vantages,
    activeVantage,
    onVantageChange,
    isScanning,
    onSyncTransmissions,
    transmissions = [],
    isTransmissionsLoading = false,
    onAnalyzeTransmission,
    isMuted = false,
    onToggleMute,
    isSpeaking = false
}) => {
    const { ref, style, handleMouseDown } = useDraggable('substrate-circle', { 
        x: Math.round(window.innerWidth / 2 - 215), 
        y: Math.max(260, window.innerHeight - 480) 
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newIcon, setNewIcon] = useState('🧠');
    const [activeTransmissionIdx, setActiveTransmissionIdx] = useState(0);
    const [isPulsing, setIsPulsing] = useState(false);
    const [viewTab, setViewTab] = useState<'ticker' | 'channels'>('ticker');

    const allModes = useMemo(() => [
        ...BASE_MODES,
        ...customSubstrates.map(s => ({ 
            id: 'custom' as SubstrateMode, 
            icon: s.icon, 
            label: s.label, 
            desc: s.instruction,
            color: '#a855f7',
            freq: '999.0 MHz'
        }))
    ], [customSubstrates]);

    const filteredModes = allModes.filter(m => 
        m.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Keep active transmission index in bounds when items update
    useEffect(() => {
        if (transmissions.length > 0 && activeTransmissionIdx >= transmissions.length) {
            setActiveTransmissionIdx(0);
        }
    }, [transmissions, activeTransmissionIdx]);

    const currentTransmission = transmissions[activeTransmissionIdx] || transmissions[0] || null;

    const handleCreate = () => {
        if (!newLabel.trim()) return;
        onAddCustom({
            id: `custom-${Date.now()}`,
            label: newLabel.trim(),
            icon: newIcon,
            instruction: `Focus all intelligence on the specialized domain of ${newLabel.trim()}. Prioritize depth in this specific substrate.`
        });
        setNewLabel('');
        setIsAdding(false);
    };

    const handleManualSync = () => {
        setIsPulsing(true);
        if (onSyncTransmissions) onSyncTransmissions();
        setTimeout(() => setIsPulsing(false), 900);
    };

    const handleNextTransmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (transmissions.length <= 1) return;
        setActiveTransmissionIdx((prev) => (prev + 1) % transmissions.length);
    };

    const handlePrevTransmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (transmissions.length <= 1) return;
        setActiveTransmissionIdx((prev) => (prev - 1 + transmissions.length) % transmissions.length);
    };

    // Radii for clean orbital spacing
    const size = 430;
    const center = size / 2;
    const outerRadius = 168;
    const innerRadius = 104;

    const currentModeMeta = allModes.find(m => m.id === currentMode) || BASE_MODES[0];

    return (
        <div 
            ref={ref} 
            style={style} 
            className="is-draggable pointer-events-auto z-[60] select-none"
        >
            <div 
                style={{ width: `${size}px`, height: `${size}px` }}
                className="relative bg-slate-950/90 backdrop-blur-3xl border border-violet-500/35 rounded-full flex items-center justify-center shadow-[0_0_90px_rgba(139,92,246,0.35)] transition-shadow duration-500 overflow-visible"
            >
                {/* Dedicated Drag Bar at Top */}
                <div 
                    onMouseDown={handleMouseDown}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-slate-900/95 border border-violet-500/40 rounded-full text-[8px] font-mono font-bold tracking-widest text-violet-300 uppercase cursor-move flex items-center gap-2 shadow-xl hover:border-violet-300 transition-all z-40 active:scale-95"
                    title="Drag to reposition Transmission Orbit Control Center"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>TRANSMISSION CONTROL CENTER</span>
                    <svg className="w-3 h-3 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                    </svg>
                </div>

                {/* Radar & Holographic SVG Orbital Elements */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Cardinal Compass Markers */}
                    <line x1="50%" y1="4%" x2="50%" y2="9%" stroke="rgba(139, 92, 246, 0.45)" strokeWidth="1.5" />
                    <line x1="50%" y1="91%" x2="50%" y2="96%" stroke="rgba(139, 92, 246, 0.45)" strokeWidth="1.5" />
                    <line x1="4%" y1="50%" x2="9%" y2="50%" stroke="rgba(139, 92, 246, 0.45)" strokeWidth="1.5" />
                    <line x1="91%" y1="50%" x2="96%" y2="50%" stroke="rgba(139, 92, 246, 0.45)" strokeWidth="1.5" />

                    {/* Outer Orbit Line (Channels) */}
                    <circle 
                        cx="50%" 
                        cy="50%" 
                        r={outerRadius} 
                        fill="none" 
                        stroke="rgba(139, 92, 246, 0.25)" 
                        strokeWidth="1" 
                        strokeDasharray="4 6" 
                        className="animate-[spin_90s_linear_infinite]" 
                    />

                    {/* Inner Orbit Line (Vantages) */}
                    <circle 
                        cx="50%" 
                        cy="50%" 
                        r={innerRadius} 
                        fill="none" 
                        stroke="rgba(139, 92, 246, 0.35)" 
                        strokeWidth="1" 
                        strokeDasharray="2 4" 
                        className="animate-[spin_45s_linear_infinite_reverse]" 
                    />

                    {/* Scanning Beam Radar Sweep */}
                    <circle 
                        cx="50%" 
                        cy="50%" 
                        r={innerRadius - 12} 
                        fill="none" 
                        stroke={isScanning || isPulsing || isTransmissionsLoading ? "rgba(139, 92, 246, 0.6)" : "rgba(139, 92, 246, 0.15)"} 
                        strokeWidth={isScanning || isPulsing || isTransmissionsLoading ? "2" : "1"} 
                        className={isScanning || isPulsing || isTransmissionsLoading ? "animate-ping" : ""} 
                    />

                    {/* Laser Ray to Active Mode */}
                    {(() => {
                        const activeIdx = filteredModes.findIndex(m => m.id === currentMode);
                        if (activeIdx >= 0) {
                            const angle = (activeIdx / filteredModes.length) * Math.PI * 2 - Math.PI / 2;
                            const x2 = center + Math.cos(angle) * outerRadius;
                            const y2 = center + Math.sin(angle) * outerRadius;
                            return (
                                <line 
                                    x1={center} 
                                    y1={center} 
                                    x2={x2} 
                                    y2={y2} 
                                    stroke="rgba(139, 92, 246, 0.5)" 
                                    strokeWidth="1.5"
                                    strokeDasharray="3 3"
                                />
                            );
                        }
                        return null;
                    })()}

                    {/* Optical Rays to Vantages */}
                    {vantages.map((v, i) => {
                        const angle = (i / vantages.length) * Math.PI * 2 - Math.PI / 2;
                        const x2 = center + Math.cos(angle) * innerRadius;
                        const y2 = center + Math.sin(angle) * innerRadius;
                        const isVantageActive = activeVantage?.id === v.id;
                        return (
                            <line 
                                key={`v-ray-${v.id}-${i}`}
                                x1={center} 
                                y1={center} 
                                x2={x2} 
                                y2={y2} 
                                stroke={isVantageActive ? "rgba(217, 70, 239, 0.7)" : "rgba(139, 92, 246, 0.2)"} 
                                strokeWidth={isVantageActive ? "1.5" : "0.75"}
                            />
                        );
                    })}
                </svg>

                {/* Outer Orbit Nodes: Transmission Channels */}
                {filteredModes.map((mode, index) => {
                    const angle = (index / filteredModes.length) * Math.PI * 2 - Math.PI / 2;
                    const x = center + Math.cos(angle) * outerRadius - 20; // 40px width -> -20 offset
                    const y = center + Math.sin(angle) * outerRadius - 20;
                    const isActive = currentMode === mode.id;

                    return (
                        <div
                            key={`${mode.id}-${index}`}
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                            className="absolute top-0 left-0 w-10 h-10 pointer-events-auto z-20 group"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    onModeChange(mode.id);
                                    onVantageChange(null);
                                    setActiveTransmissionIdx(0);
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 active:scale-95 ${
                                    isActive 
                                    ? 'bg-violet-600 text-white border-2 border-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.9)] scale-110' 
                                    : 'bg-slate-900/90 text-slate-300 border border-violet-500/35 hover:border-violet-400 hover:text-white hover:bg-slate-800 shadow-md'
                                }`}
                                title={`${mode.label} Transmission Channel (${mode.freq})`}
                            >
                                <span className="relative z-10">{mode.icon}</span>
                                {isActive && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                                )}
                            </button>

                            {/* Hover Tooltip */}
                            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                                <div className="px-2.5 py-1 bg-slate-900/95 backdrop-blur-md border border-violet-500/50 rounded-lg text-center shadow-2xl min-w-[110px] whitespace-nowrap">
                                    <div className="text-[9px] font-mono font-black text-violet-300 uppercase tracking-wider flex items-center justify-center gap-1">
                                        <span>{mode.label}</span>
                                        <span className="text-[7px] text-emerald-400 font-semibold">{mode.freq}</span>
                                    </div>
                                    <div className="text-[8px] font-sans text-slate-400">{mode.desc}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Inner Orbit Nodes: Vantage Lenses */}
                {vantages.map((vantage, index) => {
                    const angle = (index / vantages.length) * Math.PI * 2 - Math.PI / 2;
                    const x = center + Math.cos(angle) * innerRadius - 16; // 32px width -> -16 offset
                    const y = center + Math.sin(angle) * innerRadius - 16;
                    const isActive = activeVantage?.id === vantage.id;
                    const iconSymbol = VANTAGE_ICONS[vantage.id] || vantage.icon || '⚡';

                    return (
                        <div
                            key={vantage.id}
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                            className="absolute top-0 left-0 w-8 h-8 pointer-events-auto z-30 group"
                        >
                            <button
                                type="button"
                                onClick={() => onVantageChange(isActive ? null : vantage)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 active:scale-95 ${
                                    isActive 
                                    ? 'bg-fuchsia-600 text-white border-2 border-fuchsia-200 shadow-[0_0_18px_rgba(217,70,239,0.9)] scale-110' 
                                    : 'bg-slate-900/85 text-violet-300 border border-violet-500/35 hover:border-violet-300 hover:text-white hover:bg-slate-800'
                                }`}
                                title={`Vantage Lens: ${vantage.label}`}
                            >
                                <span className="relative z-10">{iconSymbol}</span>
                            </button>

                            {/* Vantage Tooltip */}
                            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                                <div className="px-2.5 py-1 bg-slate-950/95 backdrop-blur-md border border-fuchsia-500/50 rounded-lg text-center shadow-xl w-44">
                                    <div className="text-[9px] font-mono font-black text-fuchsia-300 uppercase tracking-wider">{vantage.label} Lens</div>
                                    <div className="text-[8px] font-sans text-slate-400 leading-tight mt-0.5">{vantage.description}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Center Control Center Console HUD */}
                <div className="relative z-30 text-center w-52 flex flex-col items-center pointer-events-auto px-2">
                    {!isAdding ? (
                        <>
                            {/* Live Transmission Status Header */}
                            <div className="flex items-center justify-between w-full px-1 mb-1 text-[8px] font-mono">
                                <div className="flex items-center gap-1.5 text-violet-300 font-bold tracking-widest uppercase">
                                    <span className={`w-2 h-2 rounded-full ${isScanning || isTransmissionsLoading || isPulsing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                                    <span>{isScanning || isTransmissionsLoading ? 'SYNCING...' : 'LIVE ORBIT'}</span>
                                </div>
                                <span className="text-[8px] font-mono text-emerald-400 font-semibold">{currentModeMeta.freq}</span>
                            </div>

                            {/* Active Channel & Vantage Lens */}
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <span className="text-base font-sans font-black text-white uppercase tracking-tight drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]">
                                    {currentModeMeta.label}
                                </span>
                                {activeVantage && (
                                    <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-bold uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                                        {activeVantage.label}
                                    </span>
                                )}
                            </div>

                            {/* Live Transmission Ticker Card */}
                            <div className="w-full bg-slate-900/90 border border-violet-500/30 rounded-xl p-2 mb-2 text-left shadow-lg relative group">
                                {currentTransmission ? (
                                    <>
                                        <div className="flex justify-between items-center text-[7px] font-mono text-slate-400 mb-0.5">
                                            <span className="text-violet-400 font-bold uppercase truncate max-w-[90px]">
                                                {currentTransmission.source}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span>{activeTransmissionIdx + 1}/{transmissions.length || 1}</span>
                                                <span className="text-slate-500">•</span>
                                                <span>{currentTransmission.timestamp}</span>
                                            </span>
                                        </div>

                                        <p className="text-[9px] font-sans font-bold text-white leading-tight line-clamp-2 group-hover:text-violet-200 transition-colors">
                                            {currentTransmission.title}
                                        </p>

                                        {/* Prev/Next Ticker Arrows */}
                                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={handlePrevTransmission}
                                                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[8px] font-mono font-bold transition-all active:scale-95"
                                                    title="Previous transmission"
                                                >
                                                    ◀
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleNextTransmission}
                                                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[8px] font-mono font-bold transition-all active:scale-95"
                                                    title="Next transmission"
                                                >
                                                    ▶
                                                </button>
                                            </div>

                                            {onAnalyzeTransmission && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAnalyzeTransmission(currentTransmission);
                                                    }}
                                                    className="px-1.5 py-0.5 rounded bg-violet-600/30 hover:bg-violet-600/60 border border-violet-500/40 text-[7px] font-mono font-bold uppercase text-violet-200 hover:text-white transition-all active:scale-95 flex items-center gap-1"
                                                    title="Analyze this transmission in Chat"
                                                >
                                                    <span>Analyze</span>
                                                    <span>⚡</span>
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-2 text-center text-[8px] font-mono text-slate-500 uppercase">
                                        Searching Grounded Mesh...
                                    </div>
                                )}
                            </div>

                            {/* Control Actions Row */}
                            <div className="flex items-center justify-center gap-1.5 w-full">
                                {/* Open Feed Window */}
                                <button
                                    type="button"
                                    onClick={onOpenFeed}
                                    className="flex-1 px-2 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/60 border border-violet-500/40 text-violet-200 text-[8px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
                                    title="Open Full Transmission Feed Stream"
                                >
                                    <svg className="w-2.5 h-2.5 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M4 11a9 9 0 0 1 9 9" />
                                        <path d="M4 4a16 16 0 0 1 16 16" />
                                        <circle cx="5" cy="19" r="1" />
                                    </svg>
                                    <span>Stream</span>
                                </button>

                                {/* Manual Sync Transmissions Pulse */}
                                <button
                                    type="button"
                                    onClick={handleManualSync}
                                    disabled={isPulsing || isTransmissionsLoading}
                                    className="flex-1 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-violet-500/30 text-slate-300 hover:text-white text-[8px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                                    title="Trigger instant Google Search Grounded sync"
                                >
                                    <svg className={`w-2.5 h-2.5 ${isPulsing || isTransmissionsLoading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                        <path d="M21 3v5h-5" />
                                    </svg>
                                    <span>Sync</span>
                                </button>

                                {/* Voice Output Mute Toggle */}
                                {onToggleMute && (
                                    <button
                                        type="button"
                                        onClick={onToggleMute}
                                        className={`px-2 py-1 rounded-lg border text-[8px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 ${
                                            isMuted 
                                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30' 
                                            : isSpeaking
                                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                                            : 'bg-slate-900/90 border-violet-500/30 text-slate-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                        title={isMuted ? "Voice is Muted (Click to Unmute)" : isSpeaking ? "Speaking (Click to Mute)" : "Voice is Active (Click to Mute)"}
                                    >
                                        <span>{isMuted ? '🔇' : '🔊'}</span>
                                        <span>{isMuted ? 'Mute' : 'Voice'}</span>
                                    </button>
                                )}

                                {/* Add Custom Channel Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(true)}
                                    className="p-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-violet-500/30 text-slate-400 hover:text-white transition-all active:scale-95"
                                    title="Add custom channel"
                                >
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Search Channels & Orbit Filter */}
                            <div className="w-full mt-1.5 relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="SEARCH ORBIT..."
                                    className="w-full bg-slate-900/90 border border-violet-500/20 text-[8px] font-mono text-center text-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-violet-400 placeholder:text-slate-600 uppercase"
                                />
                                {searchTerm && (
                                    <button 
                                        type="button" 
                                        onClick={() => setSearchTerm('')} 
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-[9px]"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Add Custom Channel Modal in Center */
                        <div className="w-full p-2.5 bg-slate-900/95 border border-violet-500/40 rounded-xl space-y-2 text-left shadow-2xl">
                            <div className="text-[9px] font-mono font-bold text-violet-300 uppercase tracking-wider text-center">
                                New Channel
                            </div>
                            <input 
                                type="text" 
                                value={newLabel} 
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="Channel Name..."
                                className="w-full bg-slate-950 border border-violet-500/30 p-1.5 text-[9px] text-white rounded focus:outline-none focus:border-violet-400 font-mono"
                                autoFocus
                            />
                            <div className="flex gap-1.5 justify-center">
                                {['🔬', '🧠', '💼', '🔭', '📡', '⚡'].map(icon => (
                                    <button 
                                        key={icon} 
                                        type="button" 
                                        onClick={() => setNewIcon(icon)} 
                                        className={`w-6 h-6 rounded text-xs transition-all ${newIcon === icon ? 'bg-violet-600 scale-110' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1.5 pt-1">
                                <button 
                                    type="button" 
                                    onClick={handleCreate} 
                                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-[8px] font-mono font-bold text-white py-1 rounded transition-colors"
                                >
                                    LINK
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAdding(false)} 
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-[8px] font-mono font-bold text-slate-300 py-1 rounded transition-colors"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubstrateCircle;
