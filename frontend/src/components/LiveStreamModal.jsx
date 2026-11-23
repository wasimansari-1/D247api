import React, { useState, useEffect } from 'react';
import { Tv, X, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';

export default function LiveStreamModal({ match, onClose }) {
  if (!match) return null;

  const [sources, setSources] = useState([
    {
      name: 'Diamond Live TV',
      url: match.streamUrl || `/api/sports/${match.gmid}/stream`
    },
    {
      name: 'External 247 Hub',
      url: `https://playg3.external247services.com/live/${match.gmid}`
    }
  ]);
  const [activeSource, setActiveSource] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dynamically fetch authentic Diamond upstream stream URL
  useEffect(() => {
    let isMounted = true;
    const isCasino = match.gmid === 'superover2' || match.gmid === 'goal2' || match.isVirtual;
    const apiUrl = isCasino
      ? `/api/casino/${match.gmid}/livetv`
      : `/api/sports/${match.gmid}/stream?etid=${match.etid || 4}`;

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.sources && data.sources.length > 0) {
          setSources(data.sources);
          setActiveSource(0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [match]);

  const currentStreamUrl = sources[activeSource]?.url || match.streamUrl;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1726] border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-[#112435] px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <Tv size={16} className="text-sky-400 shrink-0" />
            <h3 className="font-extrabold text-xs sm:text-sm truncate text-white">
              {match.eventName || 'Live Sports Broadcast'}
            </h3>
            {match.competition && (
              <span className="hidden md:inline-block text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800 font-semibold truncate">
                {match.competition}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Stream source selector */}
            <div className="bg-slate-900 rounded p-0.5 flex gap-1 border border-slate-700 text-[10px] font-bold">
              {sources.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveSource(idx); setIframeKey(k => k + 1); }}
                  className={`px-2 py-0.5 rounded transition ${
                    activeSource === idx 
                      ? 'bg-sky-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {src.name}
                </button>
              ))}
            </div>

            {/* Reload stream button */}
            <button
              onClick={() => setIframeKey(k => k + 1)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Reload Stream"
            >
              <RefreshCw size={14} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative bg-black w-full aspect-video flex items-center justify-center overflow-hidden">
          <iframe
            key={iframeKey}
            src={currentStreamUrl}
            title={match.eventName || 'Live Sports Stream'}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Footer Ribbon */}
        <div className="bg-[#091520] px-4 py-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="font-semibold text-slate-300">
              Diamond Live Stream Relay &bull; Match ID: {match.gmid}
            </span>
          </div>

          <a
            href={currentStreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-bold hover:underline"
          >
            <span>Pop-out Player</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
}
