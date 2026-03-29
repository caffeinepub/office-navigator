import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BookOpen, ChevronDown, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type SessionSummaryEntry = {
  id: string;
  date: string;
  type: "matrix" | "coach" | "reframe" | "script";
  topic: string;
  takeaways: string[];
};

function extractTakeaways(responseText: string): string[] {
  const sentences = responseText
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && !/^\s*$/.test(s));
  return sentences.slice(0, 3);
}

const TYPE_LABELS: Record<string, string> = {
  matrix: "Matrix",
  coach: "Ask Coach",
  reframe: "Reframe",
  script: "Script",
};

const TYPE_COLORS: Record<string, string> = {
  matrix: "bg-blue-100 text-blue-700",
  coach: "bg-purple-100 text-purple-700",
  reframe: "bg-green-100 text-green-700",
  script: "bg-orange-100 text-orange-700",
};

interface SessionSummaryPanelProps {
  responseText: string;
  sessionType: "matrix" | "coach" | "reframe" | "script";
  topic: string;
}

export function SessionSummaryPanel({
  responseText,
  sessionType,
  topic,
}: SessionSummaryPanelProps) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const takeaways = extractTakeaways(responseText);

  if (takeaways.length === 0) return null;

  const handleSave = () => {
    const existing: SessionSummaryEntry[] = JSON.parse(
      localStorage.getItem("wc_session_summaries") ?? "[]",
    );
    const entry: SessionSummaryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString(),
      type: sessionType,
      topic: topic.slice(0, 120),
      takeaways,
    };
    localStorage.setItem(
      "wc_session_summaries",
      JSON.stringify([entry, ...existing]),
    );
    setSaved(true);
    toast.success("Session summary saved!");
  };

  return (
    <div className="mt-4 pt-3 border-t border-border/40">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            data-ocid="session-summary.toggle"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-body"
          >
            <span className="flex items-center gap-2 font-medium text-foreground">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              Session Summary
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 px-3 py-3 rounded-lg bg-muted/30 border border-border/60 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full font-body ${TYPE_COLORS[sessionType]}`}
              >
                {TYPE_LABELS[sessionType]}
              </span>
              <span className="text-xs text-muted-foreground font-body">
                {new Date().toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-body italic line-clamp-2">
              &ldquo;{topic}&rdquo;
            </p>
            <ul className="space-y-1.5">
              {takeaways.map((t, i) => (
                <li
                  key={t.slice(0, 20)}
                  className="flex items-start gap-2 text-xs font-body text-foreground"
                >
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            {!saved ? (
              <Button
                data-ocid="session-summary.save_button"
                size="sm"
                variant="outline"
                onClick={handleSave}
                className="font-body gap-1.5 text-xs h-7"
              >
                <Save className="w-3 h-3" />
                Save Summary
              </Button>
            ) : (
              <span className="text-xs text-green-600 font-body font-medium">
                &#10003; Saved to Summaries
              </span>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function SummariesTab() {
  const [summaries, setSummaries] = useState<SessionSummaryEntry[]>(() =>
    JSON.parse(localStorage.getItem("wc_session_summaries") ?? "[]"),
  );

  const handleDelete = (id: string) => {
    const updated = summaries.filter((s) => s.id !== id);
    setSummaries(updated);
    localStorage.setItem("wc_session_summaries", JSON.stringify(updated));
  };

  if (summaries.length === 0) {
    return (
      <div
        data-ocid="summaries.empty_state"
        className="text-center py-16 border border-dashed border-border rounded-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="font-body text-sm text-muted-foreground">
          No session summaries saved yet.
        </p>
        <p className="font-body text-xs text-muted-foreground/70 mt-1">
          Click &ldquo;Session Summary&rdquo; inside any coaching response to
          save key takeaways.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="summaries.list">
      {summaries.map((s, i) => (
        <div
          key={s.id}
          data-ocid={`summaries.item.${i + 1}`}
          className="rounded-xl border border-border bg-card p-4 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full font-body ${TYPE_COLORS[s.type]}`}
              >
                {TYPE_LABELS[s.type]}
              </span>
              <span className="text-xs text-muted-foreground font-body">
                {new Date(s.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <button
              type="button"
              data-ocid={`summaries.delete_button.${i + 1}`}
              onClick={() => handleDelete(s.id)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              aria-label="Delete summary"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-body italic line-clamp-1">
            &ldquo;{s.topic}&rdquo;
          </p>
          <ul className="space-y-1">
            {s.takeaways.map((t, j) => (
              <li
                key={`summary-${s.id}-takeaway-${j}`}
                className="flex items-start gap-2 text-xs font-body text-foreground"
              >
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {j + 1}
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
