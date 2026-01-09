import { useState, useRef, useEffect, useCallback } from 'react';
import { getAiClient } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

export const useLiveGemini = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Ref for the active session promise
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Queue management for smooth playback
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const connect = async (videoElement: HTMLVideoElement | null) => {
    try {
      setStatus('connecting');
      const ai = getAiClient();

      // Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 }); // Output rate
      
      // Input context (often needs 16kHz for best STT, but browser defaults usually work if we resample)
      // We will handle resampling in the script processor if needed, but simple ratio works usually.
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);

      // Get User Media (Audio & Video)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;

      // Connect video if element provided
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.muted = true;
        videoElement.play();
      }

      // Establish Live Connection
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a tactical command AI observing a feline subject. Describe movements using military jargon mixed with nature documentary style. Be observant of spatial details. Identify threats (toys) and allies (humans).",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
        callbacks: {
          onopen: () => {
            setStatus('connected');
            setupAudioInput(inputCtx, stream);
            if (videoElement) setupVideoInput(videoElement);
          },
          onmessage: (message: LiveServerMessage) => {
             handleServerMessage(message);
          },
          onclose: () => {
            setStatus('disconnected');
            cleanup();
          },
          onerror: (e) => {
            console.error(e);
            setStatus('error');
            cleanup();
          }
        }
      });

    } catch (err) {
      console.error("Connection failed", err);
      setStatus('error');
    }
  };

  const setupAudioInput = (inputCtx: AudioContext, stream: MediaStream) => {
    const source = inputCtx.createMediaStreamSource(stream);
    inputSourceRef.current = source;
    
    // 4096 buffer size for reasonable latency/performance balance
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for UI
      let sum = 0;
      for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
      setVolume(Math.sqrt(sum / inputData.length));

      const pcmBlob = createPcmBlob(inputData);
      
      sessionPromiseRef.current?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(processor);
    processor.connect(inputCtx.destination);
  };

  const setupVideoInput = (videoEl: HTMLVideoElement) => {
    // Send frames periodically
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const FPS = 2; // Send 2 frames per second to save bandwidth but keep context
    
    const interval = setInterval(() => {
        if (!ctx || status === 'disconnected') {
            clearInterval(interval);
            return;
        }
        canvas.width = videoEl.videoWidth * 0.5; // Scale down for performance
        canvas.height = videoEl.videoHeight * 0.5;
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        
        const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        
        sessionPromiseRef.current?.then((session) => {
             session.sendRealtimeInput({
                media: { mimeType: 'image/jpeg', data: base64Data }
             });
        });

    }, 1000 / FPS);
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio && audioContextRef.current) {
      const ctx = audioContextRef.current;
      // Initialize time cursor
      if (nextStartTimeRef.current === 0) nextStartTimeRef.current = ctx.currentTime;
      
      // Sync with current time if we fell behind significantly
      if (nextStartTimeRef.current < ctx.currentTime) nextStartTimeRef.current = ctx.currentTime;

      try {
        const audioBuffer = await decodeAudioData(
          base64ToUint8Array(base64Audio),
          ctx
        );

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNodeRef.current!);
        
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        
        source.onended = () => sourcesRef.current.delete(source);
        sourcesRef.current.add(source);
      } catch (e) {
        console.error("Audio decode error", e);
      }
    }
  };

  const disconnect = () => {
    sessionPromiseRef.current?.then(session => session.close());
    cleanup();
    setStatus('disconnected');
  };

  const cleanup = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (processorRef.current) processorRef.current.disconnect();
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return { status, connect, disconnect, volume };
};