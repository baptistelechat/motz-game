"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { PlayerReport, WordReport } from "@/types/admin.types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function ReportsTable() {
  const [activeTab, setActiveTab] = useState<"player" | "word">("player");
  const [playerReports, setPlayerReports] = useState<PlayerReport[]>([]);
  const [wordReports, setWordReports] = useState<WordReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  const supabase = createClient();

  const fetchReports = useCallback(
    async (pageIndex: number, reset: boolean = false) => {
      setLoading(true);
      const from = pageIndex * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      if (activeTab === "player") {
        const { data, error } = await supabase
          .from("player_reports")
          .select(
            `
          *,
          reporter:players!player_reports_reporter_id_fkey(pseudo),
          reported:players!player_reports_reported_id_fkey(pseudo)
        `,
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error(error);
          toast.error("Failed to fetch player reports");
        } else {
          const newData = data as unknown as PlayerReport[];
          if (newData.length < ITEMS_PER_PAGE) setHasMore(false);
          setPlayerReports((prev) => (reset ? newData : [...prev, ...newData]));
        }
      } else {
        const { data, error } = await supabase
          .from("word_reports")
          .select(
            `
          *,
          reporter:players!word_reports_reporter_id_fkey(pseudo)
        `,
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error(error);
          toast.error("Failed to fetch word reports");
        } else {
          const newData = data as unknown as WordReport[];
          if (newData.length < ITEMS_PER_PAGE) setHasMore(false);
          setWordReports((prev) => (reset ? newData : [...prev, ...newData]));
        }
      }
      setLoading(false);
    },
    [activeTab, supabase],
  );

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchReports(0, true);
  }, [activeTab, fetchReports]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReports(nextPage);
  };

  const handleAction = async (
    id: string,
    action: string,
    type: "player" | "word",
  ) => {
    const table = type === "player" ? "player_reports" : "word_reports";
    const status = action === "ignore" ? "ignored" : "resolved";

    // Optimistic update
    if (type === "player") {
      setPlayerReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: status } : r)),
      );
    } else {
      setWordReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: status } : r)),
      );
    }

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Action failed");
      // Revert optimistic update by refetching
      // We refetch the current page range or just reload everything
      fetchReports(0, true);
    } else {
      toast.success(`Report marked as ${status}`);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b-4 border-black pb-6">
        <div className="flex gap-4">
          <Button
            variant={activeTab === "player" ? "default" : "outline"}
            onClick={() => setActiveTab("player")}
            className="font-vt323 text-xl"
          >
            Player Reports
          </Button>
          <Button
            variant={activeTab === "word" ? "default" : "outline"}
            onClick={() => setActiveTab("word")}
            className="font-vt323 text-xl"
          >
            Word Reports
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading && page === 0 ? (
          <div className="p-8 text-center font-vt323 text-2xl animate-pulse">
            Loading...
          </div>
        ) : activeTab === "player" ? (
          <div className="divide-y-4 divide-black">
            {playerReports.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-vt323 text-2xl">
                No reports found
              </div>
            )}
            {playerReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4 bg-background hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-2">
                  <div className="font-bold text-lg">
                    <span className="text-primary">
                      {report.reporter?.pseudo || "Unknown"}
                    </span>{" "}
                    reported{" "}
                    <span className="text-destructive">
                      {report.reported?.pseudo || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase text-xs">
                      {report.reason}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-mono">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Badge
                    variant={
                      report.status === "pending" ? "destructive" : "secondary"
                    }
                    className="uppercase"
                  >
                    {report.status}
                  </Badge>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 md:flex-none"
                    onClick={() => handleAction(report.id, "ignore", "player")}
                  >
                    Ignore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 md:flex-none"
                    onClick={() => handleAction(report.id, "ban", "player")}
                  >
                    Ban Player
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y-4 divide-black">
            {wordReports.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-vt323 text-2xl">
                No reports found
              </div>
            )}
            {wordReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4 bg-background hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-2">
                  <div className="font-bold text-lg">
                    Word:{" "}
                    <span className="bg-yellow-200 dark:bg-yellow-900 px-2 py-0.5 border-2 border-black">
                      {report.reported_word}
                    </span>
                  </div>
                  <div className="text-sm">
                    Reporter:{" "}
                    <span className="text-primary">
                      {report.reporter?.pseudo || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                    <Badge
                      variant={
                        report.status === "pending"
                          ? "destructive"
                          : "secondary"
                      }
                      className="uppercase"
                    >
                      {report.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 md:flex-none"
                    onClick={() => handleAction(report.id, "ignore", "word")}
                  >
                    Ignore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 md:flex-none"
                    onClick={() => handleAction(report.id, "block", "word")}
                  >
                    Block
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 md:flex-none"
                    onClick={() => handleAction(report.id, "allow", "word")}
                  >
                    Allow
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="p-4 flex justify-center border-t-4 border-black bg-muted/20">
            <Button
              onClick={loadMore}
              variant="outline"
              className="font-vt323 text-xl w-full max-w-xs"
            >
              Load More
            </Button>
          </div>
        )}
        {loading && page > 0 && (
          <div className="p-4 text-center font-vt323 text-xl animate-pulse">
            Loading more reports...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
