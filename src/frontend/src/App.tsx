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
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  KeyRound,
  Layers,
  Lightbulb,
  Loader2,
  LogOut,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Scenario } from "./backend.d";
import { useAuthActions, useAuthState } from "./hooks/useAuthState";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  Category,
  useGetCallerUserProfile,
  useGetRecentSubmissions,
  useSaveCallerUserProfile,
  useSubmitScenario,
} from "./hooks/useQueries";

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

function UnauthenticatedView({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center bg-background"
      data-ocid="auth.panel"
    >
      {/* Infographic section */}
      <section className="w-full bg-background py-10 px-4 flex flex-col items-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5 font-body">
          How Workplace Compass works
        </p>
        <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-md border border-border">
          <img
            src="/assets/uploads/workplace-compass-1.png"
            alt="How Workplace Compass works"
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
          Sign in to submit scenarios and access your personal, private history
          of workplace challenges and actionable advice — visible only to you.
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

function AuthenticatedApp() {
  const [scenarioText, setScenarioText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const { isAuthenticated } = useAuthState();
  const { data: recentSubmissions, isLoading: historyLoading } =
    useGetRecentSubmissions();
  const submitMutation = useSubmitScenario();

  const history = recentSubmissions ?? [];

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to submit a scenario.");
      return;
    }
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
      // Set suggestions FIRST so they are available the moment the dialog opens
      setSuggestions(result);
      setShowResultsDialog(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const isPending = submitMutation.isPending;

  return (
    <>
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

              {suggestions && suggestions.length > 0 ? (
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
                    No suggestions returned. Please try submitting again.
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
    </>
  );
}

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

  // Sync input when dialog opens with latest name
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

function MainApp() {
  const { isAuthenticated, authLoading } = useAuthState();
  const { login, logout } = useAuthActions();
  const { identity } = useInternetIdentity();
  const [showSetNameDialog, setShowSetNameDialog] = useState(false);
  const nudgeShownRef = useRef(false);

  const { data: profile, isSuccess: profileLoaded } = useGetCallerUserProfile();
  const userName = profile?.name ?? "";

  // One-time nudge to set name when user logs in and has no name
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
