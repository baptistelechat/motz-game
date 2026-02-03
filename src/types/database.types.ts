export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      game_players: {
        Row: {
          game_id: string;
          is_ready: boolean;
          joined_at: string;
          player_id: string;
        };
        Insert: {
          game_id: string;
          is_ready?: boolean;
          joined_at?: string;
          player_id: string;
        };
        Update: {
          game_id?: string;
          is_ready?: boolean;
          joined_at?: string;
          player_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          code: string;
          created_at: string;
          host_id: string;
          id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["game_status"];
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          host_id: string;
          id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["game_status"];
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          host_id?: string;
          id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["game_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          avatar_config: Json;
          created_at: string;
          id: string;
          last_sign_in_at: string | null;
          pseudo: string;
          updated_at: string;
        };
        Insert: {
          avatar_config?: Json;
          created_at?: string;
          id: string;
          last_sign_in_at?: string | null;
          pseudo: string;
          updated_at?: string;
        };
        Update: {
          avatar_config?: Json;
          created_at?: string;
          id?: string;
          last_sign_in_at?: string | null;
          pseudo?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rounds: {
        Row: {
          constraints: Json;
          created_at: string;
          game_id: string;
          id: string;
          round_number: number;
          status: Database["public"]["Enums"]["round_status"];
          ends_at?: string;
        };
        Insert: {
          constraints: Json;
          created_at?: string;
          game_id: string;
          id?: string;
          round_number: number;
          status?: Database["public"]["Enums"]["round_status"];
          ends_at?: string;
        };
        Update: {
          constraints?: Json;
          created_at?: string;
          game_id?: string;
          id?: string;
          round_number?: number;
          status?: Database["public"]["Enums"]["round_status"];
          ends_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rounds_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      themes: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          locale: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          locale?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          locale?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          created_at: string;
          game_id: string;
          id: string;
          is_valid: boolean;
          player_id: string;
          points_details: Json | null;
          rejection_reason: string | null;
          round_id: string;
          score: number;
          word: string;
          votes: string[];
        };
        Insert: {
          created_at?: string;
          game_id: string;
          id?: string;
          is_valid?: boolean;
          player_id: string;
          points_details?: Json | null;
          rejection_reason?: string | null;
          round_id: string;
          score?: number;
          word: string;
          votes?: string[];
        };
        Update: {
          created_at?: string;
          game_id?: string;
          id?: string;
          is_valid?: boolean;
          player_id?: string;
          points_details?: Json | null;
          rejection_reason?: string | null;
          round_id?: string;
          score?: number;
          word?: string;
          votes?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "submissions_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      start_new_round: { Args: { p_game_id: string }; Returns: Json };
      debug_regenerate_round_constraints: {
        Args: { p_round_id: string };
        Returns: Json;
      };
      submit_word: {
        Args: {
          p_game_id: string;
          p_round_id: string;
          p_player_id: string;
          p_word: string;
          p_base_score: number;
          p_letter_details: Json;
          p_is_valid: boolean;
          p_rejection_reason: string | null;
        };
        Returns: Json;
      };
      toggle_vote: {
        Args: {
          p_submission_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      game_status: "LOBBY" | "PLAYING" | "FINISHED";
      round_status: "PLAYING" | "COMPLETED" | "VALIDATING";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      game_status: ["LOBBY", "PLAYING", "FINISHED"],
      round_status: ["PLAYING", "COMPLETED"],
    },
  },
} as const;
