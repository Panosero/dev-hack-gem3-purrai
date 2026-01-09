import React, { useState, useEffect, useRef } from 'react';
import { CatProfile, ChatMessage } from '../types';
import { X, Send, Bot, Volume2, Wifi, Lock } from 'lucide-react';
import { createChatSession, generateSpeech } from '../services/geminiService';
import { Chat } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

interface ChatInterfaceProps {
  profile: CatProfile;
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [useTTS, setUseTTS] = useState(true);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize chat session when opened
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createChatSession(profile);
      // Add initial greeting
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: profile.greeting,
          timestamp: Date.now()
        }
      ]);
      
      // Init audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    
    return () => {
        audioContextRef.current?.close();
    }
  }, [isOpen, profile]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAudio = async (base64: string) => {
      if (!audioContextRef.current) return;
      setIsPlayingAudio(true);
      try {
          const ctx = audioContextRef.current;
          const audioBuffer = await decodeAudioData(base64ToUint8Array(base64), ctx);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.onended = () => setIsPlayingAudio(false);
          source.start();
      } catch (e) {
          console.error("Audio playback error", e);
          setIsPlayingAudio(false);
      }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || "...meow?";
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, modelMsg]);

      // Generate Audio if enabled
      if (useTTS) {
          try {
              const audioBase64 = await generateSpeech(responseText, profile.rpgClass);
              playAudio(audioBase64);
              modelMsg.audioData = audioBase64;
          } catch (e) {
              console.warn("TTS Generation failed", e);
          }
      }

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "*Hisses at the invisible network demons* (Something went wrong, try again!)",
          timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[600px] overflow-hidden border-slate-700">
        {/* Header */}
        <div className="bg-slate-900 border-b border-white/5 p-4 flex justify-between items-center relative overflow-hidden">
          {/* Animated Matrix Background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-[1px]">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-orange-500" />
                    </div>
                </div>
                {isPlayingAudio && (
                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-slate-900"></span>
                    </span>
                )}
            </div>
            <div>
                <h3 className="font-bold text-lg text-white tracking-tight">{profile.name}</h3>
                <p className="text-[10px] text-green-400 flex items-center gap-1 font-mono uppercase">
                    <Wifi className="w-3 h-3" />
                    Secure Connection Established
                </p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
             <button 
                onClick={() => setUseTTS(!useTTS)} 
                className={`p-2 rounded-full transition-colors border ${useTTS ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                title={useTTS ? "Voice Active" : "Voice Muted"}
             >
                <Volume2 className="w-4 h-4" />
             </button>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
               <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-950/50">
          {messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
                <div className={`text-[10px] mb-1 font-mono ${msg.role === 'user' ? 'text-slate-500' : 'text-orange-500/70'}`}>
                    {msg.role === 'user' ? 'YOU' : 'SUBJECT'} // {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
                        : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none shadow-lg'
                    }`}
                >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {msg.role === 'model' && msg.audioData && (
                    <button 
                        onClick={() => playAudio(msg.audioData!)} 
                        className="mt-2 text-slate-500 hover:text-green-400 text-xs flex items-center gap-1 transition-colors"
                    >
                        <Volume2 className="w-3 h-3" /> Replay Transmission
                    </button>
                )}
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
                 <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                    <span className="w-2 h-2 bg-orange-500/50 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-orange-500/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-orange-500/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-900 border-t border-white/5">
            <div className="flex gap-3 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Transmit message...`}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                    disabled={isTyping}
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-2 text-center">
                <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> End-to-end encryption via Gemini Secure Channel
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;