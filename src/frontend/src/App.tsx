import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
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
  MatrixType,
  MatrixWho,
  useGetCallerUserProfile,
  useGetRecentSubmissions,
  useSaveCallerUserProfile,
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

// ─── Matrix Grid (shared between landing page and authenticated flow) ─────────

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
        {/* Column headers row */}
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

        {/* Rows */}
        {TYPE_OPTIONS.map((t) => (
          <div
            key={t.value}
            className="grid grid-cols-[140px_1fr_1fr_1fr] gap-1.5 mb-1.5"
          >
            {/* Row header */}
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

            {/* Cells */}
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
              <ul className="space-y-3">
                {scenario.suggestions.map((s) => (
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
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
}

// ─── Authenticated App ─────────────────────────────────────────────────────────

function AuthenticatedApp() {
  const [selectedWho, setSelectedWho] = useState<MatrixWho | null>(null);
  const [selectedType, setSelectedType] = useState<MatrixType | null>(null);
  const [scenarioText, setScenarioText] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const { isAuthenticated } = useAuthState();
  const { data: recentSubmissions, isLoading: historyLoading } =
    useGetRecentSubmissions();
  const submitMutation = useSubmitScenario();

  const history = recentSubmissions ?? [];
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
      {/* Step-based submission flow */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8"
      >
        {/* Header row with step indicator + reset */}
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
                  data-ocid={"who.toggle"}
                  onClick={() => setSelectedWho(isSelected ? null : w.value)}
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
              <div className="grid grid-cols-3 gap-3" data-ocid="type.select">
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
                          isSelected ? t.colorClass : "text-muted-foreground"
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

        {/* Matrix highlight + describe + submit */}
        <AnimatePresence>
          {selectedWho && selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Cell highlight */}
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

              {/* Textarea */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-foreground mb-1 font-body">
                  Step 3 — Describe your situation{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </p>
                <p className="text-xs text-muted-foreground font-body mb-2">
                  The more detail you share, the more targeted your guidance.
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

              {/* Submit */}
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
      </motion.div>

      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-foreground">
            Your Scenarios
          </h2>
          {historyLoading && (
            <span className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading
            </span>
          )}
        </div>

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
              Complete the steps above and get your first guidance.
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
      </section>

      {/* Results Dialog */}
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
                    {suggestions.map((suggestion, i) => (
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
      {/* How it works — interactive matrix section */}
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

        {/* Interactive 3×3 matrix */}
        <div className="max-w-3xl w-full mb-10">
          <MatrixGrid />
        </div>

        {/* Legend */}
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
                {w.icon &&
                  // clone with smaller size
                  (() => {
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

        {/* Infographic image below */}
        <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-md border border-border">
          <img
            src="/assets/uploads/workplace-compass-1-1.png"
            alt="Workplace Compass infographic"
            className="w-full h-auto block"
          />
        </div>
      </section>

      {/* Auth card */}
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

// ─── Set Name Dialog ───────────────────────────────────────────────────────────

function SetNameDialog({
  open,
  onOpenChange,
  currentName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
}) {
  const [nameInput, setNameInput] = useState(currentName);
  const saveMutation = useSaveCallerUserProfile();

  useEffect(() => {
    if (open) setNameInput(currentName);
  }, [open, currentName]);

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Please enter a name.");
      return;
    }
    try {
      await saveMutation.mutateAsync({ name: trimmed });
      toast.success("Name saved!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save name. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm font-body" data-ocid="setname.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {currentName ? "Edit Your Name" : "Set Your Name"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <Label
            htmlFor="display-name"
            className="text-sm font-medium font-body"
          >
            Display name
          </Label>
          <Input
            id="display-name"
            data-ocid="setname.input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Alex Johnson"
            className="font-body"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            autoFocus
          />
          <p className="text-xs text-muted-foreground font-body">
            This name will appear in the header to greet you.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            data-ocid="setname.cancel_button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-body"
          >
            Cancel
          </Button>
          <Button
            data-ocid="setname.save_button"
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
              "Save"
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
  const [showSetNameDialog, setShowSetNameDialog] = useState(false);
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
      toast("👋 Add your name so we can greet you personally!", {
        action: {
          label: "Set name",
          onClick: () => setShowSetNameDialog(true),
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
                      onClick={() => setShowSetNameDialog(true)}
                      className="gap-2 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                      {userName ? "Edit Name" : "Set Name"}
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

                <SetNameDialog
                  open={showSetNameDialog}
                  onOpenChange={setShowSetNameDialog}
                  currentName={userName}
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
            Use the 2-axis matrix to pinpoint your challenge, then receive deep,
            personalised coaching guidance from a world-class coach.
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
