import React, { useEffect, useRef, useState } from 'react';
import { useLiveGemini } from '../hooks/useLiveGemini';
import { Activity, Radio, Video, Mic, Power, FlaskConical } from 'lucide-react';

const LiveScout: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, connect, disconnect, volume } = useLiveGemini();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState<string>("SYSTEM IDLE");

  // Simulation Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSimulating) {
        const logs = [
            "SCANNING PERIMETER...",
            "TARGET ACQUIRED: FELIS CATUS",
            "ANALYZING GAIT: RELAXED",
            "THREAT LEVEL: LOW (NAPPING)",
            "DETECTED OBJECT: FEATHER WAND",
            "CALCULATING POUNCE TRAJECTORY..."
        ];
        let i = 0;
        interval = setInterval(() => {
            setSimLog(logs[i % logs.length]);
            i++;
        }, 2000);
    } else {
        setSimLog("SYSTEM IDLE");
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSimulation = () => {
      if (status === 'connected') disconnect();
      setIsSimulating(!isSimulating);
  };

  // Auto-scroll log not implemented, focused on AV experience
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 relative">
        {/* HUD Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">
           {/* Top Bar */}
           <div className="flex justify-between items-start">
              <div className="bg-slate-900/80 backdrop-blur text-green-500 px-4 py-2 rounded-lg border border-green-500/30 font-mono text-sm flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full ${status === 'connected' || isSimulating ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 STATUS: {isSimulating ? 'SIMULATION' : status.toUpperCase()}
              </div>
              
              <div className="flex gap-2">
                 <div className="bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700">
                    <Video className="w-5 h-5 text-slate-400" />
                 </div>
                 <div className="bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700">
                    <Mic className={`w-5 h-5 ${volume > 0.05 || isSimulating ? 'text-green-400' : 'text-slate-400'}`} />
                 </div>
              </div>
           </div>

           {/* Reticle Center */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
               <div className="w-64 h-64 border border-white/50 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                   <div className="w-2 h-2 bg-red-500 rounded-full"></div>
               </div>
               <div className="absolute top-1/2 left-0 w-full h-px bg-white/30"></div>
               <div className="absolute top-0 left-1/2 w-px h-full bg-white/30"></div>
           </div>

           {/* Bottom Bar */}
           <div className="flex justify-between items-end">
               <div className="text-white font-mono text-xs opacity-70">
                   <div>SYS.OP: GEMINI-2.5-FLASH</div>
                   <div>MODALITY: AUDIO/VIDEO</div>
                   <div>LOG: <span className="text-green-400">{simLog}</span></div>
               </div>
               
               {/* Controls */}
               <div className="pointer-events-auto flex gap-2">
                   {!isSimulating && (
                       <>
                        {status === 'disconnected' || status === 'error' ? (
                            <button 
                                onClick={() => connect(videoRef.current)}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-green-900/50"
                            >
                                <Power className="w-5 h-5" />
                                INITIATE
                            </button>
                        ) : (
                            <button 
                                onClick={disconnect}
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-red-900/50"
                            >
                                <Power className="w-5 h-5" />
                                ABORT
                            </button>
                        )}
                       </>
                   )}
                   
                   {(status === 'disconnected' || isSimulating) && (
                       <button 
                            onClick={toggleSimulation}
                            className={`px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all border ${
                                isSimulating 
                                ? 'bg-slate-700 text-white border-slate-500' 
                                : 'bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800'
                            }`}
                       >
                            <FlaskConical className="w-5 h-5" />
                            {isSimulating ? 'STOP SIM' : 'DEMO MODE'}
                       </button>
                   )}
               </div>
           </div>
        </div>

        {/* Video Feed */}
        <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
            {status === 'disconnected' && !isSimulating && (
                <div className="text-slate-500 font-mono flex flex-col items-center">
                    <Radio className="w-16 h-16 mb-4 opacity-50" />
                    <p>AWAITING SIGNAL...</p>
                </div>
            )}
            
            {/* Real Video */}
            <video 
                ref={videoRef}
                className={`w-full h-full object-cover ${status === 'connected' ? 'block' : 'hidden'}`}
                autoPlay 
                playsInline 
                muted 
            />

            {/* Simulation Video / Visual */}
            {isSimulating && (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black/80"></div>
                    <div className="text-green-500/20 text-9xl font-black select-none">SIMULATION</div>
                    {/* Simulated visual noise */}
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/200\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>
                </div>
            )}

            {(status === 'connected' || isSimulating) && (
                <div className="absolute inset-0 bg-green-500/10 pointer-events-none scanline"></div>
            )}
        </div>
      </div>
      
      <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-800">Mission Briefing</h3>
         </div>
         <p className="text-slate-600 text-sm">
            Activate the link to enable the AI Tactical Scout. The AI will observe your cat's environment via camera and provide real-time audio commentary on their movements. Use <strong>Demo Mode</strong> to preview the HUD interface.
         </p>
      </div>

      <style>{`
        .scanline {
            background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 0, 0.05) 51%);
            background-size: 100% 4px;
        }
      `}</style>
    </div>
  );
};

export default LiveScout;