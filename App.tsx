import React, { useState } from 'react';
import { Cat, Sparkles, Activity, FileSearch, Shield, BrainCircuit, BookOpen } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import CatProfileCard from './components/CatProfileCard';
import ChatInterface from './components/ChatInterface';
import LiveScout from './components/LiveScout';
import ForensicLab from './components/ForensicLab';
import TrainingCommand from './components/TrainingCommand';
import MissionGuide from './components/MissionGuide';
import { analyzeCatImage, generateSpiritImage } from './services/geminiService';
import { CatProfile } from './types';

type Module = 'profile' | 'live' | 'forensics' | 'training';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('profile');
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [spiritImage, setSpiritImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSpirit, setIsGeneratingSpirit] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setError(null);
    setProfile(null);
    setSpiritImage(null);
    setOriginalImage(`data:${mimeType};base64,${base64}`);

    try {
      const result = await analyzeCatImage(base64, mimeType);
      setProfile(result);
    } catch (err) {
      setError("Analysis failed. Try a clearer photo.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleImage = async () => {
      setIsAnalyzing(true);
      setError(null);
      try {
          // Fetch a reliable sample cat image
          const response = await fetch('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80');
          const blob = await response.blob();
          
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64data = reader.result as string;
              const rawBase64 = base64data.split(',')[1];
              handleImageSelected(rawBase64, blob.type);
          };
          reader.readAsDataURL(blob);

      } catch (e) {
          setError("Could not load sample. Please upload a file.");
          setIsAnalyzing(false);
      }
  };

  const handleGenerateSpirit = async () => {
    if (!profile || !originalImage) return;
    setIsGeneratingSpirit(true);
    try {
      const spiritUrl = await generateSpiritImage(profile, originalImage);
      setSpiritImage(spiritUrl);
    } catch (err) {
      console.error(err);
      alert("Spirit generation failed.");
    } finally {
      setIsGeneratingSpirit(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 pb-20">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Ops Center Header */}
      <header className="fixed top-0 w-full z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur rounded-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-slate-900 p-2 rounded-lg relative border border-orange-500/30">
                    <Shield className="w-6 h-6 text-orange-500" />
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Feline<span className="text-orange-500">Ops</span></h1>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden md:block">Tactical Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1.5 rounded-full border border-white/10">
                {[
                    { id: 'profile', label: 'Database', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                    { id: 'training', label: 'Training', icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                    { id: 'live', label: 'Live Scout', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                    { id: 'forensics', label: 'Forensics', icon: FileSearch, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveModule(item.id as Module)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 border
                            ${activeModule === item.id 
                                ? `${item.bg} text-white border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
                                : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        <item.icon className={`w-4 h-4 ${activeModule === item.id ? 'text-white' : item.color}`} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <button 
                onClick={() => setIsGuideOpen(true)}
                className="glass-button p-2.5 rounded-full text-slate-300 hover:text-white group relative"
                title="Open Field Manual"
            >
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse border border-slate-950"></div>
                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Mobile Nav Strip */}
        <div className="md:hidden flex overflow-x-auto border-t border-white/5 bg-slate-900/90 backdrop-blur-md">
             {[
                { id: 'profile', label: 'DB', icon: Shield },
                { id: 'training', label: 'Train', icon: BrainCircuit },
                { id: 'live', label: 'Live', icon: Activity },
                { id: 'forensics', label: 'Lab', icon: FileSearch }
            ].map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setActiveModule(item.id as Module)}
                    className={`flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider
                        ${activeModule === item.id ? 'text-orange-400 bg-white/5 border-b-2 border-orange-400' : 'text-slate-500'}`}
                >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                </button>
            ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 mt-20 relative z-10">
        
        {/* Module: Identity Database (Profile) */}
        {activeModule === 'profile' && (
            <div className="animate-fade-in">
                {!profile ? (
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <div className="text-center mb-10 max-w-2xl relative">
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                        <h2 className="text-5xl font-black text-white mb-6 tracking-tight relative z-10">Identity Database</h2>
                        <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Upload tactical imagery for instant RPG-class categorization and psychological profiling using Gemini Vision 3.0.
                        </p>
                    </div>

                    <div className="w-full max-w-xl">
                        <ImageUploader 
                            onImageSelected={handleImageSelected} 
                            isAnalyzing={isAnalyzing} 
                            onUseSample={handleSampleImage}
                        />
                        {error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                                <Activity className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>
                ) : (
                <div>
                    <div className="mb-6 flex justify-between items-center">
                        <button 
                            onClick={() => setProfile(null)}
                            className="glass-button px-4 py-2 rounded-lg text-slate-300 hover:text-orange-400 font-bold flex items-center gap-2 text-sm"
                        >
                            ← Scan New Subject
                        </button>
                        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-mono font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            RECORD ACTIVE
                        </div>
                    </div>
                    <CatProfileCard 
                        profile={profile} 
                        originalImage={originalImage}
                        onChatClick={() => setIsChatOpen(true)}
                        onGenerateSpirit={handleGenerateSpirit}
                        spiritImage={spiritImage}
                        isGeneratingSpirit={isGeneratingSpirit}
                    />
                </div>
                )}
            </div>
        )}

        {/* Module: Training Command (Thinking) */}
        {activeModule === 'training' && (
            <div className="animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3 mb-2">
                        <BrainCircuit className="text-purple-500 w-10 h-10"/> Training Command
                    </h2>
                    <p className="text-slate-400 font-mono text-sm tracking-wider uppercase">Gemini 3 Pro Thinking Engine // Protocol Generator</p>
                </div>
                
                {profile ? (
                    <TrainingCommand profile={profile} />
                ) : (
                    <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto border-orange-500/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
                        <Shield className="w-16 h-16 text-orange-500 mx-auto mb-6 opacity-80" />
                        <h3 className="text-xl font-bold text-white mb-2">Subject Required</h3>
                        <p className="text-slate-400 mb-8">Identify a subject in the Database before initializing training protocols.</p>
                        <button 
                            onClick={() => setActiveModule('profile')}
                            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
                        >
                            Go to Database
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Module: Live Scout */}
        {activeModule === 'live' && (
            <div className="animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3 mb-2">
                        <Activity className="text-green-500 w-10 h-10"/> Tactical Live Feed
                    </h2>
                    <p className="text-slate-400 font-mono text-sm tracking-wider uppercase">Real-time Multimodal Surveillance</p>
                </div>
                <LiveScout />
            </div>
        )}

        {/* Module: Forensics */}
        {activeModule === 'forensics' && (
            <div className="animate-fade-in">
                 <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3 mb-2">
                        <FileSearch className="text-blue-500 w-10 h-10"/> Incident Analysis
                    </h2>
                    <p className="text-slate-400 font-mono text-sm tracking-wider uppercase">Temporal Video Reasoning Pipeline</p>
                </div>
                <ForensicLab />
            </div>
        )}

      </main>

      {profile && isChatOpen && (
        <ChatInterface 
            profile={profile}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
        />
      )}

      <MissionGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default App;