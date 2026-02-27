import { Database } from './database.types';

export type PlayerReport = Database['public']['Tables']['player_reports']['Row'] & {
  reporter?: { pseudo: string };
  reported?: { pseudo: string };
  status: 'pending' | 'resolved' | 'ignored';
};

export type WordReport = Database['public']['Tables']['word_reports']['Row'] & {
  reporter?: { pseudo: string };
  status: 'pending' | 'resolved' | 'ignored';
};

export type CustomDictionaryItem = {
  id: string;
  word: string;
  action: 'allow' | 'block';
  created_by: string;
  created_at: string;
};

// Manually defining missing types if not in database.types.ts yet
export type PlayerReportRow = {
  id: string;
  game_id: string;
  reporter_id: string;
  reported_id: string;
  reason: 'toxic' | 'cheat' | 'afk';
  created_at: string;
};

export type WordReportRow = {
  id: string;
  game_id: string;
  round_id: string;
  reporter_id: string;
  reported_word: string;
  reason: string;
  created_at: string;
};
