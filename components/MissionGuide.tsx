import React from 'react';
import { X, Shield, BrainCircuit, Activity, FileSearch, Video, Camera } from 'lucide-react';

interface MissionGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const MissionGuide: React.FC<MissionGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-700 flex flex-col max-h-[85vh] overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-1.5 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Field Manual</h2>
                <p className="text-xs text-orange-500 font-mono">CLASSIFIED // EYES ONLY</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {/* Section 1: Database */}
            <section className="flex gap-4">
                <div className="shrink-0 bg-slate-800 p-3 rounded-xl h-fit">
                    <Shield className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">1. Identity Database</h3>
                    <p className="text-sm mb-3">
                        **Goal:** Establish a baseline profile for the subject.
                    </p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm">
                        <strong className="text-white block mb-1">How to Demo:</strong>
                        <ul className="list-disc list-inside space-y-1 ml-1 text-slate-400">
                            <li>Upload a clear photo of a cat.</li>
                            <li>OR use the <strong>"Load Test Subject"</strong> button to skip uploading.</li>
                            <li><strong>Tech:</strong> Uses <span className="text-orange-400">Gemini 3 Flash</span> to analyze visual features and assign RPG stats.</li>
                            <li><strong>New:</strong> Click "Verify Breed Intel" to use <span className="text-blue-400">Search Grounding</span>.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 2: Training */}
            <section className="flex gap-4">
                <div className="shrink-0 bg-slate-800 p-3 rounded-xl h-fit">
                    <BrainCircuit className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">2. Training Command (Thinking + Veo)</h3>
                    <p className="text-sm mb-3">
                        **Goal:** Create complex behavioral modification plans and visualize success.
                    </p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm">
                        <strong className="text-white block mb-1">How to Demo:</strong>
                        <ul className="list-disc list-inside space-y-1 ml-1 text-slate-400">
                            <li>Enter a goal like "Stop scratching the sofa" or "Learn to High Five".</li>
                            <li><strong>Tech:</strong> Uses <span className="text-purple-400">Gemini 3 Pro Thinking Model</span>. Note the delay—it is actually "thinking" to plan phases.</li>
                            <li><strong>Win Feature:</strong> After the plan loads, click <strong>"Visualize Outcome"</strong> to generate a video using <span className="text-purple-400">Veo 3.1</span>.</li>
                            <li><strong>Note:</strong> You will be prompted to select an API Key with billing enabled for video generation.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 3: Live Scout */}
            <section className="flex gap-4">
                <div className="shrink-0 bg-slate-800 p-3 rounded-xl h-fit">
                    <Activity className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">3. Live Scout (Real-time)</h3>
                    <p className="text-sm mb-3">
                        **Goal:** Real-time surveillance with multimodal AI agent.
                    </p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm">
                        <strong className="text-white block mb-1">How to Demo:</strong>
                        <ul className="list-disc list-inside space-y-1 ml-1 text-slate-400">
                            <li>Click "Initiate" and allow Camera/Mic access.</li>
                            <li>Show the camera a cat (or an object like a pen/mug) and ask "What is this?".</li>
                            <li><strong>Tool Use:</strong> Say <em>"Take a photo of this"</em>. The AI will trigger the <span className="text-green-400">captureSnapshot</span> tool and save the frame to the log.</li>
                            <li><strong>Tech:</strong> <span className="text-green-400">Gemini 2.5 Live API</span> with WebSockets and PCM audio streaming.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 4: Forensics */}
            <section className="flex gap-4">
                <div className="shrink-0 bg-slate-800 p-3 rounded-xl h-fit">
                    <FileSearch className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">4. Forensic Lab</h3>
                    <p className="text-sm mb-3">
                        **Goal:** Analyze video footage of "crimes" (falling vases, zoomies).
                    </p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm">
                        <strong className="text-white block mb-1">How to Demo:</strong>
                        <ul className="list-disc list-inside space-y-1 ml-1 text-slate-400">
                            <li>Click <strong>"Load Case File #99"</strong> to load a pre-processed example if you don't have a video.</li>
                            <li><strong>Tech:</strong> Extracts frames from video and sends them to <span className="text-blue-400">Gemini 3 Pro</span> for temporal reasoning and intent analysis.</li>
                        </ul>
                    </div>
                </div>
            </section>

        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-950 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
                Acknowledge & Close
            </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; 
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default MissionGuide;