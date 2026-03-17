import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Layers,
  Lightbulb,
  Loader2,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Scenario } from "./backend.d";
import {
  Category,
  useGetRecentSubmissions,
  useSubmitScenario,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

const CATEGORIES: {
  value: Category;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: Category.conflict,
    label: "Conflict",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "bg-red-50 text-red-700 ring-red-200",
  },
  {
    value: Category.communication,
    label: "Communication",
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  {
    value: Category.escalation,
    label: "Escalation",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    color: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  {
    value: Category.workload,
    label: "Workload",
    icon: <Layers className="w-3.5 h-3.5" />,
    color: "bg-teal-50 text-teal-700 ring-teal-200",
  },
  {
    value: Category.feedback,
    label: "Feedback",
    icon: <Star className="w-3.5 h-3.5" />,
    color: "bg-purple-50 text-purple-700 ring-purple-200",
  },
  {
    value: Category.general,
    label: "General",
    icon: <Users className="w-3.5 h-3.5" />,
    color: "bg-slate-50 text-slate-700 ring-slate-200",
  },
];

function getCategoryMeta(category?: Category) {
  return (
    CATEGORIES.find((c) => c.value === category) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}

function formatRelativeTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const sampleHistory: Scenario[] = [
  {
    text: "My manager keeps assigning me tasks that weren't in my original job description, and I'm struggling to keep up with my core responsibilities.",
    suggestions: [
      "Schedule a 1:1 with your manager to discuss your current workload and capacity.",
      "Document all tasks assigned to you over the past month with time estimates.",
      "Propose a priority matrix to clarify which tasks should take precedence.",
      "Ask HR about your official job description and how it aligns with current expectations.",
    ],
    timestamp: BigInt(Date.now() - 2 * 3600 * 1000) * 1_000_000n,
    category: Category.workload,
  },
  {
    text: "A colleague takes credit for my ideas during team meetings and my contributions go unrecognized.",
    suggestions: [
      "Start documenting your ideas with timestamps via email or project management tools before meetings.",
      "Speak up confidently during meetings by clearly labeling your contributions: 'Building on the idea I shared last week…'",
      "Have a direct, private conversation with the colleague about this pattern.",
    ],
    timestamp: BigInt(Date.now() - 24 * 3600 * 1000) * 1_000_000n,
    category: Category.conflict,
  },
  {
    text: "I need to deliver difficult feedback to a team member who is underperforming but I don't want to damage our working relationship.",
    suggestions: [
      "Use the SBI model: Situation, Behavior, Impact — keep it specific and observable.",
      "Frame the conversation around growth and support, not judgment.",
      "Prepare concrete examples and a development plan before the meeting.",
      "Follow up in writing to confirm next steps and show you're invested in their success.",
    ],
    timestamp: BigInt(Date.now() - 3 * 24 * 3600 * 1000) * 1_000_000n,
    category: Category.feedback,
  },
];

function HistoryItem({
  scenario,
  index,
}: { scenario: Scenario; index: number }) {
  const [open, setOpen] = useState(false);
  const meta = getCategoryMeta(scenario.category);

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
              <div className="mt-0.5 flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${meta.color}`}
                >
                  {meta.icon}
                  {meta.label}
                </span>
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
                    {scenario.suggestions.length} suggestions
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
            <div className="px-4 pb-4 border-t border-border/60 pt-3 ml-0">
              <ul className="space-y-2">
                {scenario.suggestions.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2.5 text-sm text-foreground/85"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{s}</span>
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

function MainApp() {
  const [scenarioText, setScenarioText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const { data: recentSubmissions, isLoading: historyLoading } =
    useGetRecentSubmissions();
  const submitMutation = useSubmitScenario();

  const history =
    recentSubmissions && recentSubmissions.length > 0
      ? recentSubmissions
      : sampleHistory;

  const handleSubmit = async () => {
    const text = scenarioText.trim();
    if (!text) {
      toast.error("Please describe your situation before submitting.");
      return;
    }
    try {
      const result = await submitMutation.mutateAsync({
        text,
        category: selectedCategory,
      });
      setSuggestions(result);
      setShowResultsDialog(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const isPending = submitMutation.isPending;

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
              Office Navigator
            </span>
          </div>
          <span className="hidden sm:block text-sm text-muted-foreground font-body">
            Turn workplace challenges into clear next steps
          </span>
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
            AI-powered workplace guidance
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight mb-4">
            Navigate any{" "}
            <span className="text-primary">workplace situation</span>
            <br />
            with confidence
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
            Describe your office challenge and receive tailored, actionable
            suggestions to help you respond with clarity and professionalism.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8"
        >
          <div className="mb-5">
            <p className="block text-sm font-semibold text-foreground mb-1.5 font-body">
              Your situation
            </p>
            <Textarea
              id="scenario-textarea"
              data-ocid="scenario.textarea"
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder="Describe your office situation or challenge… e.g. 'My manager keeps interrupting me in team meetings and dismissing my ideas without explanation.'"
              className="min-h-[140px] text-base font-body resize-none bg-background/60 border-border/80 focus:border-primary focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1.5 font-body">
              Tip: More detail = better suggestions. Press ⌘↵ to submit.
            </p>
          </div>

          {/* Category Selector */}
          <div className="mb-6" data-ocid="scenario.select">
            <p className="text-sm font-semibold text-foreground mb-2.5 font-body">
              Category{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.value ? null : cat.value,
                    )
                  }
                  className={`category-pill ring-1 font-body text-xs ${
                    selectedCategory === cat.value
                      ? `${cat.color} ring-2`
                      : "bg-secondary text-secondary-foreground ring-border/60 hover:ring-border"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-body">
              {scenarioText.length > 0 && `${scenarioText.length} characters`}
            </span>
            <Button
              data-ocid="scenario.submit_button"
              onClick={handleSubmit}
              disabled={isPending || !scenarioText.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-6 h-11 rounded-xl shadow-xs gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  Get Suggestions
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Recent History */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-foreground">
              Recent Scenarios
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
                Your submissions will appear here.
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-20 py-8">
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

      {/* Results Dialog */}
      <AnimatePresence>
        {showResultsDialog && (
          <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
            <DialogContent
              className="max-w-lg font-body"
              data-ocid="results.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Your Action Plan
                </DialogTitle>
              </DialogHeader>

              {isPending ? (
                <div
                  className="space-y-3 py-4"
                  data-ocid="results.loading_state"
                >
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : suggestions && suggestions.length > 0 ? (
                <div className="space-y-3 py-2" data-ocid="results.panel">
                  {suggestions.map((suggestion, i) => (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35 }}
                      data-ocid={`results.item.${i + 1}`}
                      className="suggestion-card bg-secondary/60 rounded-xl pl-5 pr-4 py-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary font-body">
                            {i + 1}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div
                  data-ocid="results.error_state"
                  className="py-8 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    No suggestions were returned. Please try again.
                  </p>
                </div>
              )}

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

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}
