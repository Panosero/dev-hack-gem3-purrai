import React, { useRef, useState } from 'react';
import { CatProfile, SearchResult } from '../types';
import { Shield, Zap, Heart, Utensils, Sparkles, MessageCircle, Wand2, Globe, ExternalLink, Hash, Dna, BrainCircuit } from 'lucide-react';
import { performIntelSearch } from '../services/geminiService';

interface CatProfileCardProps {
  profile: CatProfile;
  originalImage: string | null;
  onChatClick: () => void;
  onGenerateSpirit: () => void;
  spiritImage: string | null;
  isGeneratingSpirit: boolean;
}

const StatBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string; trackColor: string }> = ({ label, value, icon, color, trackColor }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <span className="text-xs font-mono font-bold text-slate-400">{value.toString().padStart(2, '0')}/10</span>
    </div>
    <div className={`w-full ${trackColor} rounded-full h-2 relative overflow-hidden`}>
      <div 
        className={`h-full rounded-full relative ${color} shadow-[0_0_10px_currentColor]`}
        style={{ width: `${value * 10}%` }}
      >
          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  </div>
);

const CatProfileCard: React.FC<CatProfileCardProps> = ({ 
  profile, 
  originalImage, 
  onChatClick, 
  onGenerateSpirit, 
  spiritImage,
  isGeneratingSpirit
}) => {
  const [intel, setIntel] = useState<SearchResult[]>([]);
  const [loadingIntel, setLoadingIntel] = useState(false);

  const handleIntelSearch = async () => {
      if (!profile.visualCharacteristics) return;
      setLoadingIntel(true);
      const results = await performIntelSearch(profile.visualCharacteristics);
      setIntel(results);
      setLoadingIntel(false);
  };

  return (
    <div className="glass-panel w-full max-w-5xl mx-auto rounded-3xl overflow-hidden animate-fade-in-up">
      <div className="md:flex">
        {/* Left Side: Image Hologram */}
        <div className="md:w-5/12 relative min-h-[500px] border-r border-white/5 bg-black/20">
           {/* Scanline Effect */}
           <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
           
           {spiritImage ? (
             <div className="relative w-full h-full group cursor-pointer" onClick={() => { /* Toggle view maybe? */ }}>
                <img src={spiritImage} alt="Spirit Form" className="w-full h-full object-cover animate-fade-in opacity-90 hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass-panel bg-purple-900/40 border-purple-500/30 p-3 rounded-xl flex items-center gap-3 backdrop-blur-md">
                        <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                        <div>
                            <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">Visual Mode</div>
                            <div className="text-sm font-bold text-white">Spirit Form Active</div>
                        </div>
                    </div>
                </div>
             </div>
           ) : (
             <div className="w-full h-full relative">
                 <img 
                   src={originalImage || ''} 
                   alt={profile.name} 
                   className="w-full h-full object-cover opacity-80" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                 
                 {/* Generate Button Overlay */}
                 <div className="absolute bottom-6 left-6 right-6">
                    <button 
                        onClick={onGenerateSpirit}
                        disabled={isGeneratingSpirit}
                        className="w-full group relative overflow-hidden rounded-xl bg-purple-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#393BB2_50%,#E2E8F0_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-3 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-purple-900/50 gap-2">
                            {isGeneratingSpirit ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-purple-400" />}
                            {isGeneratingSpirit ? "MANIFESTING SPIRIT..." : "REVEAL TRUE FORM"}
                        </span>
                    </button>
                 </div>
             </div>
           )}
           
           {/* Floating ID badge */}
           <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-full border-orange-500/30 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-mono text-orange-400 font-bold">ID: {Math.floor(Math.random() * 9000) + 1000}</span>
           </div>
        </div>

        {/* Right Side: Data Dossier */}
        <div className="md:w-7/12 p-8 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 relative">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header Data */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{profile.name}</h2>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {profile.rpgClass}
                        </span>
                        <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {profile.title}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Affinity</div>
                    <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        {profile.element}
                    </div>
                </div>
            </div>

            <div className="relative mb-8 p-6 rounded-2xl bg-white/5 border border-white/5">
                <QuoteIcon className="absolute top-4 left-4 w-6 h-6 text-white/10" />
                <p className="text-slate-300 italic text-center relative z-10 font-light text-lg">
                    "{profile.quote}"
                </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8">
                <StatBar label="Cuddliness" value={profile.stats.cuddliness} icon={<Heart className="w-3 h-3 text-pink-400"/>} color="bg-pink-500" trackColor="bg-pink-900/20" />
                <StatBar label="Mischief" value={profile.stats.mischief} icon={<Zap className="w-3 h-3 text-yellow-400"/>} color="bg-yellow-500" trackColor="bg-yellow-900/20" />
                <StatBar label="Intellect" value={profile.stats.intelligence} icon={<BrainCircuit className="w-3 h-3 text-cyan-400"/>} color="bg-cyan-500" trackColor="bg-cyan-900/20" />
                <StatBar label="Appetite" value={profile.stats.hunger} icon={<Utensils className="w-3 h-3 text-red-400"/>} color="bg-red-500" trackColor="bg-red-900/20" />
            </div>

            <div className="mb-6">
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2">
                    <Dna className="w-3 h-3" /> Biological Profile
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-4">
                    {profile.bio}
                </p>
            </div>

            {/* Intel Search Section */}
            <div className="min-h-[60px]">
                 {intel.length === 0 ? (
                     <button 
                        onClick={handleIntelSearch}
                        disabled={loadingIntel}
                        className="group w-full border border-dashed border-slate-700 rounded-xl p-3 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all disabled:opacity-50"
                     >
                        {loadingIntel ? <Globe className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 group-hover:animate-bounce" />}
                        <span className="text-xs font-bold uppercase tracking-wider">{loadingIntel ? "Accessing Global Database..." : "Verify Breed Intel (Google Grounding)"}</span>
                     </button>
                 ) : (
                     <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-500/20">
                         <h5 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2">
                             <Globe className="w-3 h-3"/> VERIFIED INTEL
                         </h5>
                         <ul className="space-y-3">
                             {intel.map((item, idx) => (
                                 <li key={idx} className="flex items-start gap-2">
                                     <ExternalLink className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                                     <a href={item.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-300 hover:text-white hover:underline transition-colors block">
                                        <span className="font-bold block mb-0.5">{item.title}</span>
                                        <span className="text-slate-500 line-clamp-1 opacity-70">Source Verified</span>
                                     </a>
                                 </li>
                             ))}
                         </ul>
                     </div>
                 )}
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
            <button 
                onClick={onChatClick}
                className="w-full bg-slate-100 hover:bg-white text-slate-900 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95"
            >
                <MessageCircle className="w-5 h-5" />
                Initialize Comms Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuoteIcon = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 