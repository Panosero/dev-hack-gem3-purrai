import React, { useState, useRef } from 'react';
import { Upload, FileVideo, AlertTriangle, CheckCircle, BrainCircuit, FlaskConical, Search, Clock, Fingerprint } from 'lucide-react';
import { analyzeForensicVideo } from '../services/geminiService';
import { ForensicReport } from '../types';

const ForensicLab: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setVideoFile(e.target.files[0]);
        setReport(null);
        setExtractedFrames([]);
    }
  };

  const loadExampleCase = () => {
      // Pre-baked report for "Mittens"
      setExtractedFrames([
          // 1x1 Grey pixel placeholders as base64
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      ]);
      setReport({
          subject: "Agent 'Mittens' (Tuxedo Cat, approx 4kg)",
          incidentType: "Unsolicited Gravity Check",
          timestampOfIncident: "t-00:03",
          intent: "Premeditated",
          causeAnalysis: "Subject displayed prolonged eye contact with camera before slowly extending paw towards the ceramic vase. Action was not clumsy; paw extension was deliberate and calculated. Post-incident behavior (running away) indicates consciousness of guilt.",
          physicsNotes: "Vase velocity confirms standard gravitational acceleration (9.8m/s²). Friction coefficient of shelf was insufficient to counteract the 'Push' force applied by paw.",
          verdict: "GUILTY of First-Degree Property Damage."
      });
      setVideoFile(null);
  };

  const processVideo = async () => {
    if (!videoFile || !videoRef.current) return;
    setIsProcessing(true);
    
    // 1. Extract Frames
    const frames: string[] = [];
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load video data
    video.src = URL.createObjectURL(videoFile);
    await new Promise((resolve) => { video.onloadedmetadata = resolve; });

    const duration = video.duration;
    // Take up to 5 snapshots distributed across the video
    const snapshotCount = 5; 
    const interval = duration / (snapshotCount + 1);

    try {
        for (let i = 1; i <= snapshotCount; i++) {
            video.currentTime = interval * i;
            await new Promise(r => video.onseeked = r);
            
            if (ctx) {
                canvas.width = video.videoWidth * 0.5; // Scale down for API limits
                canvas.height = video.videoHeight * 0.5;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                frames.push(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
            }
        }
        
        setExtractedFrames(frames);

        // 2. Send to Gemini
        const result = await analyzeForensicVideo(frames);
        setReport(result);

    } catch (err) {
        console.error(err);
        alert("Forensics failed. The evidence was corrupted.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
       <div className="glass-panel text-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {!report ? (
             <div className="space-y-6 relative z-10 max-w-2xl mx-auto py-10">
                <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-3xl p-10 flex flex-col items-center justify-center hover:bg-slate-800 transition-all cursor-pointer relative group">
                    <input 
                        type="file" 
                        accept="video/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                    />
                    <div className="bg-blue-900/30 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <FileVideo className="w-12 h-12 text-blue-400" />
                    </div>
                    <p className="text-2xl font-black text-white mb-2">{videoFile ? videoFile.name : "Drop Incident Footage"}</p>
                    <p className="text-sm text-slate-500 font-mono">MP4 / WebM Protocol Accepted</p>
                </div>

                {videoFile && (
                    <button 
                        onClick={processVideo}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        {isProcessing ? (
                            <>
                                <Fingerprint className="w-5 h-5 animate-pulse" />
                                Processing Evidence...
                            </>
                        ) : "Analyze Causality"}
                    </button>
                )}
                
                <div className="flex items-center justify-center pt-4">
                    <button 
                        onClick={loadExampleCase}
                        className="text-slate-500 hover:text-blue-400 text-sm flex items-center gap-2 transition-colors border-b border-dashed border-slate-700 hover:border-blue-400 pb-1"
                    >
                        <FlaskConical className="w-4 h-4" />
                        Load Case File #99 (Example)
                    </button>
                </div>

                {/* Hidden video element for processing */}
                <video ref={videoRef} className="hidden" muted playsInline />
             </div>
          ) : (
             <div className="animate-fade-in space-y-8 relative z-10">
                {/* Timeline Strip */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Evidence Timeline
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                        {extractedFrames.map((frame, i) => (
                            <div key={i} className="min-w-[140px] h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative group">
                                {frame.length > 100 ? (
                                    <img src={`data:image/jpeg;base64,${frame}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt={`Frame ${i}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600 text-xs">NO SIGNAL</div>
                                )}
                                <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 px-1.5 py-0.5 rounded font-mono text-white">t-0{i}:00</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Main Analysis */}
                    <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                            <div>
                                <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider">Subject Analysis</h3>
                                <div className="text-xl font-black text-white">{report.subject}</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mb-6">
                             <span className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-md text-xs text-slate-300 font-mono">{report.incidentType}</span>
                             <span className={`px-3 py-1 rounded-md text-xs text-black font-bold font-mono border ${
                                 report.intent === 'Premeditated' ? 'bg-red-400 border-red-500' : 'bg-yellow-400 border-yellow-500'
                             }`}>{report.intent}</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">Cause & Effect Profile</h4>
                                <p className="text-slate-300 text-sm leading-relaxed font-light">
                                    {report.causeAnalysis}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Physics & Verdict */}
                    <div className="flex flex-col gap-6">
                         <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm flex-1">
                            <h3 className="text-purple-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4" /> Physics Engine Reconstruct
                            </h3>
                            <p className="text-slate-300 text-sm font-mono border-l-2 border-purple-500/50 pl-4 py-1">
                                {report.physicsNotes}
                            </p>
                         </div>
                         
                         <div className={`p-6 rounded-2xl border backdrop-blur-sm flex items-center gap-4 ${
                             report.intent === 'Premeditated' 
                             ? 'bg-red-950/30 border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                             : 'bg-green-950/30 border-green-500/30 shadow-[0_0_20px_rgba(22,163,74,0.1)]'
                         }`}>
                             <div className={`p-3 rounded-full ${report.intent === 'Premeditated' ? 'bg-red-500' : 'bg-green-500'}`}>
                                 {report.intent === 'Premeditated' ? <AlertTriangle className="text-white w-6 h-6"/> : <CheckCircle className="text-white w-6 h-6"/>}
                             </div>
                             <div>
                                 <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Final Verdict</div>
                                 <div className="text-2xl font-black text-white leading-none">
                                     {report.verdict}
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <button 
                        onClick={() => { setReport(null); setVideoFile(null); }}
                        className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        ← Process New Evidence
                    </button>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default ForensicLab;