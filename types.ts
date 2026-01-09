export interface CatStats {
  cuddliness: number;
  mischief: number;
  intelligence: number;
  hunger: number;
}

export interface CatProfile {
  name: string;
  title: string;
  rpgClass: string;
  element: string;
  stats: CatStats;
  bio: string;
  greeting: string;
  quote: string;
  visualCharacteristics?: string; // For search grounding
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  audioData?: string; // Base64 audio string
}

export interface ForensicReport {
  subject: string;
  incidentType: string;
  timestampOfIncident: string;
  intent: 'Accidental' | 'Premeditated' | 'Chaos Agent';
  causeAnalysis: string;
  physicsNotes: string;
  verdict: string;
}

export interface TrainingPhase {
    phaseName: string;
    duration: string;
    objectives: string[];
    tacticalTips: string;
}

export interface TrainingPlan {
    missionName: string;
    difficulty: 'Recruit' | 'Veteran' | 'Special Ops';
    phases: TrainingPhase[];
    finalOutcome: string;
}

export interface SearchResult {
    title: string;
    uri: string;
    snippet: string;
}

export type LiveConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
