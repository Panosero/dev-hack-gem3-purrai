import React, { useState, useEffect, useRef } from 'react';
import { CatProfile, ChatMessage } from '../types';
import { X, Send, Bot, Volume2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 rounded-full p-1.5 relative">
                <Bot className="w-5 h-5 text-white" />
                {isPlayingAudio && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                )}
            </div>
            <div>
                <h3 className="font-bold text-lg">{profile.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                    Online (Scheming)
                </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setUseTTS(!useTTS)} 
                className={`p-2 rounded-full transition-colors ${useTTS ? 'bg-slate-700 text-green-400' : 'bg-transparent text-slate-500'}`}
                title={useTTS ? "Voice Active" : "Voice Muted"}
             >
                <Volume2 className="w-5 h-5" />
             </button>
             <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
                <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-orange-500 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                    }`}
                >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {msg.role === 'model' && msg.audioData && (
                    <button 
                        onClick={() => playAudio(msg.audioData!)} 
                        className="mt-1 text-slate-400 hover:text-orange-500 text-xs flex items-center gap-1"
                    >
                        <Volume2 className="w-3 h-3" /> Replay Voice
                    </button>
                )}
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Say something to ${profile.name}...`}
                    className="flex-1 border border-slate-200 rounded-full px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    disabled={isTyping}
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white p-3 rounded-full transition-colors shadow-lg shadow-orange-200"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;