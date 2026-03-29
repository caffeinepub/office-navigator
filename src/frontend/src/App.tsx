import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Brain,
  Building2,
  ChevronDown,
  Clock,
  Compass,
  KeyRound,
  Lightbulb,
  Loader2,
  LogOut,
  MessageCircle,
  Pencil,
  RefreshCw,
  Rocket,
  ShieldCheck,
  User,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Scenario } from "./backend.d";
import { useAuthActions, useAuthState } from "./hooks/useAuthState";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  type ChatEntry,
  MatrixType,
  MatrixWho,
  useGetCallerUserProfile,
  useGetRecentChats,
  useGetRecentSubmissions,
  useSaveCallerUserProfile,
  useSubmitFreeChat,
  useSubmitScenario,
} from "./hooks/useQueries";

// ─── Matrix Data ──────────────────────────────────────────────────────────────

const WHO_OPTIONS: {
  value: MatrixWho;
  label: string;
  short: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}[] = [
  {
    value: MatrixWho.leaderManager,
    label: "Leader / Manager",
    short: "Leader",
    icon: <User className="w-6 h-6" />,
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  {
    value: MatrixWho.peerTeam,
    label: "Peer / Team",
    short: "Peer",
    icon: <Users className="w-6 h-6" />,
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
  },
  {
    value: MatrixWho.systemOrg,
    label: "System / Org",
    short: "System",
    icon: <Building2 className="w-6 h-6" />,
    colorClass: "text-orange-700",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
  },
];

const TYPE_OPTIONS: {
  value: MatrixType;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}[] = [
  {
    value: MatrixType.behaviorActionable,
    label: "Behavior / Actionable",
    icon: <Zap className="w-6 h-6" />,
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  {
    value: MatrixType.perceptionMindset,
    label: "Perception / Mindset",
    icon: <Brain className="w-6 h-6" />,
    colorClass: "text-slate-700",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-200",
  },
  {
    value: MatrixType.careerGrowth,
    label: "Career / Growth",
    icon: <Rocket className="w-6 h-6" />,
    colorClass: "text-orange-700",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
  },
];

type MatrixCell = {
  scenario: string;
  action: string;
};

const MATRIX: Record<MatrixWho, Record<MatrixType, MatrixCell>> = {
  [MatrixWho.leaderManager]: {
    [MatrixType.behaviorActionable]: {
      scenario: "Micromanaging?",
      action: "Share progress & build trust.",
    },
    [MatrixType.perceptionMindset]: {
      scenario: "Unresponsive?",
      action: "Focus on what you can control.",
    },
    [MatrixType.careerGrowth]: {
      scenario: "Career Stagnation?",
      action: "Take initiative & expand impact.",
    },
  },
  [MatrixWho.peerTeam]: {
    [MatrixType.behaviorActionable]: {
      scenario: "Underperforming?",
      action: "Offer help & clarify roles.",
    },
    [MatrixType.perceptionMindset]: {
      scenario: "Toxic culture?",
      action: "Protect your mindset, steer conversations.",
    },
    [MatrixType.careerGrowth]: {
      scenario: "Feeling Unnoticed?",
      action: "Track results & mentor others.",
    },
  },
  [MatrixWho.systemOrg]: {
    [MatrixType.behaviorActionable]: {
      scenario: "Inefficient processes?",
      action: "Identify levers & propose solutions.",
    },
    [MatrixType.perceptionMindset]: {
      scenario: "Resistant to change?",
      action: "Learn, adapt, improve.",
    },
    [MatrixType.careerGrowth]: {
      scenario: "New Policies?",
      action: "Find opportunities & adapt.",
    },
  },
};

function getWhoMeta(who?: MatrixWho) {
  return WHO_OPTIONS.find((w) => w.value === who);
}

function getTypeMeta(type?: MatrixType) {
  return TYPE_OPTIONS.find((t) => t.value === type);
}

function formatRelativeTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── Matrix Grid ──────────────────────────────────────────────────────────────

function MatrixGrid({
  selectedWho,
  selectedType,
  interactive = false,
}: {
  selectedWho?: MatrixWho | null;
  selectedType?: MatrixType | null;
  interactive?: boolean;
}) {
  const whoColors: Record<MatrixWho, { cell: string; header: string }> = {
    [MatrixWho.leaderManager]: {
      cell: "bg-blue-50/60",
      header: "bg-blue-600 text-white",
    },
    [MatrixWho.peerTeam]: {
      cell: "bg-emerald-50/60",
      header: "bg-emerald-600 text-white",
    },
    [MatrixWho.systemOrg]: {
      cell: "bg-orange-50/60",
      header: "bg-orange-600 text-white",
    },
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-1.5 mb-1.5">
          <div />
          {WHO_OPTIONS.map((w) => (
            <div
              key={w.value}
              className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold font-body ${
                whoColors[w.value].header
              } ${
                interactive && selectedWho === w.value
                  ? "ring-2 ring-offset-1 ring-foreground/30"
                  : ""
              }`}
            >
              {w.label}
            </div>
          ))}
        </div>

        {TYPE_OPTIONS.map((t) => (
          <div
            key={t.value}
            className="grid grid-cols-[140px_1fr_1fr_1fr] gap-1.5 mb-1.5"
          >
            <div
              className={`rounded-lg px-3 py-3 flex items-center font-semibold text-xs font-body leading-tight ${
                t.value === MatrixType.behaviorActionable
                  ? "bg-blue-100 text-blue-800"
                  : t.value === MatrixType.perceptionMindset
                    ? "bg-slate-100 text-slate-700"
                    : "bg-orange-100 text-orange-800"
              } ${
                interactive && selectedType === t.value
                  ? "ring-2 ring-offset-1 ring-foreground/30"
                  : ""
              }`}
            >
              {t.label}
            </div>

            {WHO_OPTIONS.map((w) => {
              const cell = MATRIX[w.value][t.value];
              const isHighlighted =
                interactive &&
                selectedWho === w.value &&
                selectedType === t.value;
              return (
                <div
                  key={w.value}
                  className={`rounded-lg px-3 py-3 transition-all duration-200 ${
                    isHighlighted
                      ? "ring-2 ring-primary bg-primary/10 shadow-md"
                      : whoColors[w.value].cell
                  } border border-border/40`}
                >
                  <p
                    className={`font-semibold text-xs font-body leading-tight ${
                      isHighlighted ? "text-primary" : "text-foreground/80"
                    }`}
                  >
                    {cell.scenario}
                  </p>
                  <p
                    className={`text-xs mt-1 font-body leading-tight ${
                      isHighlighted
                        ? "text-primary/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {cell.action}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Micro-actions Helper ─────────────────────────────────────────────────────

function parseSuggestions(items: string[]): {
  insights: string[];
  microActions: string[];
} {
  const insights: string[] = [];
  const microActions: string[] = [];
  for (const item of items) {
    if (item.startsWith("TRY: ")) {
      microActions.push(item.slice(5));
    } else {
      insights.push(item);
    }
  }
  return { insights, microActions };
}

function MicroActionsBlock({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">✅</span>
        <span className="font-semibold text-emerald-800 text-sm tracking-wide uppercase">
          Try This Today
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((action, i) => (
          <li key={action} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-emerald-900 leading-relaxed">
              {action}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── History Item ──────────────────────────────────────────────────────────────

function HistoryItem({
  scenario,
  index,
}: { scenario: Scenario; index: number }) {
  const [open, setOpen] = useState(false);
  const whoMeta = getWhoMeta(scenario.who);
  const typeMeta = getTypeMeta(scenario.challengeType);

  const cell =
    scenario.who && scenario.challengeType
      ? MATRIX[scenario.who][scenario.challengeType]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`history.item.${index + 1}`}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-shadow duration-200">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full text-left p-4 group flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <div className="mt-0.5 flex-shrink-0 space-y-1.5">
                {whoMeta && typeMeta ? (
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${whoMeta.bgClass} ${whoMeta.colorClass} ring-1 ${whoMeta.borderClass}`}
                    >
                      {whoMeta.short}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeMeta.bgClass} ${typeMeta.colorClass} ring-1 ${typeMeta.borderClass}`}
                    >
                      {typeMeta.label}
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground ring-1 ring-border">
                    General
                  </span>
                )}
                {cell && (
                  <p className="text-xs text-muted-foreground font-body italic">
                    {cell.scenario}
                  </p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                  {scenario.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(scenario.timestamp)}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {scenario.suggestions.length} insights
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-border/60 pt-3">
              {(() => {
                const { insights, microActions } = parseSuggestions(
                  scenario.suggestions,
                );
                return (
                  <>
                    <ul className="space-y-3">
                      {insights.map((s) => (
                        <li
                          key={s}
                          className="border-l-2 border-primary pl-4 py-1 bg-secondary/40 rounded-r-lg"
                        >
                          <span className="text-sm text-foreground leading-relaxed">
                            {s}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <MicroActionsBlock items={microActions} />
                  </>
                );
              })()}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
}

// ─── Chat History Item ─────────────────────────────────────────────────────────

function ChatHistoryItem({
  entry,
  index,
}: { entry: ChatEntry; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`chat.item.${index + 1}`}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-shadow duration-200">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full text-left p-4 group flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <div className="mt-1 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2 leading-relaxed font-medium">
                  {entry.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {entry.answer.length} insights
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-border/60 pt-3">
              {(() => {
                const { insights, microActions } = parseSuggestions(
                  entry.answer,
                );
                return (
                  <>
                    <ul className="space-y-3">
                      {insights.map((s) => (
                        <li
                          key={s}
                          className="border-l-2 border-primary pl-4 py-1 bg-secondary/40 rounded-r-lg"
                        >
                          <span className="text-sm text-foreground leading-relaxed">
                            {s}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <MicroActionsBlock items={microActions} />
                  </>
                );
              })()}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
}

// ─── Ask Coach Panel ───────────────────────────────────────────────────────────

const STARTER_PROMPTS = [
  "My manager keeps micromanaging me",
  "I'm not getting credit for my work",
  "I feel burned out and overwhelmed",
  "How do I ask for a raise?",
  "I'm struggling with work-life balance",
];

const MAX_CHAT_LENGTH = 600;

function AskCoachPanel() {
  const [question, setQuestion] = useState("");
  const [chatInsights, setChatInsights] = useState<string[] | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const { isAuthenticated } = useAuthState();
  const submitChat = useSubmitFreeChat();

  const charCount = question.length;
  const isOverLimit = charCount > MAX_CHAT_LENGTH;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to ask the coach.");
      return;
    }
    const trimmed = question.trim();
    if (!trimmed) {
      toast.error("Please type your question first.");
      return;
    }
    if (isOverLimit) {
      toast.error(
        `Please keep your question under ${MAX_CHAT_LENGTH} characters.`,
      );
      return;
    }
    try {
      const result = await submitChat.mutateAsync(trimmed);
      setChatInsights(result);
      setShowChatDialog(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* Starter prompts */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide mb-3">
            Quick-start prompts
          </p>
          <div className="flex flex-wrap gap-2" data-ocid="chat.panel">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuestion(prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-body bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-primary/40 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea + character counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground font-body">
              Your question
            </p>
            <span
              className={`text-xs font-body tabular-nums ${
                isOverLimit
                  ? "text-destructive font-semibold"
                  : charCount > MAX_CHAT_LENGTH * 0.85
                    ? "text-orange-500"
                    : "text-muted-foreground"
              }`}
            >
              {charCount} / {MAX_CHAT_LENGTH}
            </span>
          </div>
          <Textarea
            data-ocid="chat.textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='e.g. "How do I handle a colleague who keeps taking credit for my ideas?"'
            className="min-h-[140px] text-sm font-body resize-none bg-background/60 border-border/80 focus:border-primary focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          {isOverLimit && (
            <p
              className="text-xs text-destructive font-body"
              data-ocid="chat.error_state"
            >
              Question is too long. Please shorten it to {MAX_CHAT_LENGTH}{" "}
              characters or fewer.
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-body">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs">
              ⌘ Enter
            </kbd>{" "}
            to submit
          </p>
          <Button
            data-ocid="chat.submit_button"
            onClick={handleSubmit}
            disabled={submitChat.isPending || !question.trim() || isOverLimit}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-6 h-11 rounded-xl shadow-xs gap-2"
          >
            {submitChat.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Ask Coach
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Chat response dialog */}
      <AnimatePresence>
        {showChatDialog && (
          <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
            <DialogContent
              className="max-w-2xl font-body flex flex-col max-h-[85vh]"
              data-ocid="chat.dialog"
            >
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Your Coach's Perspective
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground font-body pt-1 line-clamp-2">
                    {question}
                  </p>
                </DialogHeader>

                {chatInsights && chatInsights.length > 0 ? (
                  <div className="space-y-4 py-2" data-ocid="chat.panel">
                    {(() => {
                      const { insights, microActions } =
                        parseSuggestions(chatInsights);
                      return (
                        <>
                          {insights.map((insight, i) => (
                            <motion.div
                              key={insight}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08, duration: 0.35 }}
                              data-ocid={`chat.item.${i + 1}`}
                              className="border-l-2 border-primary pl-4 py-2 bg-secondary/40 rounded-r-lg"
                            >
                              <p className="text-sm text-foreground leading-relaxed">
                                {insight}
                              </p>
                            </motion.div>
                          ))}
                          <MicroActionsBlock items={microActions} />
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div
                    data-ocid="chat.error_state"
                    className="py-8 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      No insights returned. Please try again.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  data-ocid="chat.close_button"
                  variant="outline"
                  onClick={() => setShowChatDialog(false)}
                  className="font-body"
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Authenticated App ─────────────────────────────────────────────────────────

type AppMode = "matrix" | "chat";

function AuthenticatedApp() {
  const [mode, setMode] = useState<AppMode>("matrix");
  const [selectedWho, setSelectedWho] = useState<MatrixWho | null>(null);
  const [selectedType, setSelectedType] = useState<MatrixType | null>(null);
  const [scenarioText, setScenarioText] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const { isAuthenticated } = useAuthState();
  const { data: profile } = useGetCallerUserProfile();
  const { data: recentSubmissions, isLoading: historyLoading } =
    useGetRecentSubmissions();
  const { data: recentChats, isLoading: chatsLoading } = useGetRecentChats();
  const submitMutation = useSubmitScenario();

  const history = recentSubmissions ?? [];
  const chatHistory = recentChats ?? [];
  const selectedCell =
    selectedWho && selectedType ? MATRIX[selectedWho][selectedType] : null;

  const handleReset = () => {
    setSelectedWho(null);
    setSelectedType(null);
    setScenarioText("");
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to submit a scenario.");
      return;
    }
    if (!selectedWho || !selectedType) {
      toast.error("Please complete both selection steps first.");
      return;
    }
    try {
      const result = await submitMutation.mutateAsync({
        text: scenarioText.trim(),
        who: selectedWho,
        challengeType: selectedType,
      });
      setSuggestions(result);
      setShowResultsDialog(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const isPending = submitMutation.isPending;
  const step = !selectedWho ? 1 : !selectedType ? 2 : 3;

  return (
    <>
      {/* Mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center mb-6"
      >
        <div className="inline-flex items-center bg-muted rounded-2xl p-1 gap-1">
          <button
            type="button"
            data-ocid="mode.tab"
            onClick={() => setMode("matrix")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "matrix"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="w-4 h-4" />
            Navigate Matrix
          </button>
          <button
            type="button"
            data-ocid="mode.tab"
            onClick={() => setMode("chat")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "chat"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Ask Coach
          </button>
        </div>
      </motion.div>

      {(profile?.role || profile?.industry) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex justify-center mb-4"
        >
          <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs rounded-full px-3 py-1 font-body font-medium ring-1 ring-primary/15">
            <Brain className="w-3 h-3" />
            Coaching personalised for:{" "}
            {[profile.role, profile.industry].filter(Boolean).join(" · ")}
          </span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {mode === "matrix" ? (
          <motion.div
            key="matrix"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step-based submission flow */}
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Navigate Your Situation
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          s < step
                            ? "bg-primary"
                            : s === step
                              ? "bg-primary/50"
                              : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {(selectedWho || selectedType || scenarioText) && (
                  <button
                    type="button"
                    data-ocid="scenario.secondary_button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Start over
                  </button>
                )}
              </div>

              {/* Step 1: WHO */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-1 font-body">
                  Step 1 — Who is the challenge with?
                </p>
                <p className="text-xs text-muted-foreground font-body mb-3">
                  Choose the primary relationship involved.
                </p>
                <div className="grid grid-cols-3 gap-3" data-ocid="who.select">
                  {WHO_OPTIONS.map((w) => {
                    const isSelected = selectedWho === w.value;
                    return (
                      <button
                        key={w.value}
                        type="button"
                        data-ocid="who.toggle"
                        onClick={() =>
                          setSelectedWho(isSelected ? null : w.value)
                        }
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-body text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isSelected
                            ? `${w.bgClass} ${w.borderClass} ${w.colorClass} shadow-md`
                            : "bg-background border-border hover:border-border/80 hover:bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <span
                          className={
                            isSelected ? w.colorClass : "text-muted-foreground"
                          }
                        >
                          {w.icon}
                        </span>
                        <span className="text-xs font-semibold leading-tight">
                          {w.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: WHAT TYPE */}
              <AnimatePresence>
                {selectedWho && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 overflow-hidden"
                  >
                    <p className="text-sm font-semibold text-foreground mb-1 font-body">
                      Step 2 — What type of challenge?
                    </p>
                    <p className="text-xs text-muted-foreground font-body mb-3">
                      Select the nature of the situation.
                    </p>
                    <div
                      className="grid grid-cols-3 gap-3"
                      data-ocid="type.select"
                    >
                      {TYPE_OPTIONS.map((t) => {
                        const isSelected = selectedType === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            data-ocid="type.toggle"
                            onClick={() =>
                              setSelectedType(isSelected ? null : t.value)
                            }
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-body text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isSelected
                                ? `${t.bgClass} ${t.borderClass} ${t.colorClass} shadow-md`
                                : "bg-background border-border hover:border-border/80 hover:bg-secondary/40 text-muted-foreground"
                            }`}
                          >
                            <span
                              className={
                                isSelected
                                  ? t.colorClass
                                  : "text-muted-foreground"
                              }
                            >
                              {t.icon}
                            </span>
                            <span className="text-xs font-semibold leading-tight">
                              {t.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: describe + submit */}
              <AnimatePresence>
                {selectedWho && selectedType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {selectedCell && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-5 rounded-xl bg-primary/8 border border-primary/20 p-4 flex items-start gap-3"
                        data-ocid="matrix.panel"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Compass className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide mb-0.5">
                            Your navigation path
                          </p>
                          <p className="font-display font-bold text-foreground text-base">
                            {selectedCell.scenario}
                          </p>
                          <p className="text-sm text-primary font-body mt-0.5">
                            → {selectedCell.action}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="mb-5">
                      <p className="text-sm font-semibold text-foreground mb-1 font-body">
                        Step 3 — Describe your situation{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground font-body mb-2">
                        The more detail you share, the more targeted your
                        guidance.
                      </p>
                      <Textarea
                        data-ocid="scenario.textarea"
                        value={scenarioText}
                        onChange={(e) => setScenarioText(e.target.value)}
                        placeholder={`e.g. "My manager keeps interrupting me in meetings and dismissing my ideas without explanation…"`}
                        className="min-h-[120px] text-sm font-body resize-none bg-background/60 border-border/80 focus:border-primary focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 leading-relaxed"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            handleSubmit();
                          }
                        }}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        data-ocid="scenario.submit_button"
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-6 h-11 rounded-xl shadow-xs gap-2"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing…
                          </>
                        ) : (
                          <>
                            Get Guidance
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Ask Your Coach
                  </h2>
                  <p className="text-xs text-muted-foreground font-body">
                    Ask any workplace question — no matrix required.
                  </p>
                </div>
              </div>
              <AskCoachPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History with tabs */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-foreground">
            Your History
          </h2>
          {(historyLoading || chatsLoading) && (
            <span className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading
            </span>
          )}
        </div>

        <Tabs defaultValue="scenarios">
          <TabsList className="mb-5 h-10" data-ocid="history.tab">
            <TabsTrigger
              value="scenarios"
              className="font-body text-sm"
              data-ocid="history.tab"
            >
              Scenarios
              {history.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {history.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="font-body text-sm"
              data-ocid="history.tab"
            >
              Chat History
              {chatHistory.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {chatHistory.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            {historyLoading ? (
              <div className="space-y-3" data-ocid="history.loading_state">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : history.length === 0 ? (
              <div
                data-ocid="history.empty_state"
                className="text-center py-16 border border-dashed border-border rounded-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  No scenarios submitted yet.
                </p>
                <p className="font-body text-xs text-muted-foreground/70 mt-1">
                  Use the matrix above to get your first guidance.
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="history.list">
                {history.slice(0, 20).map((scenario, i) => (
                  <HistoryItem
                    key={`${scenario.timestamp}-${i}`}
                    scenario={scenario}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats">
            {chatsLoading ? (
              <div className="space-y-3" data-ocid="chat.loading_state">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : chatHistory.length === 0 ? (
              <div
                data-ocid="chat.empty_state"
                className="text-center py-16 border border-dashed border-border rounded-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  No chat sessions yet.
                </p>
                <p className="font-body text-xs text-muted-foreground/70 mt-1">
                  Switch to "Ask Coach" above and ask your first question.
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="chat.list">
                {chatHistory.slice(0, 20).map((entry, i) => (
                  <ChatHistoryItem
                    key={`${entry.timestamp}-${i}`}
                    entry={entry}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Matrix Results Dialog */}
      <AnimatePresence>
        {showResultsDialog && (
          <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
            <DialogContent
              className="max-w-2xl font-body flex flex-col max-h-[85vh]"
              data-ocid="results.dialog"
            >
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Your Coach's Perspective
                  </DialogTitle>
                  {selectedCell && (
                    <p className="text-sm text-muted-foreground font-body pt-1">
                      {selectedCell.scenario} →{" "}
                      <span className="text-primary font-medium">
                        {selectedCell.action}
                      </span>
                    </p>
                  )}
                </DialogHeader>

                {suggestions && suggestions.length > 0 ? (
                  <div className="space-y-4 py-2" data-ocid="results.panel">
                    {(() => {
                      const { insights, microActions } =
                        parseSuggestions(suggestions);
                      return (
                        <>
                          {insights.map((suggestion, i) => (
                            <motion.div
                              key={suggestion}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08, duration: 0.35 }}
                              data-ocid={`results.item.${i + 1}`}
                              className="border-l-2 border-primary pl-4 py-2 bg-secondary/40 rounded-r-lg"
                            >
                              <p className="text-sm text-foreground leading-relaxed">
                                {suggestion}
                              </p>
                            </motion.div>
                          ))}
                          <MicroActionsBlock items={microActions} />
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div
                    data-ocid="results.error_state"
                    className="py-8 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      No insights returned. Please try submitting again.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  data-ocid="results.close_button"
                  variant="outline"
                  onClick={() => setShowResultsDialog(false)}
                  className="font-body"
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Landing Page (Unauthenticated) ───────────────────────────────────────────

function UnauthenticatedView({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center bg-background"
      data-ocid="auth.panel"
    >
      <section className="w-full bg-background py-10 px-4 flex flex-col items-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2 font-body">
          How Workplace Compass Works
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center mb-3">
          Navigate to a constructive response
        </h2>
        <p className="text-sm text-muted-foreground font-body text-center max-w-lg mb-8 leading-relaxed">
          Before sharing frustrations online, use this matrix to find a
          constructive path that leads to growth — not regret.
        </p>

        <div className="max-w-3xl w-full mb-10">
          <MatrixGrid />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide">
              Who:
            </span>
            {WHO_OPTIONS.map((w) => (
              <span
                key={w.value}
                className={`inline-flex items-center gap-1.5 text-xs font-medium font-body px-2.5 py-1 rounded-full ${w.bgClass} ${w.colorClass}`}
              >
                {(() => {
                  const icons: Record<string, React.ReactNode> = {
                    [MatrixWho.leaderManager]: <User className="w-3 h-3" />,
                    [MatrixWho.peerTeam]: <Users className="w-3 h-3" />,
                    [MatrixWho.systemOrg]: <Building2 className="w-3 h-3" />,
                  };
                  return icons[w.value];
                })()}
                {w.label}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-md border border-border">
          <img
            src="/assets/uploads/workplace-compass-1-1.png"
            alt="Workplace Compass infographic"
            className="w-full h-auto block"
          />
        </div>
      </section>

      <div className="bg-card rounded-2xl border border-border shadow-elevated p-10 max-w-md w-full text-center mt-6 mb-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          Your Private Workspace
        </h2>
        <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
          Sign in to use the matrix, describe your scenario, and receive
          personalised coaching guidance — saved privately, only visible to you.
        </p>

        <div className="space-y-3 mb-8">
          {[
            {
              icon: <KeyRound className="w-4 h-4 text-primary" />,
              text: "Private history visible only to you",
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-primary" />,
              text: "Secure Internet Identity login",
            },
            {
              icon: <Clock className="w-4 h-4 text-primary" />,
              text: "Scenarios saved permanently on-chain",
            },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 text-sm text-foreground/80 font-body"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              {text}
            </div>
          ))}
        </div>

        <Button
          data-ocid="auth.primary_button"
          onClick={onLogin}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold h-11 rounded-xl gap-2"
        >
          <KeyRound className="w-4 h-4" />
          Sign In to Get Started
        </Button>
        <p className="text-xs text-muted-foreground mt-3 font-body">
          No password needed — uses Internet Identity.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Set Profile Dialog ────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  "Individual Contributor",
  "Team Lead",
  "Manager",
  "Senior Manager / Director",
  "VP / C-Suite",
  "Founder / Entrepreneur",
  "HR / People Ops",
  "Consultant / Freelancer",
  "Student / Early Career",
];

const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1–3 years",
  "3–7 years",
  "7–15 years",
  "15+ years",
];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Retail & E-commerce",
  "Media & Creative",
  "Legal & Compliance",
  "Government & Public Sector",
  "Non-profit",
  "Manufacturing & Logistics",
  "Other",
];

function SetProfileDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile:
    | {
        name?: string;
        role?: string | null;
        experienceLevel?: string | null;
        industry?: string | null;
      }
    | null
    | undefined;
}) {
  const [nameInput, setNameInput] = useState(profile?.name ?? "");
  const [role, setRole] = useState(profile?.role ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    profile?.experienceLevel ?? "",
  );
  const [industry, setIndustry] = useState(profile?.industry ?? "");
  const saveMutation = useSaveCallerUserProfile();

  useEffect(() => {
    if (open) {
      setNameInput(profile?.name ?? "");
      setRole(profile?.role ?? "");
      setExperienceLevel(profile?.experienceLevel ?? "");
      setIndustry(profile?.industry ?? "");
    }
  }, [open, profile]);

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Please enter a display name.");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        name: trimmed,
        role: role || null,
        experienceLevel: experienceLevel || null,
        industry: industry || null,
      });
      toast.success("Profile saved!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md font-body"
        data-ocid="setprofile.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Your Profile
          </DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground">
            These details help personalise your coaching guidance. Role,
            experience, and industry are optional.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="display-name"
              className="text-sm font-medium font-body"
            >
              Display name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="display-name"
              data-ocid="setprofile.input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="font-body"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium font-body">
              Role{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger
                data-ocid="setprofile.select"
                className="font-body"
              >
                <SelectValue placeholder="Select your role…" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="font-body">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium font-body">
              Experience level{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger
                data-ocid="setprofile.select"
                className="font-body"
              >
                <SelectValue placeholder="Select experience level…" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((e) => (
                  <SelectItem key={e} value={e} className="font-body">
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium font-body">
              Industry{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger
                data-ocid="setprofile.select"
                className="font-body"
              >
                <SelectValue placeholder="Select your industry…" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((i) => (
                  <SelectItem key={i} value={i} className="font-body">
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            data-ocid="setprofile.cancel_button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-body"
          >
            Cancel
          </Button>
          <Button
            data-ocid="setprofile.save_button"
            onClick={handleSave}
            disabled={saveMutation.isPending || !nameInput.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold gap-2"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main App Shell ────────────────────────────────────────────────────────────

function MainApp() {
  const { isAuthenticated, authLoading } = useAuthState();
  const { login, logout } = useAuthActions();
  const { identity } = useInternetIdentity();
  const [showSetProfileDialog, setShowSetProfileDialog] = useState(false);
  const nudgeShownRef = useRef(false);

  const { data: profile, isSuccess: profileLoaded } = useGetCallerUserProfile();
  const userName = profile?.name ?? "";

  useEffect(() => {
    if (
      isAuthenticated &&
      profileLoaded &&
      !userName &&
      !nudgeShownRef.current
    ) {
      nudgeShownRef.current = true;
      toast("👋 Complete your profile for personalised coaching!", {
        action: {
          label: "Set Up Profile",
          onClick: () => setShowSetProfileDialog(true),
        },
        duration: 6000,
      });
    }
  }, [isAuthenticated, profileLoaded, userName]);

  const displayLabel = userName
    ? `Hi, ${userName}`
    : identity
      ? "Set name"
      : "";

  return (
    <div className="min-h-screen bg-background mesh-bg">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Compass className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              Workplace Compass
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground font-body">
              Turn workplace challenges into clear next steps
            </span>

            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      data-ocid="auth.toggle"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary transition-colors font-body text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline max-w-[160px] truncate">
                        {displayLabel}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    data-ocid="auth.dropdown_menu"
                  >
                    <DropdownMenuItem
                      data-ocid="auth.edit_button"
                      onClick={() => setShowSetProfileDialog(true)}
                      className="gap-2 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                      {userName ? "Edit Profile" : "Set Up Profile"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      data-ocid="auth.delete_button"
                      onClick={logout}
                      className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <SetProfileDialog
                  open={showSetProfileDialog}
                  onOpenChange={setShowSetProfileDialog}
                  profile={profile}
                />
              </>
            ) : (
              <Button
                data-ocid="auth.primary_button"
                onClick={login}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold rounded-xl gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium font-body mb-4 ring-1 ring-primary/20">
            <Lightbulb className="w-3.5 h-3.5" />
            Structured workplace navigation
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight mb-4">
            Navigate any{" "}
            <span className="text-primary">workplace situation</span>
            <br />
            with confidence
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
            Use the 2-axis matrix to pinpoint your challenge, or ask the coach
            directly — receive deep, personalised guidance from a world-class
            advisor.
          </p>
        </motion.div>

        {/* Auth-gated content */}
        <AnimatePresence mode="wait">
          {authLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              data-ocid="auth.loading_state"
            >
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </motion.div>
          ) : isAuthenticated ? (
            <motion.div
              key="authenticated"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <AuthenticatedApp />
            </motion.div>
          ) : (
            <motion.div
              key="unauthenticated"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <UnauthenticatedView onLogin={login} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-20 py-8 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground font-body">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-red-400">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return <MainApp />;
}
