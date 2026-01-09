import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { CatProfile, ForensicReport, TrainingPlan, SearchResult } from "../types";

const apiKey = process.env.API_KEY || '';
export const getAiClient = () => new GoogleGenAI({ apiKey });

// --- Cat Profile Analysis ---

export const analyzeCatImage = async (base64Image: string, mimeType: string): Promise<CatProfile> => {
  const modelId = "gemini-3-flash-preview";
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      title: { type: Type.STRING },
      rpgClass: { type: Type.STRING },
      element: { type: Type.STRING },
      visualCharacteristics: { type: Type.STRING, description: "Brief visual description of breed and color for search purposes" },
      stats: {
        type: Type.OBJECT,
        properties: {
          cuddliness: { type: Type.INTEGER },
          mischief: { type: Type.INTEGER },
          intelligence: { type: Type.INTEGER },
          hunger: { type: Type.INTEGER },
        },
        required: ["cuddliness", "mischief", "intelligence", "hunger"]
      },
      bio: { type: Type.STRING },
      greeting: { type: Type.STRING },
      quote: { type: Type.STRING }
    },
    required: ["name", "title", "rpgClass", "element", "stats", "bio", "greeting", "quote", "visualCharacteristics"]
  };

  const prompt = `Analyze this image of a cat. Create a fun, RPG-themed character profile.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as CatProfile;
  } catch (error) {
    console.error("Error analyzing cat:", error);
    throw error;
  }
};

// --- Intel Search (Grounding) ---

export const performIntelSearch = async (query: string): Promise<SearchResult[]> => {
    const ai = getAiClient();
    const modelId = "gemini-3-flash-preview";
    
    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: `Find fun facts and care tips about this type of cat: ${query}`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        // Extract grounding chunks
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const results: SearchResult[] = [];

        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                results.push({
                    title: chunk.web.title,
                    uri: chunk.web.uri,
                    snippet: "Verified Intel Source"
                });
            }
        });

        return results.slice(0, 3); // Return top 3
    } catch (e) {
        console.error("Search failed", e);
        return [];
    }
}

// --- Training Command (Thinking Model) ---

export const generateTrainingPlan = async (goal: string, profile: CatProfile): Promise<TrainingPlan> => {
    const ai = getAiClient();
    // Using Gemini 3 Pro with Thinking for complex planning
    const modelId = "gemini-3-pro-preview";

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            missionName: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Recruit', 'Veteran', 'Special Ops'] },
            phases: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        phaseName: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tacticalTips: { type: Type.STRING }
                    },
                    required: ["phaseName", "duration", "objectives", "tacticalTips"]
                }
            },
            finalOutcome: { type: Type.STRING }
        },
        required: ["missionName", "difficulty", "phases", "finalOutcome"]
    };

    const prompt = `
        Subject: ${profile.name} (Class: ${profile.rpgClass}, Mischief Level: ${profile.stats.mischief}/10).
        Mission Goal: ${goal}.
        
        Create a detailed, step-by-step training protocol to achieve this goal. 
        Consider the cat's RPG class and stats in your strategy.
        If mischief is high, include containment protocols.
        If hunger is high, suggest treat-based bribery.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                // Enable Thinking for better planning
                thinkingConfig: { thinkingBudget: 1024 } 
            }
        });

        const text = response.text;
        if (!text) throw new Error("Mission planning failed");
        return JSON.parse(text) as TrainingPlan;
    } catch (e) {
        console.error("Training generation failed", e);
        throw e;
    }
};

// --- TTS for Chat ---

export const generateSpeech = async (text: string, rpgClass: string): Promise<string> => {
    const ai = getAiClient();
    const modelId = "gemini-2.5-flash-preview-tts";

    // Map RPG classes to Voice Personalities
    let voiceName = 'Puck'; // Default
    if (rpgClass.toLowerCase().includes('rogue') || rpgClass.toLowerCase().includes('assassin')) voiceName = 'Fenrir';
    if (rpgClass.toLowerCase().includes('paladin') || rpgClass.toLowerCase().includes('tank')) voiceName = 'Kore';
    if (rpgClass.toLowerCase().includes('mage') || rpgClass.toLowerCase().includes('wizard')) voiceName = 'Charon';

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        return base64Audio;
    } catch (e) {
        console.error("TTS failed", e);
        throw e;
    }
};

// --- Forensic Video Analysis ---

export const analyzeForensicVideo = async (frames: string[]): Promise<ForensicReport> => {
    // Gemini 3 Pro is excellent for complex reasoning over multiple inputs (frames)
    const modelId = "gemini-3-pro-preview"; 
    const ai = getAiClient();

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING, description: "Description of the cat involved." },
            incidentType: { type: Type.STRING, description: "The category of event (e.g. 'Gravity Check', 'Zoomies', 'Ambush')." },
            timestampOfIncident: { type: Type.STRING, description: "When the peak action occurred relative to the frames provided." },
            intent: { type: Type.STRING, enum: ['Accidental', 'Premeditated', 'Chaos Agent'] },
            causeAnalysis: { type: Type.STRING, description: "A detailed forensic analysis of why this happened (cause and effect)." },
            physicsNotes: { type: Type.STRING, description: "Comments on velocity, trajectory, or friction." },
            verdict: { type: Type.STRING, description: "Final judgment on the cat's guilt." }
        },
        required: ["subject", "incidentType", "intent", "causeAnalysis", "physicsNotes", "verdict"]
    };

    const parts = [
        ...frames.map(base64 => ({
            inlineData: { mimeType: 'image/jpeg', data: base64 }
        })),
        {
            text: `Analyze this sequence of video frames (extracted at 1 frame per second). 
        You are a Forensic Cat Detective. 
        Reconstruct the timeline of events. Identify the cause and effect. 
        Determine if the cat's actions were calculated or clumsy.`
        }
    ];

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are a serious, yet slightly absurd, forensic analyst for feline crimes."
            }
        });

        const text = response.text;
        if (!text) throw new Error("Forensic analysis failed");
        return JSON.parse(text) as ForensicReport;

    } catch (error) {
        console.error("Forensics failed:", error);
        throw error;
    }
}

// --- Image Generation ---

export const generateSpiritImage = async (profile: CatProfile, originalImageBase64: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";
  const ai = getAiClient();

  const prompt = `A high-quality, adorable yet epic digital painting of a cat character named ${profile.name}.
  The cat is a ${profile.rpgClass} with a ${profile.element} theme.
  Title: ${profile.title}.
  Style: Pixar meets Dungeons & Dragons, vibrant lighting, magical aura.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating spirit image:", error);
    throw error;
  }
};

export const createChatSession = (profile: CatProfile) => {
  const modelId = "gemini-3-flash-preview";
  const ai = getAiClient();
  
  const systemInstruction = `You are ${profile.name}, a ${profile.rpgClass}. Roleplay as this cat. Keep answers under 40 words.`;

  return ai.chats.create({
    model: modelId,
    config: { systemInstruction }
  });
};