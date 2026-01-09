import React, { useState } from 'react';
import { CatProfile, TrainingPlan } from '../types';
import { generateTrainingPlan } from '../services/geminiService';
import { Target, BrainCircuit, ChevronDown, ChevronRight, CheckCircle2, ClipboardList } from 'lucide-react';

interface TrainingCommandProps {
    profile: CatProfile;
}

const TrainingCommand: React.FC<TrainingCommandProps> = ({ profile }) => {
    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState<TrainingPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activePhase, setActivePhase] = useState<number>(0);

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        setIsLoading(true);
        try {
            const result = await generateTrainingPlan(goal, profile);
            setPlan(result);
        } catch (e) {
            alert("Strategic planning failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-700 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Target className="w-48 h-48" />
                </div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-purple-600 p-2 rounded-lg">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">Training Command</h2>
                        <p className="text-slate-400 text-sm">Gemini 3.0 Pro Thinking Engine</p>
                    </div>
                </div>

                {!plan ? (
                    <div className="relative z-10 max-w-2xl">
                        <p className="text-lg text-slate-300 mb-6">
                            Define a mission objective for <strong>Agent {profile.name}</strong>. The Thinking Engine will generate a phase-based protocol adapted to their {profile.rpgClass} class.
                        </p>

                        <div className="flex flex-col gap-4">
                            <input 
                                type="text" 
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="E.g., Stop scratching the sofa, Learn to high-five..."
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setGoal("Stop scratching the new leather sofa")}
                                    className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors"
                                >
                                    Ex: Anti-Scratch
                                </button>
                                <button 
                                    onClick={() => setGoal("Come when called by name")}
                                    className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors"
                                >
                                    Ex: Recall
                                </button>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={isLoading || !goal}
                                className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <BrainCircuit className="w-5 h-5 animate-pulse" />
                                        Thinking (Formulating Strategy)...
                                    </>
                                ) : (
                                    <>
                                        Generate Protocol
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 animate-fade-in">
                        <div className="flex justify-between items-start border-b border-slate-700 pb-6 mb-6">
                            <div>
                                <h3 className="text-3xl font-black text-white mb-2">{plan.missionName}</h3>
                                <div className="flex gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        plan.difficulty === 'Recruit' ? 'bg-green-900 text-green-300' :
                                        plan.difficulty === 'Veteran' ? 'bg-yellow-900 text-yellow-300' :
                                        'bg-red-900 text-red-300'
                                    }`}>
                                        Difficulty: {plan.difficulty}
                                    </span>
                                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">
                                        Target: {profile.name}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setPlan(null)}
                                className="text-slate-400 hover:text-white text-sm underline"
                            >
                                New Mission
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Phase Navigation */}
                            <div className="space-y-3">
                                {plan.phases.map((phase, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActivePhase(idx)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                                            activePhase === idx 
                                            ? 'bg-purple-900/30 border-purple-500 text-white' 
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                                        }`}
                                    >
                                        <div>
                                            <div className="text-xs uppercase font-bold opacity-70 mb-1">Phase {idx + 1}</div>
                                            <div className="font-bold">{phase.phaseName}</div>
                                        </div>
                                        {activePhase === idx && <ChevronRight className="w-5 h-5 text-purple-400" />}
                                    </button>
                                ))}
                                <div className="mt-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <h4 className="font-bold text-green-400 text-sm mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Expected Outcome
                                    </h4>
                                    <p className="text-sm text-slate-300">{plan.finalOutcome}</p>
                                </div>
                            </div>

                            {/* Phase Details */}
                            <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 min-h-[400px]">
                                <h4 className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">Current Phase Protocol</h4>
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.phases[activePhase].phaseName}</h3>
                                <p className="text-slate-400 mb-6 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" />
                                    Duration: {plan.phases[activePhase].duration}
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h5 className="font-bold text-white mb-3">Objectives</h5>
                                        <ul className="space-y-3">
                                            {plan.phases[activePhase].objectives.map((obj, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                    <span>{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                                        <h5 className="font-bold text-yellow-500 mb-2 text-sm uppercase">Tactical Advice</h5>
                                        <p className="text-slate-300 italic text-sm">
                                            "{plan.phases[activePhase].tacticalTips}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingCommand;