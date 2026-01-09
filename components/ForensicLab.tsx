import React, { useState, useRef } from 'react';
import { Upload, FileVideo, AlertTriangle, CheckCircle, BrainCircuit, FlaskConical } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto">
       <div className="bg-slate-900 text-slate-200 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
             <div className="bg-orange-500 p-2 rounded-lg text-white">
                <BrainCircuit className="w-6 h-6" />
             </div>
             <div>
                 <h2 className="text-2xl font-black text-white">Forensic Lab</h2>
                 <p className="text-slate-400 text-sm">Spatial-Temporal Incident Analysis</p>
             </div>
          </div>

          {!report ? (
             <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-600 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer relative">
                    <input 
                        type="file" 
                        accept="video/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                    <FileVideo className="w-16 h-16 text-slate-500 mb-4" />
                    <p className="text-xl font-bold">{videoFile ? videoFile.name : "Drop Incident Footage"}</p>
                    <p className="text-sm text-slate-500">Supports MP4, WebM (Max 10s recommended)</p>
                </div>

                {videoFile && (
                    <button 
                        onClick={processVideo}
                        disabled={isProcessing}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? "Processing Evidence..." : "Analyze Causality"}
                    </button>
                )}
                
                <div className="flex items-center justify-center">
                    <button 
                        onClick={loadExampleCase}
                        className="text-slate-500 hover:text-white text-sm flex items-center gap-2 transition-colors border-b border-dashed border-slate-600 pb-1"
                    >
                        <FlaskConical className="w-4 h-4" />
                        Load Case File #99 (Example)
                    </button>
                </div>

                {/* Hidden video element for processing */}
                <video ref={videoRef} className="hidden" muted playsInline />
             </div>
          ) : (
             <div className="animate-fade-in space-y-6">
                {/* Timeline Strip */}
                <div className="flex gap-2 overflow-x-auto pb-4 border-b border-slate-700">
                    {extractedFrames.map((frame, i) => (
                        <div key={i} className="min-w-[120px] h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-600 relative flex items-center justify-center">
                             {/* If it's a real image, show it. If placeholder, show icon */}
                             {frame.length > 100 ? (
                                <img src={`data:image/jpeg;base64,${frame}`} className="w-full h-full object-cover opacity-70" alt={`Frame ${i}`} />
                             ) : (
                                <div className="text-slate-600 text-xs text-center p-2">EVIDENCE<br/>FRAME {i}</div>
                             )}
                             <span className="absolute bottom-1 right-1 text-[10px] bg-black/50 px-1 rounded">t-{i}</span>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-orange-400 font-bold mb-4 uppercase text-xs tracking-wider">Subject Analysis</h3>
                        <div className="text-2xl font-black text-white mb-2">{report.subject}</div>
                        <div className="flex gap-2 mb-4">
                             <span className="bg-slate-700 px-2 py-1 rounded text-xs text-white">{report.incidentType}</span>
                             <span className={`px-2 py-1 rounded text-xs text-black font-bold ${
                                 report.intent === 'Premeditated' ? 'bg-red-400' : 'bg-yellow-400'
                             }`}>{report.intent}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{report.causeAnalysis}</p>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
                         <div>
                            <h3 className="text-blue-400 font-bold mb-4 uppercase text-xs tracking-wider">Physics & Verdict</h3>
                            <p className="text-slate-300 text-sm mb-4 font-mono border-l-2 border-blue-500 pl-3">
                                {report.physicsNotes}
                            </p>
                         </div>
                         <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                             <div className="text-xs text-slate-500 uppercase mb-1">Final Verdict</div>
                             <div className="text-xl font-bold text-white flex items-center gap-2">
                                 {report.intent === 'Premeditated' ? <AlertTriangle className="text-red-500"/> : <CheckCircle className="text-green-500"/>}
                                 {report.verdict}
                             </div>
                         </div>
                    </div>
                </div>

                <button 
                    onClick={() => { setReport(null); setVideoFile(null); }}
                    className="text-slate-500 hover:text-white text-sm font-bold flex items-center gap-2"
                >
                    ← Process New Evidence
                </button>
             </div>
          )}
       </div>
    </div>
  );
};

export default ForensicLab;