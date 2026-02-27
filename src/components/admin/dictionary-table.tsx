"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDictionaryItem } from "@/types/admin.types";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export function DictionaryTable() {
    const [words, setWords] = useState<CustomDictionaryItem[]>([]);
    const [newWord, setNewWord] = useState("");
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchWords = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("custom_dictionary" as any)
            .select("*")
            .order("created_at", { ascending: false });
        
        if (error) {
            console.error(error);
            toast.error("Failed to fetch dictionary");
        } else {
            setWords(data as unknown as CustomDictionaryItem[]);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    const addWord = async (action: 'allow' | 'block') => {
        if (!newWord) return;
        const { error } = await supabase
            .from("custom_dictionary" as any)
            .insert({ word: newWord.toLowerCase(), action });
        
        if (error) {
            toast.error("Failed to add word");
        } else {
            toast.success(`Word ${action}ed`);
            setNewWord("");
            fetchWords();
        }
    };

    const deleteWord = async (id: string) => {
        const { error } = await supabase
            .from("custom_dictionary" as any)
            .delete()
            .eq("id", id);
        
        if (error) {
            toast.error("Failed to delete word");
        } else {
            toast.success("Word deleted");
            fetchWords();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end bg-card p-4 border-4 border-black shadow-hard">
                <div className="space-y-2 flex-1">
                    <label className="text-sm font-bold uppercase">Add New Word</label>
                    <Input 
                        value={newWord} 
                        onChange={(e) => setNewWord(e.target.value)} 
                        placeholder="Enter word..." 
                        className="font-mono"
                    />
                </div>
                <Button onClick={() => addWord('allow')} className="font-vt323 text-xl">Allow</Button>
                <Button variant="destructive" onClick={() => addWord('block')} className="font-vt323 text-xl">Block</Button>
            </div>
            
            <div className="border-4 border-black bg-background p-4 shadow-hard">
                {loading ? (
                    <div className="text-center py-8 font-vt323 text-2xl animate-pulse">Loading dictionary...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {words.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground font-vt323 text-2xl">Dictionary is empty</div>}
                        {words.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 border-2 border-black bg-card hover:translate-x-1 transition-transform">
                                <span className="font-bold font-mono text-lg">{item.word}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant={item.action === 'allow' ? 'default' : 'destructive'} className="uppercase">
                                        {item.action}
                                    </Badge>
                                    <Button size="icon" variant="ghost" onClick={() => deleteWord(item.id)} className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
