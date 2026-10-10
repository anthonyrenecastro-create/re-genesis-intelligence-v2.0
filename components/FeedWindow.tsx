import React, { useState, useMemo } from 'react';
import type { NewsItem, SubstrateMode } from '../types';

interface FeedWindowProps {
    mode: SubstrateMode;
    items: NewsItem[];
    isLoading: boolean;
    onRefresh: () => void;
    onModeChange?: (mode: SubstrateMode) => void;
    onAnalyzeInChat?: (item: NewsItem) => void;
}

const CHANNELS: { id: SubstrateMode; label: string; icon: string }[] = [
    { id: 'discover', label: 'Global', icon: '🌐' },
    { id: 'finance', label: 'Finance', icon: '📈' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'patents', label: 'Patents', icon: '📜' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'shopping', label: 'Shopping', icon: '🛒' },
    { id: 'modes', label: 'Modes', icon: '🕸️' },
];

const FeedWindow: React.FC<FeedWindowProps> = ({ 
    mode, 
    items, 
    isLoading, 
    onRefresh,
    onModeChange,
    onAnalyzeInChat
}) => {
    const [filterQuery, setFilterQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredItems = useMemo(() => {
        if (!filterQuery.trim()) return items;
        const q = filterQuery.toLowerCase();
        return items.filter(it => 
            it.title.toLowerCase().includes(q) || 
            it.summary.toLowerCase().includes(q) ||
            it.source.toLowerCase().includes(q)
        );
    }, [items, filterQuery]);

    const handleCopy = (item: NewsItem) => {
        navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\nSource: ${item.source}`);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 1800);
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-950/95 text-slate-100 font-mono select-none">
            {/* Top Transmission Status Bar */}
            <div className="p-3 border-b border-violet-500/20 bg-slate-900/80 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">
                        {mode} TRANSMISSION FEED
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono hidden sm:inline">
                        · {items.length} SIGNALS
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-2 py-1 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded text-[9px] font-bold text-violet-200 transition-all disabled:opacity-40 active:scale-95"
                        title="Trigger real-time Google Search Grounded sync"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="11" 
                            height="11" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            className={isLoading ? 'animate-spin text-emerald-400' : ''}
                        >
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                        <span>{isLoading ? 'SYNCING' : 'SYNC'}</span>
                    </button>
                </div>
            </div>

            {/* Substrate Channel Fast Switcher */}
            {onModeChange && (
                <div className="px-3 py-2 bg-slate-950 border-b border-violet-500/10 flex items-center gap-1 overflow-x-auto custom-scrollbar">
                    {CHANNELS.map(ch => {
                        const isActive = mode === ch.id;
                        return (
                            <button
                                key={ch.id}
                                type="button"
                                onClick={() => onModeChange(ch.id)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-tight whitespace-nowrap transition-all ${
                                    isActive
                                    ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.6)] border border-violet-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <span>{ch.icon}</span>
                                <span>{ch.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Real-time Search & Filter Input */}
            <div className="px-3 py-2 bg-slate-900/40 border-b border-violet-500/10">
                <div className="relative">
                    <input 
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="FILTER TRANSMISSIONS..."
                        className="w-full bg-slate-950/80 border border-violet-500/20 rounded-md px-2.5 py-1 text-[9px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-400 transition-colors uppercase tracking-wider"
                    />
                    {filterQuery && (
                        <button
                            type="button"
                            onClick={() => setFilterQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Background Sync Pulse Indicator */}
            {isLoading && items.length > 0 && (
                <div className="h-0.5 w-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 animate-pulse w-full" />
                </div>
            )}
            
            {/* Transmissions List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {isLoading && items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
                        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-300">
                            CONNECTING TO GOOGLE SEARCH GROUNDING
                        </div>
                        <div className="text-[8px] text-slate-500 font-sans">
                            Retrieving live real-time substrate telemetry...
                        </div>
                    </div>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="group p-3 rounded-xl border border-violet-500/20 bg-slate-900/60 hover:bg-violet-950/20 hover:border-violet-500/50 transition-all duration-200 shadow-lg"
                        >
                            {/* Metadata Header: unboxed text with subtle separator */}
                            <div className="flex justify-between items-center mb-1.5 text-[8px] font-mono">
                                <span className="text-violet-400 font-bold uppercase tracking-wider">
                                    {item.source}
                                </span>
                                <span className="text-slate-500 font-medium">
                                    {item.timestamp}
                                </span>
                            </div>

                            {/* Headline */}
                            <h4 className="text-xs font-sans font-bold leading-snug text-white group-hover:text-violet-200 transition-colors mb-1.5">
                                {item.title}
                            </h4>

                            {/* Summary */}
                            <p className="text-[10px] font-sans text-slate-300 leading-relaxed mb-3 opacity-90">
                                {item.summary}
                            </p>

                            {/* Action Buttons Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    {/* Direct Link */}
                                    {item.url && item.url !== '#' ? (
                                        <a 
                                            href={item.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[8px] font-mono font-bold uppercase text-slate-400 hover:text-violet-300 transition-colors"
                                        >
                                            <span>Link</span>
                                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                        </a>
                                    ) : (
                                        <span className="text-[8px] font-mono text-slate-600 uppercase">Mesh Grounded</span>
                                    )}

                                    {/* Copy Action */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(item)}
                                        className="text-[8px] font-mono font-bold uppercase text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {copiedId === item.id ? '✓ COPIED' : 'COPY'}
                                    </button>
                                </div>

                                {/* Inquire AI / Analyze in Chat Action */}
                                {onAnalyzeInChat && (
                                    <button
                                        type="button"
                                        onClick={() => onAnalyzeInChat(item)}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-[8px] font-mono font-bold uppercase text-violet-300 hover:text-white transition-all active:scale-95"
                                        title="Send this transmission directly to Gemini for conversational analysis"
                                    >
                                        <svg className="w-2.5 h-2.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <span>Analyze</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-2">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                            NO MATCHING TRANSMISSIONS
                        </div>
                        <div className="text-[8px] text-slate-600 uppercase">
                            Adjust filter query or click SYNC to query Google Search Grounding.
                        </div>
                    </div>
                )}
            </div>

            {/* Substrate Feed Footer */}
            <div className="p-2 border-t border-violet-500/10 bg-slate-950/80 text-[7px] font-mono text-slate-500 flex justify-between items-center px-3">
                <span>GOOGLE SEARCH GROUNDED MESH</span>
                <span>STATUS: REAL-TIME ACTIVE</span>
            </div>
        </div>
    );
};

export default FeedWindow;
