
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export type StagingStyle = 
  | 'empty' | 'modern' | 'rustic' | 'minimalist' | 'luxury' | 'scandinavian' | 'industrial' | 'add-remove'
  | 'lawn-manicured' | 'sky-blue' | 'twilight' | 'season-winter' | 'season-autumn' | 'season-summer' | 'season-spring'
  | 'sunny-bright' | 'antique' | 'traditional';

export type RoomType = 'living_room' | 'bedroom' | 'dining_room' | 'great_room' | 'den' | 'study' | 'game_room' | 'kitchen' | 'bathroom' | 'office' | 'exterior' | 'backyard' | 'patio' | '';

export type StyleCategory = 'interior' | 'outdoor';

export interface StagingOption {
  id: StagingStyle;
  label: string;
  description: string;
  tips?: string;
  prompt: string;
  previewUrl: string;
  category: StyleCategory;
  creditCost?: number;
}

export interface RoomTypeOption {
  id: RoomType;
  label: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

export interface StagedItem {
  id: string;
  projectId?: string;
  name: string;
  original: string;
  originalUrlStorage?: string;
  roomType?: RoomType;
  styleCategory: StyleCategory;
  staged: Partial<Record<StagingStyle, string>>;
  styleHistory: Partial<Record<StagingStyle, HistoryItem[]>>; // History of images per style
  historyIndex: Record<string, number>; // Current viewing index per style
  currentStyle?: StagingStyle;
  sceneType?: string;
  prompt?: string;
  refinementPrompt: string; 
  refinementHistory: string[]; 
  isProcessing: boolean;
  error: string | null;
  watermarkText?: string;
}

export interface StagingState {
  items: StagedItem[];
  selectedIndex: number;
}
