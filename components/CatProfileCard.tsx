import React, { useRef, useState } from 'react';
import { CatProfile, SearchResult } from '../types';
import { Shield, Zap, Heart, Utensils, Sparkles, MessageCircle, Wand2, Globe, ExternalLink } from 'lucide-react';
import { performIntelSearch } from '../services/geminiService';

interface CatProfileCardProps {
  profile: CatProfile;
  originalImage: string | null;
  onChatClick: () => void;
  onGenerateSpirit: () => void;
  spiritImage: string | null;
  isGeneratingSpirit: boolean;
}

const StatBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        {icon}
        {label}
      </div>
      <span className="text-xs font-bold text-slate-500">{value}/10</span>
    </div>
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${color}`} 
        style={{ width: `${value * 10}%` }}
      ></div>
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
  const cardRef = useRef<HTMLDivElement>(null);
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
    <div ref={cardRef} className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 animate-fade-in-up">
      <div className="md:flex">
        {/* Left Side: Image */}
        <div className="md:w-1/2 relative bg-orange-100 h-96 md:h-auto min-h-[400px]">
           {spiritImage ? (
             <div className="relative w-full h-full group cursor-pointer" onClick={() => { /* Toggle view maybe? */ }}>
                <img src={spiritImage} alt="Spirit Form" className="w-full h-full object-cover animate-fade-in" />
                <div className="absolute bottom-4 left-4 bg-purple-900/80 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                    Spirit Form
                </div>
             </div>
           ) : (
             <img 
               src={originalImage || ''} 
               alt={profile.name} 
               className="w-full h-full object-cover" 
             />
           )}
           
           {/* Generate Spirit Button (Overlay if no spirit image yet) */}
           {!spiritImage && (
             <button 
                onClick={onGenerateSpirit}
                disabled={isGeneratingSpirit}
                className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
             >
                {isGeneratingSpirit ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {isGeneratingSpirit ? "Summoning..." : "Reveal Spirit Form"}
             </button>
           )}
        </div>

        {/* Right Side: Stats */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between relative bg-gradient-to-br from-white to-orange-50">
          <div>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 mb-1">{profile.name}</h2>
                    <p className="text-orange-500 font-bold text-lg flex items-center gap-2">
                        <span className="bg-orange-100 px-2 py-0.5 rounded text-sm uppercase tracking-wider">{profile.rpgClass}</span>
                        <span className="text-slate-400">•</span>
                        <span>{profile.title}</span>
                    </p>
                </div>
                <div className="bg-slate-800 text-white p-2 rounded-lg text-center min-w-[60px]">
                    <div className="text-xs uppercase opacity-70">Element</div>
                    <div className="font-bold">{profile.element}</div>
                </div>
            </div>

            <p className="text-slate-600 italic mb-6 border-l-4 border-orange-300 pl-4 py-1">
                "{profile.quote}"
            </p>

            <div className="space-y-4 mb-6">
                <StatBar label="Cuddliness" value={profile.stats.cuddliness} icon={<Heart className="w-4 h-4 text-pink-500"/>} color="bg-pink-500" />
                <StatBar label="Mischief" value={profile.stats.mischief} icon={<Zap className="w-4 h-4 text-yellow-500"/>} color="bg-yellow-500" />
                <StatBar label="Intelligence" value={profile.stats.intelligence} icon={<Shield className="w-4 h-4 text-blue-500"/>} color="bg-blue-500" />
                <StatBar label="Hunger" value={profile.stats.hunger} icon={<Utensils className="w-4 h-4 text-red-500"/>} color="bg-red-500" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Bio</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{profile.bio}</p>
            </div>

            {/* Intel Search Section */}
            <div>
                 {intel.length === 0 ? (
                     <button 
                        onClick={handleIntelSearch}
                        disabled={loadingIntel}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                     >
                        {loadingIntel ? <Globe className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                        {loadingIntel ? "Accessing Global Database..." : "Verify Breed Intel (Search)"}
                     </button>
                 ) : (
                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                         <h5 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
                             <Globe className="w-3 h-3"/> Verified Intel
                         </h5>
                         <ul className="space-y-2">
                             {intel.map((item, idx) => (
                                 <li key={idx}>
                                     <a href={item.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-700 hover:underline flex items-start gap-1">
                                        <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1">{item.title}</span>
                                     </a>
                                 </li>
                             ))}
                         </ul>
                     </div>
                 )}
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
                onClick={onChatClick}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
                <MessageCircle className="w-6 h-6" />
                Chat with {profile.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatProfileCard;