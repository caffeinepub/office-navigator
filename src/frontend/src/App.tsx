import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  Download,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  KeyRound,
  Lightbulb,
  Loader2,
  LogOut,
  MessageCircle,
  MessageSquare,
  Mic,
  Pencil,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Square,
  Star,
  Swords,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  Users,
  Volume2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Scenario } from "./backend.d";
import { DisclaimerModal } from "./components/DisclaimerModal";
import { GrowthPathSection } from "./components/GrowthPathSection";
import { VoiceDictationButton } from "./components/VoiceDictationButton";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useAuthActions, useAuthState } from "./hooks/useAuthState";
import { useBookmarks } from "./hooks/useBookmarks";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useJournal } from "./hooks/useJournal";
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

// ─── Inline Coaching Disclaimer ──────────────────────────────────────────────
function CoachingDisclaimer() {
  return (
    <p className="text-xs text-muted-foreground italic mt-2 pt-2 border-t border-border/40 font-body">
      Suggestions are for informational purposes only and at your sole
      discretion. Workplace Compass accepts no liability for outcomes.
    </p>
  );
}

// ─── Feedback Form Dialog (Formspree) ─────────────────────────────────────────

function FeedbackFormDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        "https://formspree.io/raviteja_joshi@outlook.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name, email, message, _replyto: email }),
        },
      );
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
        toast.success("Feedback sent! Thank you.");
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
        }, 2000);
      } else {
        toast.error("Failed to send feedback. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 font-body text-xs"
        data-ocid="feedback_form.trigger"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Feedback</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Share Your Feedback
            </DialogTitle>
            <DialogDescription className="font-body text-sm">
              Help us improve Workplace Compass — your feedback goes directly to
              the team.
            </DialogDescription>
          </DialogHeader>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="font-body text-sm font-medium">
                Thank you! Your feedback has been received.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fb-name" className="font-body text-sm">
                  Name (optional)
                </Label>
                <Input
                  id="fb-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-email" className="font-body text-sm">
                  Email (optional)
                </Label>
                <Input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-message" className="font-body text-sm">
                  Feedback <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's working well? What could be better?"
                  rows={4}
                  className="font-body resize-none"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="font-body"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="font-body"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Feedback"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Feedback Widget ───────────────────────────────────────────────────────────

function FeedbackWidget({ feedbackKey }: { feedbackKey: string }) {
  const storageKey = `feedback_${feedbackKey}`;
  const [rating, setRating] = useState<"helpful" | "not_helpful" | null>(
    () => localStorage.getItem(storageKey) as "helpful" | "not_helpful" | null,
  );

  const handleRate = (value: "helpful" | "not_helpful") => {
    localStorage.setItem(storageKey, value);
    setRating(value);
    toast.success(
      value === "helpful"
        ? "Great! Glad it helped."
        : "Thanks for the feedback.",
    );
  };

  if (rating) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground pt-1"
        data-ocid="feedback.success_state"
      >
        <span>
          {rating === "helpful" ? "👍" : "👎"}{" "}
          {rating === "helpful" ? "Helpful" : "Not helpful"} — thanks for your
          feedback!
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 pt-1" data-ocid="feedback.panel">
      <span className="text-sm text-muted-foreground font-body">
        Was this helpful?
      </span>
      <Button
        variant="outline"
        size="sm"
        data-ocid="feedback.button"
        onClick={() => handleRate("helpful")}
        className="h-8 px-3 text-xs font-body"
      >
        👍 Yes
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-ocid="feedback.secondary_button"
        onClick={() => handleRate("not_helpful")}
        className="h-8 px-3 text-xs font-body"
      >
        👎 No
      </Button>
    </div>
  );
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

// ─── Audio Playback Bar ────────────────────────────────────────────────────────

const SAFETY_PREFIX =
  "[SAFETY: Respond only with positive, forward-looking, strengths-based coaching. Never suggest harmful actions, negative thoughts, or anything that could damage mental health or career reputation.] ";

const TONE_PREFIXES: Record<string, string> = {
  Mentor: "[TONE: Mentor - warm, nurturing, growth-focused coach] ",
  Strategist:
    "[TONE: Strategist - analytical, structured, outcome-focused coach] ",
  Motivator: "[TONE: Motivator - energetic, positive, champion-style coach] ",
  "Straight-Talker":
    "[TONE: Straight-Talker - direct, no-nonsense, honest coach] ",
};

function buildPrompt(text: string, tone: string): string {
  return SAFETY_PREFIX + (TONE_PREFIXES[tone] ?? "") + text;
}

function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  gender: "male" | "female",
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const malePref = [
    "Alex",
    "Daniel",
    "Google UK English Male",
    "Google US English",
  ];
  const femalePref = [
    "Samantha",
    "Karen",
    "Google UK English Female",
    "Victoria",
  ];
  if (gender === "female") {
    const byName = voices.find((v) =>
      femalePref.some((p) => v.name.includes(p)),
    );
    if (byName) return byName;
    const byLabel = voices.find((v) => v.name.toLowerCase().includes("female"));
    if (byLabel) return byLabel;
    return voices[1] ?? voices[0];
  }
  const byName = voices.find((v) => malePref.some((p) => v.name.includes(p)));
  if (byName) return byName;
  const byLabel = voices.find((v) => v.name.toLowerCase().includes("male"));
  if (byLabel) return byLabel;
  return voices[0];
}

function AudioPlaybackBar({
  insights,
  microActions,
}: { insights: string[]; microActions: string[] }) {
  const [voicePref, setVoicePref] = useState<"male" | "female">(() => {
    const stored = localStorage.getItem("wc_voice_pref");
    return stored === "female" ? "female" : "male";
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const voices = useVoices();

  const fullText = [
    ...insights,
    ...(microActions.length > 0
      ? ["Here are some actions to try today:", ...microActions]
      : []),
  ].join(". ");

  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    if (!fullText.trim()) return;
    const utter = new SpeechSynthesisUtterance(fullText);
    const voice = pickVoice(voices, voicePref);
    if (voice) utter.voice = voice;
    utter.rate = 0.95;
    utter.pitch = voicePref === "female" ? 1.1 : 0.9;
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utter);
  };

  const handleVoiceChange = (v: "male" | "female") => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    setVoicePref(v);
    localStorage.setItem("wc_voice_pref", v);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-muted/60 border border-border/50"
      data-ocid="audio.panel"
    >
      <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground font-body font-medium">
        Listen:
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          data-ocid="audio.toggle"
          onClick={() => handleVoiceChange("male")}
          className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold transition-all ${voicePref === "male" ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground hover:text-foreground"}`}
        >
          ♂ Male
        </button>
        <button
          type="button"
          data-ocid="audio.toggle"
          onClick={() => handleVoiceChange("female")}
          className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold transition-all ${voicePref === "female" ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground hover:text-foreground"}`}
        >
          ♀ Female
        </button>
      </div>
      <button
        type="button"
        data-ocid="audio.button"
        onClick={handlePlay}
        className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all ${isPlaying ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"}`}
      >
        {isPlaying ? (
          <>
            <Square className="w-3 h-3" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-3 h-3" />
            Play
          </>
        )}
      </button>
      {isPlaying && (
        <span className="text-xs text-primary font-body animate-pulse">
          Playing…
        </span>
      )}
    </div>
  );
}

// ─── Tone Selector Bar ─────────────────────────────────────────────────────────

const COACHING_TONES = [
  "Mentor",
  "Strategist",
  "Motivator",
  "Straight-Talker",
] as const;
type CoachingTone = (typeof COACHING_TONES)[number];

function ToneSelectorBar({
  value,
  onChange,
}: { value: CoachingTone; onChange: (t: CoachingTone) => void }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50"
      data-ocid="tone.panel"
    >
      <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide flex-shrink-0">
        Coaching tone:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {COACHING_TONES.map((tone) => (
          <button
            key={tone}
            type="button"
            data-ocid="tone.toggle"
            onClick={() => onChange(tone)}
            className={`px-3 py-1 rounded-full text-xs font-body font-semibold transition-all ${
              value === tone
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Bookmark Button ───────────────────────────────────────────────────────────

function BookmarkButton({
  source,
  insight,
  bookmarks,
  toggleBookmark,
}: {
  source: string;
  insight: string;
  bookmarks: import("./hooks/useBookmarks").Bookmark[];
  toggleBookmark: (source: string, insight: string) => void;
}) {
  const bookmarked = bookmarks.some(
    (b) => b.source === source && b.insight === insight,
  );
  return (
    <button
      type="button"
      onClick={() => {
        toggleBookmark(source, insight);
        toast.success(bookmarked ? "Bookmark removed." : "Insight saved!");
      }}
      className={`flex-shrink-0 p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        bookmarked
          ? "text-amber-500 hover:text-amber-600"
          : "text-muted-foreground hover:text-foreground"
      }`}
      title={bookmarked ? "Remove bookmark" : "Bookmark this insight"}
      data-ocid="bookmark.toggle"
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </button>
  );
}

// ─── Export Card Modal ─────────────────────────────────────────────────────────

function ExportCardModal({
  open,
  onOpenChange,
  source,
  insights,
  microActions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  source: string;
  insights: string[];
  microActions: string[];
}) {
  const handleCopyText = async () => {
    const lines = [
      "═══════════════════════════════════",
      "  WORKPLACE COMPASS — COACHING CARD",
      "═══════════════════════════════════",
      "",
      `📍 ${source}`,
      "",
      "INSIGHTS",
      ...insights.map((s, i) => `${i + 1}. ${s}`),
    ];
    if (microActions.length > 0) {
      lines.push(
        "",
        "✅ TRY THIS TODAY",
        ...microActions.map((a, i) => `${i + 1}. ${a}`),
      );
    }
    lines.push("", "— Workplace Compass (workplacecompass.ai)");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Could not copy. Please try manually.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg font-body" data-ocid="export.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Coaching Card
          </DialogTitle>
          <DialogDescription className="font-body text-sm">
            Save or share your personalised coaching insights.
          </DialogDescription>
        </DialogHeader>

        {/* Preview card */}
        <div
          className="coaching-card-print rounded-2xl bg-foreground text-background p-6 space-y-4 mt-2"
          id="coaching-card-preview"
        >
          <div className="flex items-center gap-2 border-b border-background/20 pb-3">
            <Compass className="w-4 h-4 text-primary-foreground/70" />
            <span className="font-display font-bold text-sm tracking-wide text-background/90">
              WORKPLACE COMPASS
            </span>
          </div>
          <p className="text-xs text-background/60 font-body line-clamp-2 italic">
            {source}
          </p>
          <ul className="space-y-2">
            {insights.map((insight) => (
              <li key={insight} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-xs text-background/90 leading-relaxed font-body">
                  {insight}
                </span>
              </li>
            ))}
          </ul>
          {microActions.length > 0 && (
            <div className="border-t border-background/20 pt-3">
              <p className="text-xs font-semibold text-background/70 mb-2 uppercase tracking-wide font-body">
                ✅ Try This Today
              </p>
              <ul className="space-y-1.5">
                {microActions.map((action, i) => (
                  <li key={action} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xs text-background/80 leading-relaxed font-body">
                      {action}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            data-ocid="export.cancel_button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-body"
          >
            Close
          </Button>
          <Button
            data-ocid="export.secondary_button"
            variant="outline"
            onClick={handleCopyText}
            className="font-body gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy as Text
          </Button>
          <Button
            data-ocid="export.primary_button"
            onClick={handlePrint}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Saved (Bookmarks) Tab ─────────────────────────────────────────────────────

function SavedTab() {
  const { bookmarks, removeBookmark } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div
        data-ocid="saved.empty_state"
        className="text-center py-16 border border-dashed border-border rounded-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Bookmark className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="font-body text-sm text-muted-foreground">
          No saved insights yet.
        </p>
        <p className="font-body text-xs text-muted-foreground/70 mt-1">
          Bookmark insights from your coaching sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="saved.list">
      {bookmarks.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          data-ocid={`saved.item.${i + 1}`}
          className="bg-card rounded-xl border border-border p-4 flex items-start gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="border-l-2 border-amber-400 pl-3 py-1 bg-amber-50/50 rounded-r-lg">
              <p className="text-sm text-foreground leading-relaxed">
                {b.insight}
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-2 truncate">
              {b.source} ·{" "}
              {new Date(b.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            type="button"
            data-ocid={`saved.delete_button.${i + 1}`}
            onClick={() => {
              removeBookmark(b.id);
              toast.success("Bookmark removed.");
            }}
            className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Remove bookmark"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Journal Tab ───────────────────────────────────────────────────────────────

function JournalTab() {
  const { entries, addEntry, deleteEntry } = useJournal();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your entry.");
      return;
    }
    if (!body.trim()) {
      toast.error("Please write something before saving.");
      return;
    }
    addEntry(title.trim(), body.trim());
    setTitle("");
    setBody("");
    toast.success("Journal entry saved.");
  };

  return (
    <div className="space-y-6">
      {/* New entry form */}
      <div
        className="bg-card rounded-xl border border-border p-5 space-y-4"
        data-ocid="journal.panel"
      >
        <p className="text-sm font-semibold text-foreground font-body flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          New Journal Entry
        </p>
        <Input
          data-ocid="journal.input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title…"
          className="font-body"
        />
        <Textarea
          data-ocid="journal.textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Reflect on a workplace situation, what you learned, or how you grew…"
          className="min-h-[120px] text-sm font-body resize-none"
        />
        <div className="flex justify-end">
          <Button
            data-ocid="journal.submit_button"
            onClick={handleSave}
            disabled={!title.trim() || !body.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold gap-2"
          >
            Save Entry
          </Button>
        </div>
      </div>

      {/* Entry list */}
      {entries.length === 0 ? (
        <div
          data-ocid="journal.empty_state"
          className="text-center py-16 border border-dashed border-border rounded-2xl"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            Your private space to reflect.
          </p>
          <p className="font-body text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">
            Track workplace situations and your personal growth over time.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="journal.list">
          {entries.map((entry, i) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              index={i}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              deleteEntry={deleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JournalEntryCard({
  entry,
  index,
  confirmDeleteId,
  setConfirmDeleteId,
  deleteEntry,
}: {
  entry: { id: string; title: string; body: string; timestamp: number };
  index: number;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  deleteEntry: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isConfirming = confirmDeleteId === entry.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      data-ocid={`journal.item.${index + 1}`}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="bg-card rounded-xl border border-border hover:shadow-sm transition-shadow">
          <div className="p-4 flex items-start gap-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              >
                <p className="font-semibold text-sm text-foreground font-body">
                  {entry.title}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {new Date(entry.timestamp).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {!open && (
                  <p className="text-xs text-muted-foreground font-body mt-1.5 line-clamp-2">
                    {entry.body.slice(0, 100)}
                    {entry.body.length > 100 ? "…" : ""}
                  </p>
                )}
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isConfirming ? (
                <>
                  <button
                    type="button"
                    data-ocid={`journal.confirm_button.${index + 1}`}
                    onClick={() => {
                      deleteEntry(entry.id);
                      setConfirmDeleteId(null);
                      toast.success("Entry deleted.");
                    }}
                    className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    data-ocid={`journal.cancel_button.${index + 1}`}
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 font-body"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  data-ocid={`journal.delete_button.${index + 1}`}
                  onClick={() => setConfirmDeleteId(entry.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-border/60 pt-3">
              <p className="text-sm text-foreground leading-relaxed font-body whitespace-pre-wrap">
                {entry.body}
              </p>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
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

// ─── Reframe Tab ───────────────────────────────────────────────────────────────

function ReframeTab({ coachingTone }: { coachingTone: CoachingTone }) {
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState<string[] | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const submitChat = useSubmitFreeChat();
  const { bookmarks, toggleBookmark } = useBookmarks();

  const handleSubmit = async () => {
    if (!situation.trim()) {
      toast.error("Please describe your situation first.");
      return;
    }
    const prefix =
      "[REFRAME ENGINE: The user wants to reframe a negative workplace situation as a growth opportunity. Reframe positively, find the hidden lesson, the strength it reveals, and 2-3 concrete next steps.] Situation: ";
    try {
      const res = await submitChat.mutateAsync(
        buildPrompt(prefix + situation.trim(), coachingTone),
      );
      setResult(res);
      setShowDialog(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const resultParsed = result
    ? parseSuggestions(result)
    : { insights: [], microActions: [] };

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="reframe-input"
            className="text-sm font-semibold text-foreground font-body"
          >
            Describe the situation you want to reframe
          </label>
          <Textarea
            id="reframe-input"
            data-ocid="reframe.textarea"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g. I was passed over for promotion despite delivering excellent results this year..."
            className="min-h-[140px] text-sm font-body resize-none"
          />
        </div>
        <ToneSelectorBar value={coachingTone} onChange={() => {}} />
        <div className="flex justify-end gap-2">
          <VoiceDictationButton
            onTranscript={(text) =>
              setSituation((prev) => (prev ? `${prev} ${text}` : text))
            }
            disabled={submitChat.isPending}
          />
          <Button
            data-ocid="reframe.submit_button"
            onClick={handleSubmit}
            disabled={submitChat.isPending || !situation.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold h-11 rounded-xl gap-2 px-6"
          >
            {submitChat.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reframing…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Reframe This
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showDialog && result && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent
              className="max-w-2xl font-body flex flex-col max-h-[85vh]"
              data-ocid="reframe.dialog"
            >
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    Your Reframe
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground font-body pt-1 line-clamp-2">
                    {situation}
                  </p>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {resultParsed.insights.map((insight, i) => (
                    <motion.div
                      key={insight}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      data-ocid={`reframe.item.${i + 1}`}
                      className="border-l-2 border-primary pl-4 py-2 bg-secondary/40 rounded-r-lg flex items-start gap-2"
                    >
                      <p className="text-sm text-foreground leading-relaxed flex-1">
                        {insight}
                      </p>
                      <BookmarkButton
                        source={`Reframe: ${situation.slice(0, 60)}`}
                        insight={insight}
                        bookmarks={bookmarks}
                        toggleBookmark={toggleBookmark}
                      />
                    </motion.div>
                  ))}
                  <MicroActionsBlock items={resultParsed.microActions} />
                  <AudioPlaybackBar
                    insights={resultParsed.insights}
                    microActions={resultParsed.microActions}
                  />
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <FeedbackWidget
                      feedbackKey={btoa(situation.slice(0, 50))}
                    />
                  </div>
                  <CoachingDisclaimer />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  data-ocid="reframe.close_button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
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

// ─── Script Builder Tab ────────────────────────────────────────────────────────

const SCRIPT_SCENARIOS = [
  "Giving difficult feedback",
  "Resolving a conflict",
  "Salary negotiation",
  "Asking for a promotion",
  "Declining extra work",
  "Addressing underperformance",
  "Requesting flexible work",
];

function ScriptBuilderTab({ coachingTone }: { coachingTone: CoachingTone }) {
  const [scenarioType, setScenarioType] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<string[] | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const submitChat = useSubmitFreeChat();
  const { bookmarks, toggleBookmark } = useBookmarks();

  const handleSubmit = async () => {
    if (!scenarioType) {
      toast.error("Please select a scenario type first.");
      return;
    }
    const prompt = `[SCRIPT BUILDER: Generate a practical, professional, word-for-word communication script and email template. Include: Opening line, Key points to cover, Exact phrases to use, How to close the conversation positively.] Scenario type: ${scenarioType}. Context: ${context.trim() || "No additional context provided."}`;
    try {
      const res = await submitChat.mutateAsync(
        buildPrompt(prompt, coachingTone),
      );
      setResult(res);
      setShowDialog(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const resultParsed = result
    ? parseSuggestions(result)
    : { insights: [], microActions: [] };

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="scripts-scenario"
            className="text-sm font-semibold text-foreground font-body"
          >
            Scenario type
          </label>
          <Select value={scenarioType} onValueChange={setScenarioType}>
            <SelectTrigger
              id="scripts-scenario"
              data-ocid="scripts.select"
              className="font-body"
            >
              <SelectValue placeholder="Select a scenario…" />
            </SelectTrigger>
            <SelectContent>
              {SCRIPT_SCENARIOS.map((s) => (
                <SelectItem key={s} value={s} className="font-body">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="script-context"
            className="text-sm font-semibold text-foreground font-body"
          >
            Add context{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <Textarea
            id="script-context"
            data-ocid="scripts.textarea"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Any specific details about your situation, relationship dynamics, or what outcome you want..."
            className="min-h-[100px] text-sm font-body resize-none"
          />
        </div>
        <ToneSelectorBar value={coachingTone} onChange={() => {}} />
        <div className="flex justify-end gap-2">
          <VoiceDictationButton
            onTranscript={(text) =>
              setContext((prev) => (prev ? `${prev} ${text}` : text))
            }
            disabled={submitChat.isPending}
          />
          <Button
            data-ocid="scripts.submit_button"
            onClick={handleSubmit}
            disabled={submitChat.isPending || !scenarioType}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold h-11 rounded-xl gap-2 px-6"
          >
            {submitChat.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Script
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showDialog && result && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent
              className="max-w-2xl font-body flex flex-col max-h-[85vh]"
              data-ocid="scripts.dialog"
            >
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Your Communication Script
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground font-body pt-1">
                    {scenarioType}
                  </p>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {resultParsed.insights.map((insight, i) => (
                    <motion.div
                      key={insight}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      data-ocid={`scripts.item.${i + 1}`}
                      className="border-l-2 border-primary pl-4 py-2 bg-secondary/40 rounded-r-lg flex items-start gap-2"
                    >
                      <p className="text-sm text-foreground leading-relaxed flex-1">
                        {insight}
                      </p>
                      <BookmarkButton
                        source={`Script: ${scenarioType}`}
                        insight={insight}
                        bookmarks={bookmarks}
                        toggleBookmark={toggleBookmark}
                      />
                    </motion.div>
                  ))}
                  <MicroActionsBlock items={resultParsed.microActions} />
                  <AudioPlaybackBar
                    insights={resultParsed.insights}
                    microActions={resultParsed.microActions}
                  />
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <FeedbackWidget
                      feedbackKey={btoa(scenarioType.slice(0, 50))}
                    />
                  </div>
                  <CoachingDisclaimer />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  data-ocid="scripts.close_button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
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
const SUGGESTIONS = [
  "My manager micromanages everything I do",
  "I was passed over for a promotion without explanation",
  "A colleague takes credit for my work",
  "I feel burnt out and don't know how to raise it",
  "My team ignores my ideas in meetings",
  "I have a difficult conversation coming up with my manager",
  "I'm being excluded from important decisions",
  "My performance review felt unfair",
  "I have a toxic colleague who undermines me",
  "I don't feel valued or recognised",
  "I want to ask for a pay rise but don't know how",
  "My manager gives me vague feedback",
  "I feel stuck and don't see a growth path",
  "There's a conflict between me and a peer",
  "I feel like I'm being set up to fail",
];

type EmotionalTone = "frustrated" | "anxious" | "angry" | "neutral";

function detectEmotionalTone(text: string): EmotionalTone {
  const lower = text.toLowerCase();
  const frustrated = [
    "frustrated",
    "fed up",
    "exhausted",
    "burnt out",
    "tired of",
    "sick of",
    "had enough",
    "struggling",
    "overwhelmed",
  ];
  const anxious = [
    "scared",
    "worried",
    "nervous",
    "anxious",
    "afraid",
    "dread",
    "panic",
    "fear",
    "unsure",
    "don't know what to do",
  ];
  const angry = [
    "angry",
    "furious",
    "unfair",
    "not fair",
    "ridiculous",
    "outrageous",
    "betrayed",
    "lied",
    "disrespected",
  ];
  if (angry.some((w) => lower.includes(w))) return "angry";
  if (frustrated.some((w) => lower.includes(w))) return "frustrated";
  if (anxious.some((w) => lower.includes(w))) return "anxious";
  return "neutral";
}

const TONE_MESSAGES: Record<Exclude<EmotionalTone, "neutral">, string> = {
  frustrated:
    "I can hear this has been draining. Let's work through it together.",
  anxious: "It's okay to feel uncertain about this. Here's how to approach it.",
  angry:
    "This sounds genuinely difficult. Let's find a path that protects you.",
};

function EmotionalToneBanner({
  tone,
  onDismiss,
}: { tone: Exclude<EmotionalTone, "neutral">; onDismiss: () => void }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl px-4 py-3 text-sm flex items-center gap-2 mb-4">
      <Heart className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 font-body">{TONE_MESSAGES[tone]}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Practice Scenarios ────────────────────────────────────────────────────────

interface PracticeScenario {
  id: string;
  title: string;
  context: string;
  question: string;
  options: string[];
}

const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: "vague-feedback",
    title: "Vague Performance Feedback",
    context:
      "Your manager just told you 'You need to be more proactive' in your performance review. No examples given. You feel confused and a bit stung.",
    question: "What do you do next?",
    options: [
      "Ask for specific examples right now in the meeting",
      "Accept it and try to figure out what they mean",
      "Discuss with a trusted colleague later",
      "Request a follow-up meeting to clarify expectations",
    ],
  },
  {
    id: "credit-stolen",
    title: "Peer Takes Credit for Your Work",
    context:
      "In a team presentation, your colleague presents your analysis as if it were their own. Your manager praises them. You're sitting right there.",
    question: "How do you respond?",
    options: [
      "Say nothing — address it privately with the colleague later",
      "Gently clarify your contribution in the room now",
      "Speak to your manager privately afterward",
      "Let it go — it's not worth the conflict",
    ],
  },
  {
    id: "missed-promotion",
    title: "Passed Over for Promotion",
    context:
      "Someone with less experience was promoted over you. You weren't given a reason. You're questioning whether to stay.",
    question: "What's your first move?",
    options: [
      "Request a meeting with your manager to understand the decision",
      "Start updating your CV immediately",
      "Talk to HR about the process",
      "Ask the promoted colleague how they positioned themselves",
    ],
  },
  {
    id: "micromanagement",
    title: "Constant Micromanagement",
    context:
      "Your manager checks in multiple times a day, questions every decision, and CC's themselves on all your emails. You feel you can't breathe.",
    question: "How do you approach this?",
    options: [
      "Have a direct conversation about your working style",
      "Document your work more proactively to build their trust",
      "Speak to HR or a skip-level manager",
      "Quietly start looking for a new role",
    ],
  },
  {
    id: "excluded-decisions",
    title: "Excluded from Key Decisions",
    context:
      "You keep finding out about decisions that affect your work after they're already made. You're never in the room.",
    question: "What do you do?",
    options: [
      "Ask your manager directly why you're not included",
      "Find allies who can advocate for your inclusion",
      "Start attending meetings you weren't explicitly invited to",
      "Document the pattern and raise it formally",
    ],
  },
  {
    id: "toxic-colleague",
    title: "Undermining Colleague",
    context:
      "A peer regularly interrupts you in meetings, dismisses your ideas, and makes subtle negative comments about your work to others.",
    question: "How do you handle this?",
    options: [
      "Address it directly and privately with the colleague",
      "Speak to your manager about the pattern",
      "Start documenting specific incidents",
      "Change how you engage — become more assertive in the room",
    ],
  },
];

const PRACTICE_STORAGE_KEY = "wc_practice_completions";

function getPracticeCompletions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PRACTICE_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function savePracticeCompletion(id: string) {
  const existing = getPracticeCompletions();
  if (!existing.includes(id)) {
    localStorage.setItem(
      PRACTICE_STORAGE_KEY,
      JSON.stringify([...existing, id]),
    );
  }
}

function PracticeTab({ coachingTone }: { coachingTone: CoachingTone }) {
  const [completions, setCompletions] = useState<string[]>(
    getPracticeCompletions,
  );
  const [activeScenario, setActiveScenario] = useState<PracticeScenario | null>(
    null,
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [coachingResult, setCoachingResult] = useState<string[] | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const submitChat = useSubmitFreeChat();
  const { bookmarks, toggleBookmark } = useBookmarks();

  const handleGetCoaching = async () => {
    if (!activeScenario || !selectedOption) return;
    const rawPrompt = `The user is practicing a workplace scenario. Scenario: ${activeScenario.context}. Question: ${activeScenario.question}. They chose: "${selectedOption}".${freeText.trim() ? ` Additional thoughts: ${freeText.trim()}.` : ""} Give structured coaching on whether this is a strong approach, what risks it carries, and what alternative approaches they might consider. End with a 'Try This Today' action.`;
    try {
      const result = await submitChat.mutateAsync(
        buildPrompt(rawPrompt, coachingTone),
      );
      setCoachingResult(result);
      setShowResultDialog(true);
      savePracticeCompletion(activeScenario.id);
      setCompletions(getPracticeCompletions());
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    setActiveScenario(null);
    setSelectedOption(null);
    setFreeText("");
    setCoachingResult(null);
  };

  if (!activeScenario) {
    return (
      <div className="space-y-5">
        <div>
          <p className="font-display text-lg font-bold text-foreground mb-1">
            Practice Scenarios
          </p>
          <p className="text-sm text-muted-foreground font-body mb-5">
            Rehearse your response before it happens. Choose a realistic
            workplace situation to practise.
          </p>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="practice.list"
        >
          {PRACTICE_SCENARIOS.map((scenario, i) => {
            const done = completions.includes(scenario.id);
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                data-ocid={`practice.item.${i + 1}`}
                className={`bg-card rounded-xl border p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow ${done ? "border-primary/40" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-bold text-sm text-foreground">
                    {scenario.title}
                  </p>
                  {done && (
                    <span className="flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed line-clamp-2">
                  {scenario.context.slice(0, 90)}
                  {scenario.context.length > 90 ? "…" : ""}
                </p>
                <Button
                  data-ocid="practice.primary_button"
                  size="sm"
                  onClick={() => {
                    setActiveScenario(scenario);
                    setSelectedOption(null);
                    setFreeText("");
                    setCoachingResult(null);
                  }}
                  className="mt-auto font-body gap-1.5 rounded-lg"
                  variant={done ? "outline" : "default"}
                >
                  <Swords className="w-3.5 h-3.5" />
                  {done ? "Practise Again" : "Start Scenario"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
          data-ocid="practice.secondary_button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Back to scenarios
        </button>

        <div className="bg-secondary/40 border-l-4 border-primary rounded-r-xl p-4">
          <p className="font-display font-bold text-sm text-foreground mb-2">
            {activeScenario.title}
          </p>
          <p className="text-sm text-foreground/80 font-body leading-relaxed">
            {activeScenario.context}
          </p>
        </div>

        <div>
          <p className="font-body font-semibold text-sm text-foreground mb-3">
            {activeScenario.question}
          </p>
          <div className="space-y-2" data-ocid="practice.panel">
            {activeScenario.options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                data-ocid="practice.toggle"
                onClick={() => setSelectedOption(opt)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-body transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedOption === opt ? "border-primary bg-primary/8 text-foreground font-medium" : "border-border bg-background hover:border-primary/40 text-muted-foreground hover:text-foreground"}`}
              >
                <span className="font-semibold mr-2 text-primary">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="practice-freetext"
            className="text-sm font-semibold text-foreground font-body"
          >
            Add your own thoughts{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <Textarea
            id="practice-freetext"
            data-ocid="practice.textarea"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Any context, concerns, or additional thoughts about this situation..."
            className="min-h-[80px] text-sm font-body resize-none"
          />
        </div>

        <ToneSelectorBar value={coachingTone} onChange={() => {}} />
        <Button
          data-ocid="practice.submit_button"
          onClick={handleGetCoaching}
          disabled={!selectedOption || submitChat.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold h-11 rounded-xl gap-2"
        >
          {submitChat.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting coaching…
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4" />
              Get Coaching
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showResultDialog && coachingResult && (
          <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
            <DialogContent
              className="max-w-2xl font-body flex flex-col max-h-[85vh]"
              data-ocid="practice.dialog"
            >
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Coaching on Your Choice
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground font-body pt-1">
                    {activeScenario.title} — You chose: "{selectedOption}"
                  </p>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {(() => {
                    const { insights, microActions } =
                      parseSuggestions(coachingResult);
                    return (
                      <>
                        {insights.map((insight, i) => (
                          <motion.div
                            key={insight}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.35 }}
                            data-ocid={`practice.item.${i + 1}`}
                            className="border-l-2 border-primary pl-4 py-2 bg-secondary/40 rounded-r-lg flex items-start gap-2"
                          >
                            <p className="text-sm text-foreground leading-relaxed flex-1">
                              {insight}
                            </p>
                            <BookmarkButton
                              source={`Practice: ${activeScenario.title}`}
                              insight={insight}
                              bookmarks={bookmarks}
                              toggleBookmark={toggleBookmark}
                            />
                          </motion.div>
                        ))}
                        <MicroActionsBlock items={microActions} />
                        <AudioPlaybackBar
                          insights={insights}
                          microActions={microActions}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button
                  data-ocid="practice.secondary_button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowResultDialog(false);
                    handleReset();
                  }}
                  className="font-body gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Another
                </Button>
                <Button
                  data-ocid="practice.close_button"
                  variant="outline"
                  onClick={() => setShowResultDialog(false)}
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

function AskCoachPanel({ coachingTone }: { coachingTone: CoachingTone }) {
  const [question, setQuestion] = useState("");
  const [chatInsights, setChatInsights] = useState<string[] | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [emotionalTone, setEmotionalTone] = useState<EmotionalTone>("neutral");
  const [toneBannerDismissed, setToneBannerDismissed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated } = useAuthState();
  const submitChat = useSubmitFreeChat();
  const { bookmarks, toggleBookmark } = useBookmarks();

  const charCount = question.length;
  const isOverLimit = charCount > MAX_CHAT_LENGTH;

  const filteredSuggestions =
    question.length >= 3
      ? SUGGESTIONS.filter((s) =>
          s.toLowerCase().includes(question.toLowerCase()),
        ).slice(0, 5)
      : [];

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
    const tone = detectEmotionalTone(trimmed);
    setEmotionalTone(tone);
    setToneBannerDismissed(false);
    const emotionPrefix =
      tone !== "neutral"
        ? `The user appears to be feeling ${tone}. Begin your response with a single empathetic sentence acknowledging their emotional state before moving into practical coaching. Question: ${trimmed}`
        : trimmed;
    const promptWithTone = buildPrompt(emotionPrefix, coachingTone);
    try {
      const result = await submitChat.mutateAsync(promptWithTone);
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
          <div className="relative">
            <Textarea
              ref={textareaRef}
              data-ocid="chat.textarea"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowSuggestions(false);
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  handleSubmit();
              }}
              placeholder='e.g. "How do I handle a colleague who keeps taking credit for my ideas?"'
              className="min-h-[140px] text-sm font-body resize-none bg-background/60 border-border/80 focus:border-primary focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 leading-relaxed"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                <p className="text-xs font-semibold text-muted-foreground font-body px-3 pt-2 pb-1 uppercase tracking-wide">
                  Suggestions
                </p>
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuestion(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-body hover:bg-secondary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
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

        {/* Tone selector */}
        <ToneSelectorBar value={coachingTone} onChange={() => {}} />

        {/* Submit */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-body">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs">
              ⌘ Enter
            </kbd>{" "}
            to submit
          </p>
          <div className="flex items-center gap-2">
            <VoiceDictationButton
              onTranscript={(text) =>
                setQuestion((prev) => (prev ? `${prev} ${text}` : text))
              }
              disabled={submitChat.isPending}
            />
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

                {emotionalTone !== "neutral" && !toneBannerDismissed && (
                  <EmotionalToneBanner
                    tone={emotionalTone as Exclude<EmotionalTone, "neutral">}
                    onDismiss={() => setToneBannerDismissed(true)}
                  />
                )}
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
                              className="border-l-2 border-primary pl-4 py-2 bg-secondary/40 rounded-r-lg flex items-start gap-2"
                            >
                              <p className="text-sm text-foreground leading-relaxed flex-1">
                                {insight}
                              </p>
                              <BookmarkButton
                                source={question}
                                insight={insight}
                                bookmarks={bookmarks}
                                toggleBookmark={toggleBookmark}
                              />
                            </motion.div>
                          ))}
                          <MicroActionsBlock items={microActions} />
                          <AudioPlaybackBar
                            insights={insights}
                            microActions={microActions}
                          />
                          <div className="mt-4 pt-3 border-t border-border/40">
                            <FeedbackWidget
                              feedbackKey={btoa(question.slice(0, 50))}
                            />
                          </div>
                          <CoachingDisclaimer />
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
              <div className="flex items-center justify-between pt-2">
                <Button
                  data-ocid="chat.secondary_button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowChatDialog(false);
                    setShowExportModal(true);
                  }}
                  className="font-body gap-2"
                  disabled={!chatInsights || chatInsights.length === 0}
                >
                  <FileText className="w-4 h-4" />
                  Export Card
                </Button>
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

      {/* Export modal */}
      {chatInsights &&
        (() => {
          const { insights, microActions } = parseSuggestions(chatInsights);
          return (
            <ExportCardModal
              open={showExportModal}
              onOpenChange={setShowExportModal}
              source={question}
              insights={insights}
              microActions={microActions}
            />
          );
        })()}
    </>
  );
}

// ─── Authenticated App ─────────────────────────────────────────────────────────

type AppMode = "matrix" | "chat" | "practice" | "reframe" | "scripts" | "goals";

function AuthenticatedApp() {
  const [mode, setMode] = useState<AppMode>("matrix");
  const [coachingTone, _setCoachingTone] = useState<CoachingTone>("Mentor");
  const [selectedWho, setSelectedWho] = useState<MatrixWho | null>(null);
  const [selectedType, setSelectedType] = useState<MatrixType | null>(null);
  const [scenarioText, setScenarioText] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showMatrixExportModal, setShowMatrixExportModal] = useState(false);
  const [showConfidencePreModal, setShowConfidencePreModal] = useState(false);
  const [confidencePreScore, setConfidencePreScore] = useState(5);
  const [pendingConfidencePre, setPendingConfidencePre] = useState<
    number | null
  >(null);
  const [confidencePostScore, setConfidencePostScore] = useState(5);
  const [showWinsTab, setShowWinsTab] = useState(false);
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [practiceCount, setPracticeCount] = useState(
    () => getPracticeCompletions().length,
  );

  // Sync practice completions from localStorage when mode changes
  useEffect(() => {
    if (mode === "practice" || mode === "matrix") {
      setPracticeCount(getPracticeCompletions().length);
    }
  }, [mode]);

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
    // Show confidence pre-rating modal
    setConfidencePreScore(5);
    setShowConfidencePreModal(true);
  };

  const handleSubmitAfterConfidence = async (preScore: number) => {
    setPendingConfidencePre(preScore);
    setShowConfidencePreModal(false);
    try {
      const result = await submitMutation.mutateAsync({
        text: buildPrompt(scenarioText.trim(), coachingTone),
        who: selectedWho!,
        challengeType: selectedType!,
      });
      setSuggestions(result);
      setConfidencePostScore(5);
      setShowResultsDialog(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleLogConfidencePost = () => {
    if (pendingConfidencePre === null) return;
    const existing = JSON.parse(
      localStorage.getItem("wc_confidence_log") ?? "[]",
    );
    existing.push({
      date: new Date().toISOString(),
      pre: pendingConfidencePre,
      post: confidencePostScore,
    });
    localStorage.setItem("wc_confidence_log", JSON.stringify(existing));
    setPendingConfidencePre(null);
    toast.success("Confidence logged!");
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
          <button
            type="button"
            data-ocid="mode.tab"
            onClick={() => setMode("practice")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "practice"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Swords className="w-4 h-4" />
            Practice
          </button>
          <button
            type="button"
            data-ocid="mode.tab"
            onClick={() => setMode("reframe")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "reframe"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Reframe It
          </button>
          <button
            type="button"
            data-ocid="mode.tab"
            onClick={() => setMode("scripts")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "scripts"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Script Builder
          </button>
          <button
            type="button"
            data-ocid="goals.tab"
            onClick={() => setMode("goals")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "goals"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="w-4 h-4" />
            90-Day Goals
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

      {/* 90-Day Goal Banner */}
      {(mode === "matrix" || mode === "chat") &&
        (() => {
          const goalData = (() => {
            try {
              return JSON.parse(
                localStorage.getItem("wc_90day_goal") ?? "null",
              );
            } catch {
              return null;
            }
          })();
          if (!goalData) return null;
          const start = new Date(goalData.startDate).getTime();
          const end = new Date(goalData.targetDate).getTime();
          const now = Date.now();
          const daysTotal = Math.max(1, Math.round((end - start) / 86400000));
          const daysLeft = Math.max(0, Math.round((end - now) / 86400000));
          return (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 text-sm font-body"
              data-ocid="goals.panel"
            >
              <Target className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="flex-1 text-amber-800 dark:text-amber-300 truncate font-medium">
                🎯 Goal: {goalData.goal}
              </span>
              <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold whitespace-nowrap">
                {daysLeft}d left of {daysTotal}d
              </span>
            </motion.div>
          );
        })()}

      {/* Friday Wins Nudge */}
      {new Date().getDay() === 5 &&
        (() => {
          const wins: {
            id: string;
            title: string;
            note: string;
            date: string;
          }[] = (() => {
            try {
              return JSON.parse(localStorage.getItem("wc_weekly_wins") ?? "[]");
            } catch {
              return [];
            }
          })();
          const thisWeekStart = new Date();
          thisWeekStart.setDate(
            thisWeekStart.getDate() - thisWeekStart.getDay(),
          );
          thisWeekStart.setHours(0, 0, 0, 0);
          const hasWinThisWeek = wins.some(
            (w) => new Date(w.date) >= thisWeekStart,
          );
          if (hasWinThisWeek) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 text-sm font-body"
              data-ocid="wins.panel"
            >
              <Trophy className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="flex-1 text-emerald-800 dark:text-emerald-300 font-medium">
                🏆 It&apos;s Friday! Take a moment to log this week&apos;s wins.
              </span>
              <button
                type="button"
                data-ocid="wins.open_modal_button"
                onClick={() => {
                  setShowWinsTab(true);
                  setMode("matrix");
                }}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 underline whitespace-nowrap ml-2"
              >
                Log a Win
              </button>
            </motion.div>
          );
        })()}

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

                    <ToneSelectorBar
                      value={coachingTone}
                      onChange={(t) => {
                        _setCoachingTone(t);
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <VoiceDictationButton
                        onTranscript={(text) =>
                          setScenarioText((prev) =>
                            prev ? `${prev} ${text}` : text,
                          )
                        }
                        disabled={isPending}
                      />
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
        ) : mode === "chat" ? (
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
              <AskCoachPanel coachingTone={coachingTone} />
            </div>
          </motion.div>
        ) : mode === "practice" ? (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Practice Scenarios
                  </h2>
                  <p className="text-xs text-muted-foreground font-body">
                    Rehearse your response before it happens in real life.
                  </p>
                </div>
              </div>
              <PracticeTab coachingTone={coachingTone} />
            </div>
          </motion.div>
        ) : mode === "reframe" ? (
          <motion.div
            key="reframe"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Reframe It
                  </h2>
                  <p className="text-xs text-muted-foreground font-body">
                    Turn any setback into a growth opportunity.
                  </p>
                </div>
              </div>
              <ReframeTab coachingTone={coachingTone} />
            </div>
          </motion.div>
        ) : mode === "scripts" ? (
          <motion.div
            key="scripts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Script Builder
                  </h2>
                  <p className="text-xs text-muted-foreground font-body">
                    Generate word-for-word scripts and email templates.
                  </p>
                </div>
              </div>
              <ScriptBuilderTab coachingTone={coachingTone} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    90-Day Goal Tracker
                  </h2>
                  <p className="text-xs text-muted-foreground font-body">
                    Set a career goal and track milestones over 90 days.
                  </p>
                </div>
              </div>
              <GoalTrackerTab />
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

        <Tabs
          defaultValue={showWinsTab ? "wins" : "scenarios"}
          onValueChange={() => setShowWinsTab(false)}
        >
          <TabsList
            className="mb-5 h-10 flex-wrap gap-1"
            data-ocid="history.tab"
          >
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
            <TabsTrigger
              value="saved"
              className="font-body text-sm"
              data-ocid="history.tab"
            >
              <Bookmark className="w-3.5 h-3.5 mr-1" />
              Saved
            </TabsTrigger>
            <TabsTrigger
              value="journal"
              className="font-body text-sm"
              data-ocid="history.tab"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Journal
            </TabsTrigger>
            <TabsTrigger
              value="wins"
              className="font-body text-sm"
              data-ocid="wins.tab"
            >
              <Trophy className="w-3.5 h-3.5 mr-1" />
              Weekly Wins
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

          <TabsContent value="saved">
            <SavedTab />
          </TabsContent>

          <TabsContent value="journal">
            <JournalTab />
          </TabsContent>
          <TabsContent value="wins">
            <WeeklyWinsTab />
          </TabsContent>
        </Tabs>
      </section>

      {/* Growth Path Section */}
      <GrowthPathSection
        submissions={history}
        chats={chatHistory}
        practiceCount={practiceCount}
      />

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
                              className="border-l-2 border-primary pl-4 py-2 bg-secondary/40 rounded-r-lg flex items-start gap-2"
                            >
                              <p className="text-sm text-foreground leading-relaxed flex-1">
                                {suggestion}
                              </p>
                              <BookmarkButton
                                source={
                                  selectedCell
                                    ? `${selectedCell.scenario}: ${scenarioText}`
                                    : scenarioText
                                }
                                insight={suggestion}
                                bookmarks={bookmarks}
                                toggleBookmark={toggleBookmark}
                              />
                            </motion.div>
                          ))}
                          <MicroActionsBlock items={microActions} />
                          <AudioPlaybackBar
                            insights={insights}
                            microActions={microActions}
                          />
                          <div className="mt-4 pt-3 border-t border-border/40">
                            <FeedbackWidget
                              feedbackKey={btoa(scenarioText.slice(0, 50))}
                            />
                          </div>
                          {pendingConfidencePre !== null && (
                            <div
                              className="mt-4 pt-3 border-t border-border/40 space-y-3"
                              data-ocid="confidence.panel"
                            >
                              <p className="text-sm font-semibold font-body text-foreground flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                How do you feel after this session? Rate your
                                confidence (1–10)
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground font-body">
                                  1
                                </span>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[confidencePostScore]}
                                  onValueChange={(v) =>
                                    setConfidencePostScore(v[0])
                                  }
                                  className="flex-1"
                                  data-ocid="confidence.toggle"
                                />
                                <span className="text-xs text-muted-foreground font-body">
                                  10
                                </span>
                                <span className="text-sm font-bold text-primary w-6 text-center">
                                  {confidencePostScore}
                                </span>
                              </div>
                              <Button
                                data-ocid="confidence.submit_button"
                                size="sm"
                                onClick={handleLogConfidencePost}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-body font-semibold gap-1.5"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Log It
                              </Button>
                            </div>
                          )}
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

              <div className="flex items-center justify-between pt-2">
                <Button
                  data-ocid="results.secondary_button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowResultsDialog(false);
                    setShowMatrixExportModal(true);
                  }}
                  className="font-body gap-2"
                  disabled={!suggestions || suggestions.length === 0}
                >
                  <FileText className="w-4 h-4" />
                  Export Card
                </Button>
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

      {/* Confidence Pre-Coaching Modal */}
      <Dialog
        open={showConfidencePreModal}
        onOpenChange={setShowConfidencePreModal}
      >
        <DialogContent
          className="max-w-sm font-body"
          data-ocid="confidence.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Rate Your Confidence
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-muted-foreground">
              How confident do you feel about this situation right now? (1–10)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-body">1</span>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[confidencePreScore]}
                onValueChange={(v) => setConfidencePreScore(v[0])}
                className="flex-1"
                data-ocid="confidence.toggle"
              />
              <span className="text-xs text-muted-foreground font-body">
                10
              </span>
              <span className="text-lg font-bold text-primary w-8 text-center">
                {confidencePreScore}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-body text-center">
              This helps track your confidence growth over time.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              data-ocid="confidence.cancel_button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfidencePreModal(false)}
              className="font-body"
            >
              Skip
            </Button>
            <Button
              data-ocid="confidence.confirm_button"
              size="sm"
              onClick={() => handleSubmitAfterConfidence(confidencePreScore)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold gap-2"
            >
              <Star className="w-3.5 h-3.5" />
              Start Coaching
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Matrix export modal */}
      {suggestions &&
        (() => {
          const { insights, microActions } = parseSuggestions(suggestions);
          const source = selectedCell
            ? `${selectedCell.scenario}${scenarioText ? `: ${scenarioText}` : ""}`
            : scenarioText;
          return (
            <ExportCardModal
              open={showMatrixExportModal}
              onOpenChange={setShowMatrixExportModal}
              source={source}
              insights={insights}
              microActions={microActions}
            />
          );
        })()}
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

        {/* Value Stats Strip */}
        <div className="w-full max-w-3xl rounded-2xl overflow-hidden mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              {
                num: "9",
                label: "Coaching Paths",
                sub: "Mapped across the WHO × WHAT matrix",
              },
              {
                num: "5+",
                label: "Core Features",
                sub: "Matrix · Chat · Growth · Bookmarks · Practice",
              },
              {
                num: "100%",
                label: "Personalised",
                sub: "Tailored to your role, industry & experience",
              },
              {
                num: "🔒",
                label: "Always Private",
                sub: "Your history is only visible to you",
              },
            ].map(({ num, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-foreground text-background p-5 flex flex-col gap-1 border-r border-background/10 last:border-r-0"
              >
                <p className="font-display text-3xl font-bold text-background">
                  {num}
                </p>
                <p className="font-display text-sm font-semibold text-background/90">
                  {label}
                </p>
                <p className="font-body text-xs text-background/55 leading-relaxed">
                  {sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Before / After Comparison */}
        <div className="w-full max-w-3xl mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-4 h-4 text-destructive/70" />
                  <p className="font-display font-bold text-sm text-destructive/80">
                    Without a Coach
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Vent frustration online",
                    "React emotionally in the moment",
                    "Advice from friends who don't know your workplace",
                    "Regret what you said or did",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm font-body text-muted-foreground"
                    >
                      <XCircle className="w-4 h-4 text-destructive/50 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-green-50/50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="font-display font-bold text-sm text-green-700 dark:text-green-400">
                    With Workplace Compass
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Navigate to a constructive response",
                    "Understand the real dynamics at play",
                    "Structured, personalised coaching",
                    "Protect your reputation and relationships",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm font-body text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature highlights strip */}
      <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-4 mt-10 mb-8 px-4">
        {[
          {
            icon: <Compass className="w-5 h-5 text-primary" />,
            title: "Matrix Navigator",
            desc: "Two-axis WHO × WHAT map to any situation",
          },
          {
            icon: <MessageCircle className="w-5 h-5 text-primary" />,
            title: "Ask Coach",
            desc: "Free-text AI coaching on any workplace challenge",
          },
          {
            icon: <TrendingUp className="w-5 h-5 text-primary" />,
            title: "Growth Path",
            desc: "Track milestones, badges, and coverage over time",
          },
          {
            icon: <Bookmark className="w-5 h-5 text-primary" />,
            title: "Saved Insights",
            desc: "Bookmark key coaching insights for later review",
          },
          {
            icon: <BookOpen className="w-5 h-5 text-primary" />,
            title: "Practice Scenarios",
            desc: "Realistic simulations to rehearse your response before it happens",
          },
          {
            icon: <Heart className="w-5 h-5 text-primary" />,
            title: "Tone-Aware Coaching",
            desc: "Detects emotional signals and leads with empathy when needed",
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">
                {title}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-muted/60 border border-border/50 text-xs text-muted-foreground font-body mb-6">
        <span>🔒</span>
        <span>
          Your privacy matters: all coaching conversations, bookmarks, and
          journal entries are stored only on your device — never on our servers.
        </span>
      </div>

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
        <p className="text-xs text-muted-foreground text-center mt-3 font-body">
          For serious mental health concerns, please consult a licensed
          professional.
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
  "Information Technology & ITES",
  "BPO / KPO / Outsourcing",
  "Software & SaaS",
  "IT Consulting & Services",
  "Finance & Banking",
  "Insurance",
  "Healthcare & Pharmaceuticals",
  "Education & EdTech",
  "Retail & E-commerce",
  "Media, Entertainment & Creative",
  "Telecommunications",
  "Manufacturing & Logistics",
  "Engineering & Construction",
  "Energy & Utilities",
  "Legal & Compliance",
  "Government & Public Sector",
  "Non-profit & NGO",
  "Hospitality & Travel",
  "Real Estate",
  "Startup / Entrepreneur",
  "Other",
];

// ─── 90-Day Goal Tracker ──────────────────────────────────────────────────────

interface GoalData {
  goal: string;
  startDate: string;
  targetDate: string;
  milestones: { text: string; date: string; done: boolean }[];
}

const GOAL_KEY = "wc_90day_goal";

function GoalTrackerTab() {
  const [goalData, setGoalData] = useState<GoalData | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(GOAL_KEY) ?? "null");
    } catch {
      return null;
    }
  });
  const [goalInput, setGoalInput] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  });
  const [milestoneInput, setMilestoneInput] = useState("");
  const [editing, setEditing] = useState(false);

  const saveGoal = () => {
    if (!goalInput.trim()) {
      toast.error("Please enter a goal.");
      return;
    }
    const data: GoalData = {
      goal: goalInput.trim(),
      startDate: new Date().toISOString(),
      targetDate,
      milestones: [],
    };
    localStorage.setItem(GOAL_KEY, JSON.stringify(data));
    setGoalData(data);
    setEditing(false);
    toast.success("90-day goal set!");
  };

  const clearGoal = () => {
    localStorage.removeItem(GOAL_KEY);
    setGoalData(null);
    setGoalInput("");
    const d = new Date();
    d.setDate(d.getDate() + 90);
    setTargetDate(d.toISOString().split("T")[0]);
  };

  const addMilestone = () => {
    if (!milestoneInput.trim() || !goalData) return;
    const updated = {
      ...goalData,
      milestones: [
        ...goalData.milestones,
        {
          text: milestoneInput.trim(),
          date: new Date().toISOString(),
          done: false,
        },
      ],
    };
    localStorage.setItem(GOAL_KEY, JSON.stringify(updated));
    setGoalData(updated);
    setMilestoneInput("");
  };

  const toggleMilestone = (idx: number) => {
    if (!goalData) return;
    const milestones = goalData.milestones.map((m, i) =>
      i === idx ? { ...m, done: !m.done } : m,
    );
    const updated = { ...goalData, milestones };
    localStorage.setItem(GOAL_KEY, JSON.stringify(updated));
    setGoalData(updated);
  };

  const deleteMilestone = (idx: number) => {
    if (!goalData) return;
    const milestones = goalData.milestones.filter((_, i) => i !== idx);
    const updated = { ...goalData, milestones };
    localStorage.setItem(GOAL_KEY, JSON.stringify(updated));
    setGoalData(updated);
  };

  if (!goalData || editing) {
    return (
      <div className="space-y-5" data-ocid="goals.panel">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium font-body">
            What is your 90-day career goal?
          </Label>
          <Textarea
            data-ocid="goals.textarea"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. Get promoted to Senior Manager by demonstrating leadership in cross-functional projects…"
            className="min-h-[100px] text-sm font-body resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium font-body flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            Target Date
          </Label>
          <input
            type="date"
            data-ocid="goals.input"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
              className="font-body"
              data-ocid="goals.cancel_button"
            >
              Cancel
            </Button>
          )}
          <Button
            data-ocid="goals.submit_button"
            onClick={saveGoal}
            disabled={!goalInput.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold gap-2"
          >
            <Target className="w-4 h-4" />
            {editing ? "Update Goal" : "Set My 90-Day Goal"}
          </Button>
        </div>
      </div>
    );
  }

  const start = new Date(goalData.startDate).getTime();
  const end = new Date(goalData.targetDate).getTime();
  const now = Date.now();
  const daysTotal = Math.max(1, Math.round((end - start) / 86400000));
  const daysElapsed = Math.max(0, Math.round((now - start) / 86400000));
  const daysLeft = Math.max(0, daysTotal - daysElapsed);
  const progressPct = Math.min(
    100,
    Math.round((daysElapsed / daysTotal) * 100),
  );
  const doneMilestones = goalData.milestones.filter((m) => m.done).length;

  return (
    <div className="space-y-6" data-ocid="goals.panel">
      {/* Goal card */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide font-body mb-1">
              Your 90-Day Goal
            </p>
            <p className="text-base font-bold text-foreground font-display leading-snug">
              {goalData.goal}
            </p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              type="button"
              data-ocid="goals.edit_button"
              onClick={() => {
                setGoalInput(goalData.goal);
                setTargetDate(goalData.targetDate);
                setEditing(true);
              }}
              className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              data-ocid="goals.delete_button"
              onClick={clearGoal}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-body text-muted-foreground">
            <span>{daysElapsed}d elapsed</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {daysLeft}d remaining of {daysTotal}d
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-amber-100 dark:bg-amber-900/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-amber-400 dark:bg-amber-500 rounded-full"
            />
          </div>
          <p className="text-xs text-right text-amber-600 font-body font-semibold">
            {progressPct}% time elapsed
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full font-body">
            <CalendarDays className="w-3 h-3 inline mr-1" />
            Target: {new Date(goalData.targetDate).toLocaleDateString()}
          </span>
          {doneMilestones > 0 && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full font-body">
              ✓ {doneMilestones}/{goalData.milestones.length} milestones done
            </span>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <p className="text-sm font-semibold font-body text-foreground">
          Milestones
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            data-ocid="goals.input"
            value={milestoneInput}
            onChange={(e) => setMilestoneInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addMilestone();
            }}
            placeholder="Add a milestone…"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="sm"
            data-ocid="goals.primary_button"
            onClick={addMilestone}
            disabled={!milestoneInput.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
        {goalData.milestones.length === 0 ? (
          <div
            data-ocid="goals.empty_state"
            className="text-center py-8 border border-dashed border-border rounded-xl"
          >
            <p className="text-sm text-muted-foreground font-body">
              No milestones yet. Break your goal into steps!
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="goals.list">
            {goalData.milestones.map((m, i) => (
              <motion.div
                key={`milestone-${m.text.slice(0, 20)}-${m.date}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`goals.item.${i + 1}`}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${m.done ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-card border-border"}`}
              >
                <input
                  type="checkbox"
                  data-ocid={`goals.checkbox.${i + 1}`}
                  checked={m.done}
                  onChange={() => toggleMilestone(i)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span
                  className={`flex-1 text-sm font-body ${m.done ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {m.text}
                </span>
                <button
                  type="button"
                  data-ocid={`goals.delete_button.${i + 1}`}
                  onClick={() => deleteMilestone(i)}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Weekly Wins Journal ──────────────────────────────────────────────────────

interface WinEntry {
  id: string;
  title: string;
  note: string;
  date: string;
}

const WINS_KEY = "wc_weekly_wins";

function WeeklyWinsTab() {
  const [wins, setWins] = useState<WinEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WINS_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const logWin = () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your win.");
      return;
    }
    const updated = [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        note: note.trim(),
        date: new Date().toISOString(),
      },
      ...wins,
    ];
    localStorage.setItem(WINS_KEY, JSON.stringify(updated));
    setWins(updated);
    setTitle("");
    setNote("");
    toast.success("🏆 Win logged! Keep it up!");
  };

  const deleteWin = (id: string) => {
    const updated = wins.filter((w) => w.id !== id);
    localStorage.setItem(WINS_KEY, JSON.stringify(updated));
    setWins(updated);
  };

  return (
    <div className="space-y-6">
      {/* Log Win Form */}
      <div
        className="bg-card rounded-xl border border-border p-5 space-y-4"
        data-ocid="wins.panel"
      >
        <p className="text-sm font-semibold text-foreground font-body flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Log a Weekly Win
        </p>
        <input
          type="text"
          data-ocid="wins.input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What did you achieve this week? e.g. Led a successful team presentation…"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Textarea
          data-ocid="wins.textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional details — what happened, what you learned, how it felt…"
          className="min-h-[80px] text-sm font-body resize-none"
        />
        <div className="flex justify-end">
          <Button
            data-ocid="wins.submit_button"
            onClick={logWin}
            disabled={!title.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white font-body font-semibold gap-2"
          >
            <Trophy className="w-4 h-4" />
            Log Win
          </Button>
        </div>
      </div>

      {/* Wins list */}
      {wins.length === 0 ? (
        <div
          data-ocid="wins.empty_state"
          className="text-center py-16 border border-dashed border-border rounded-2xl"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            No wins logged yet.
          </p>
          <p className="font-body text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">
            Every Friday is a great time to celebrate your progress!
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="wins.list">
          {wins.map((win, i) => (
            <motion.div
              key={win.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              data-ocid={`wins.item.${i + 1}`}
              className="bg-card rounded-xl border border-border p-4 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-foreground">
                  {win.title}
                </p>
                {win.note && (
                  <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                    {win.note}
                  </p>
                )}
                <p className="font-body text-xs text-muted-foreground/60 mt-1.5">
                  {new Date(win.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                type="button"
                data-ocid={`wins.delete_button.${i + 1}`}
                onClick={() => deleteWin(win.id)}
                className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [voicePrefLocal, setVoicePrefLocal] = useState<string>(
    () => localStorage.getItem("wc_voice_pref") ?? "male",
  );
  const [langPrefLocal, setLangPrefLocal] = useState<string>(
    () => localStorage.getItem("wc_language_pref") ?? "English",
  );
  const saveMutation = useSaveCallerUserProfile();

  useEffect(() => {
    if (open) {
      setNameInput(profile?.name ?? "");
      setRole(profile?.role ?? "");
      setExperienceLevel(profile?.experienceLevel ?? "");
      setIndustry(profile?.industry ?? "");
      setVoicePrefLocal(localStorage.getItem("wc_voice_pref") ?? "male");
      setLangPrefLocal(localStorage.getItem("wc_language_pref") ?? "English");
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
        className="max-w-md font-body flex flex-col max-h-[90vh]"
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
        <div className="py-2 space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
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
          <div className="space-y-1.5">
            <Label className="text-sm font-medium font-body flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              AI Coach Voice
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="setprofile.toggle"
                onClick={() => {
                  setVoicePrefLocal("male");
                  localStorage.setItem("wc_voice_pref", "male");
                }}
                className={`flex-1 py-2 rounded-lg border text-sm font-body font-medium transition-all ${voicePrefLocal === "male" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/50"}`}
              >
                🎙️ Male
              </button>
              <button
                type="button"
                data-ocid="setprofile.toggle"
                onClick={() => {
                  setVoicePrefLocal("female");
                  localStorage.setItem("wc_voice_pref", "female");
                }}
                className={`flex-1 py-2 rounded-lg border text-sm font-body font-medium transition-all ${voicePrefLocal === "female" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/50"}`}
              >
                🎙️ Female
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium font-body flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              Preferred Language
            </Label>
            <Select
              value={langPrefLocal}
              onValueChange={(v) => {
                setLangPrefLocal(v);
                localStorage.setItem("wc_language_pref", v);
              }}
            >
              <SelectTrigger
                data-ocid="setprofile.select"
                className="font-body"
              >
                <SelectValue placeholder="Select language…" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "English",
                  "Telugu",
                  "Hindi",
                  "Kannada",
                  "Tamil",
                  "Marathi",
                  "Bengali",
                  "Odia",
                  "Spanish",
                  "French",
                  "Arabic",
                  "Chinese (Mandarin)",
                  "Portuguese",
                  "Russian",
                  "Japanese",
                  "German",
                  "Bahasa Indonesia",
                ].map((lang) => (
                  <SelectItem key={lang} value={lang} className="font-body">
                    {lang}
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
  const { t } = useLanguage();
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
              {t("landing_subline").slice(0, 50)}
            </span>

            <LanguageSelector />

            <FeedbackFormDialog />

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
                      data-ocid="profile.export_button"
                      onClick={() => {
                        const keys = [
                          "wc_chat_history",
                          "wc_scenario_history",
                          "wc_bookmarks",
                          "wc_journal",
                          "wc_practice_completions",
                          "wc_voice_pref",
                        ];
                        const data: Record<string, unknown> = {};
                        for (const k of keys) {
                          try {
                            data[k] = JSON.parse(
                              localStorage.getItem(k) ?? "null",
                            );
                          } catch {
                            data[k] = localStorage.getItem(k);
                          }
                        }
                        const blob = new Blob([JSON.stringify(data, null, 2)], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "workplace-compass-data.json";
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Data exported successfully.");
                      }}
                      className="gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Export My Data
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      data-ocid="profile.delete_button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "This will clear all your local coaching data (chats, scenarios, bookmarks, journal). This cannot be undone. Continue?",
                          )
                        ) {
                          for (const k of Object.keys(localStorage).filter(
                            (k) => k.startsWith("wc_"),
                          )) {
                            localStorage.removeItem(k);
                          }
                          window.location.reload();
                        }
                      }}
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All My Data
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
                {t("btn_login")}
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
            Professional coaching principles, always available
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight mb-4">
            {t("landing_headline").split(",")[0]},
            <br />
            <span className="text-primary">
              {t("landing_headline").split(",")[1] || "always in your corner"}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
            {t("landing_subline")}
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
      <DisclaimerModal />
    </div>
  );
}

// ─── Language Selector Component ─────────────────────────────────────────────

function LanguageSelector() {
  const { language, setLanguage, languageNames } = useLanguage();
  const langs = Object.entries(languageNames) as [
    import("./i18n/translations").LangCode,
    string,
  ][];

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <select
        value={language}
        onChange={(e) =>
          setLanguage(e.target.value as import("./i18n/translations").LangCode)
        }
        data-ocid="lang.select"
        className="text-sm font-body bg-transparent border border-border rounded-lg px-2 py-1 text-foreground cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring max-w-[130px]"
      >
        {langs.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
