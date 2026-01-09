import React, { useState } from 'react';
import { Cat, Sparkles, Activity, FileSearch, Shield, BrainCircuit } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import CatProfileCard from './components/CatProfileCard';
import ChatInterface from './components/ChatInterface';
import LiveScout from './components/LiveScout';
import ForensicLab from './components/ForensicLab';
import TrainingCommand from './components/TrainingCommand';
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
          // Fetch a reliable sample cat image (placeholder)
          const response = await fetch('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80');
          const blob = await response.blob();
          
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64data = reader.result as string;
              // Pass to handler (strip prefix handled inside handler if sent raw, 
              // but handleImageSelected expects raw base64 without prefix)
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* Ops Center Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-1.5 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight hidden md:block">Feline<span className="text-orange-500">Ops</span></h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-full overflow-x-auto max-w-[280px] md:max-w-none">
             <button 
                onClick={() => setActiveModule('profile')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeModule === 'profile' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
             >
                Database
             </button>
             <button 
                onClick={() => setActiveModule('training')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeModule === 'training' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
             >
                Training
             </button>
             <button 
                onClick={() => setActiveModule('live')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeModule === 'live' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
             >
                Live Scout
             </button>
             <button 
                onClick={() => setActiveModule('forensics')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeModule === 'forensics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
             >
                Forensics
             </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Module: Identity Database (Profile) */}
        {activeModule === 'profile' && (
            <div className="animate-fade-in">
                {!profile ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="text-center mb-10 max-w-2xl">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Identity Database</h2>
                        <p className="text-lg text-slate-600">
                        Upload subject imagery for RPG-class categorization and personality assessment.
                        </p>
                    </div>

                    <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <ImageUploader 
                            onImageSelected={handleImageSelected} 
                            isAnalyzing={isAnalyzing} 
                            onUseSample={handleSampleImage}
                        />
                        {error && (
                            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl text-center font-bold">
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
                            className="text-slate-500 hover:text-orange-600 font-bold flex items-center gap-2"
                        >
                            ← Scan New Subject
                        </button>
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
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
                        <BrainCircuit className="text-purple-600"/> Training Command
                    </h2>
                    <p className="text-slate-500">Gemini 3 Pro Thinking Engine for behavioral modification.</p>
                </div>
                
                {profile ? (
                    <TrainingCommand profile={profile} />
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center max-w-md mx-auto">
                        <Shield className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Subject Required</h3>
                        <p className="text-slate-600 mb-6">You must analyze a cat in the Database before generating a training protocol.</p>
                        <button 
                            onClick={() => setActiveModule('profile')}
                            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
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
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
                        <Activity className="text-green-600"/> Tactical Live Feed
                    </h2>
                    <p className="text-slate-500">Real-time Gemini 2.5 multimodal surveillance.</p>
                </div>
                <LiveScout />
            </div>
        )}

        {/* Module: Forensics */}
        {activeModule === 'forensics' && (
            <div className="animate-fade-in">
                 <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
                        <FileSearch className="text-blue-600"/> Incident Analysis
                    </h2>
                    <p className="text-slate-500">Gemini 3 Pro Video Reasoning pipeline.</p>
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
    </div>
  );
};

export default App;