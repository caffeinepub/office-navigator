import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Brain,
  Building2,
  GraduationCap,
  Grid3X3,
  MessageCircle,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { ChatEntry, Scenario } from "../backend.d";
import { MatrixType, MatrixWho } from "../hooks/useQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GrowthPathSectionProps {
  submissions: Scenario[];
  chats: ChatEntry[];
  practiceCount?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WHO_LABELS: Record<MatrixWho, string> = {
  [MatrixWho.leaderManager]: "Leader",
  [MatrixWho.peerTeam]: "Peer / Team",
  [MatrixWho.systemOrg]: "System / Org",
};

const TYPE_LABELS: Record<MatrixType, string> = {
  [MatrixType.behaviorActionable]: "Behavior",
  [MatrixType.perceptionMindset]: "Mindset",
  [MatrixType.careerGrowth]: "Career",
};

const WHO_ICON = {
  [MatrixWho.leaderManager]: <User className="w-3 h-3" />,
  [MatrixWho.peerTeam]: <Users className="w-3 h-3" />,
  [MatrixWho.systemOrg]: <Building2 className="w-3 h-3" />,
};

const ALL_WHO = [
  MatrixWho.leaderManager,
  MatrixWho.peerTeam,
  MatrixWho.systemOrg,
];
const ALL_TYPE = [
  MatrixType.behaviorActionable,
  MatrixType.perceptionMindset,
  MatrixType.careerGrowth,
];

function formatRelativeTime(timestamp: bigint | number): string {
  const ts =
    typeof timestamp === "bigint" ? Number(timestamp) / 1_000_000 : timestamp;
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Badge Definitions ───────────────────────────────────────────────────────

interface BadgeDef {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  check: (s: Scenario[], c: ChatEntry[]) => boolean;
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first_step",
    icon: <Star className="w-5 h-5" />,
    label: "First Step",
    description: "Submitted your first scenario",
    check: (s) => s.length >= 1,
  },
  {
    id: "deep_thinker",
    icon: <Brain className="w-5 h-5" />,
    label: "Deep Thinker",
    description: "Asked 3+ coach questions",
    check: (_, c) => c.length >= 3,
  },
  {
    id: "explorer",
    icon: <Target className="w-5 h-5" />,
    label: "Explorer",
    description: "Explored 3+ matrix cells",
    check: (s) => {
      const cells = new Set(s.map((sc) => `${sc.who}-${sc.challengeType}`));
      return cells.size >= 3;
    },
  },
  {
    id: "coach_companion",
    icon: <Zap className="w-5 h-5" />,
    label: "Coach's Companion",
    description: "10+ total coaching interactions",
    check: (s, c) => s.length + c.length >= 10,
  },
  {
    id: "growth_champion",
    icon: <Trophy className="w-5 h-5" />,
    label: "Growth Champion",
    description: "All 9 matrix cells explored",
    check: (s) => {
      const cells = new Set(s.map((sc) => `${sc.who}-${sc.challengeType}`));
      return cells.size >= 9;
    },
  },
];

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-card border border-border shadow rounded-2xl p-4 flex flex-col gap-2"
      data-ocid="growth.card"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="font-body text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

// ─── Confidence Journey ──────────────────────────────────────────────────────

interface ConfidenceEntry {
  date: string;
  pre: number;
  post: number;
}

function ConfidenceJourney() {
  const entries: ConfidenceEntry[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("wc_confidence_log") ?? "[]");
    } catch {
      return [];
    }
  })();

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="bg-card border border-border shadow rounded-2xl p-5 mb-6"
        data-ocid="growth.panel"
      >
        <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-3">
          Confidence Journey
        </p>
        <div
          data-ocid="growth.empty_state"
          className="text-center py-8 border border-dashed border-border rounded-xl"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
            <Star className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            No confidence data yet.
          </p>
          <p className="font-body text-xs text-muted-foreground/70 mt-1">
            Rate your confidence before/after coaching sessions to track growth
            here.
          </p>
        </div>
      </motion.div>
    );
  }

  const recent = entries.slice(-10);
  const maxVal = 10;
  const chartH = 120;
  const chartW = 400;
  const padL = 28;
  const padB = 20;
  const padR = 10;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padB;
  const n = recent.length;

  const xPos = (i: number) =>
    padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yPos = (val: number) => plotH - (val / maxVal) * plotH;

  const prePoints = recent.map((e, i) => `${xPos(i)},${yPos(e.pre)}`).join(" ");
  const postPoints = recent
    .map((e, i) => `${xPos(i)},${yPos(e.post)}`)
    .join(" ");

  const avgPre =
    Math.round((recent.reduce((s, e) => s + e.pre, 0) / n) * 10) / 10;
  const avgPost =
    Math.round((recent.reduce((s, e) => s + e.post, 0) / n) * 10) / 10;
  const improvement = Math.round((avgPost - avgPre) * 10) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      className="bg-card border border-border shadow rounded-2xl p-5 mb-6"
      data-ocid="growth.panel"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
          Confidence Journey
        </p>
        <div className="flex gap-3 text-xs font-body">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-blue-400 rounded" />
            Pre ({avgPre})
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-emerald-500 rounded" />
            Post ({avgPost})
          </span>
          {improvement > 0 && (
            <span className="text-emerald-600 font-semibold">
              +{improvement} avg boost
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full"
          style={{ minWidth: "280px" }}
        >
          <title>Confidence journey: pre and post session scores</title>
          {/* Y-axis gridlines */}
          {[2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={yPos(v)}
                x2={chartW - padR}
                y2={yPos(v)}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
              <text
                x={padL - 4}
                y={yPos(v) + 3}
                textAnchor="end"
                fontSize="8"
                fill="currentColor"
                fillOpacity="0.4"
              >
                {v}
              </text>
            </g>
          ))}
          {/* Pre line */}
          <polyline
            points={prePoints}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Post line */}
          <polyline
            points={postPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Dots */}
          {recent.map((e, i) => (
            <g key={`dot-${e.date}-${i}`}>
              <circle cx={xPos(i)} cy={yPos(e.pre)} r="3" fill="#60a5fa" />
              <circle cx={xPos(i)} cy={yPos(e.post)} r="3" fill="#10b981" />
            </g>
          ))}
          {/* X-axis labels */}
          {recent.map((e, i) => (
            <text
              key={`label-${e.date}-${i}`}
              x={xPos(i)}
              y={chartH - 4}
              textAnchor="middle"
              fontSize="7"
              fill="currentColor"
              fillOpacity="0.4"
            >
              {new Date(e.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </text>
          ))}
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Emerging Strengths (inline mini) ────────────────────────────────────────

const STRENGTH_KEYWORDS: { name: string; icon: string; keywords: string[] }[] =
  [
    {
      name: "Communication",
      icon: "💬",
      keywords: [
        "speak",
        "voice",
        "message",
        "express",
        "explain",
        "present",
        "articulate",
        "conversation",
        "discuss",
        "communicate",
        "words",
        "tone",
      ],
    },
    {
      name: "Resilience",
      icon: "💪",
      keywords: [
        "bounce back",
        "pressure",
        "stress",
        "difficult",
        "tough",
        "challenge",
        "setback",
        "recover",
        "persist",
        "keep going",
        "despite",
        "overwhelm",
      ],
    },
    {
      name: "Leadership",
      icon: "🧭",
      keywords: [
        "lead",
        "direction",
        "vision",
        "guide",
        "mentor",
        "inspire",
        "team",
        "delegate",
        "decision",
        "influence",
        "ownership",
        "accountable",
      ],
    },
    {
      name: "Empathy",
      icon: "🤝",
      keywords: [
        "feel",
        "understand",
        "listen",
        "support",
        "care",
        "concern",
        "emotional",
        "colleague",
        "perspective",
        "relate",
        "compassion",
      ],
    },
    {
      name: "Problem Solving",
      icon: "🔍",
      keywords: [
        "solve",
        "fix",
        "issue",
        "root cause",
        "analyze",
        "figure out",
        "approach",
        "solution",
        "resolve",
        "troubleshoot",
        "plan",
      ],
    },
    {
      name: "Adaptability",
      icon: "🔄",
      keywords: [
        "change",
        "adapt",
        "new",
        "shift",
        "flexible",
        "adjust",
        "pivot",
        "uncertain",
        "transition",
        "evolve",
        "different",
      ],
    },
    {
      name: "Collaboration",
      icon: "🌐",
      keywords: [
        "together",
        "collaborate",
        "team",
        "partner",
        "align",
        "coordinate",
        "contribute",
        "joint",
        "work with",
        "group",
      ],
    },
    {
      name: "Initiative",
      icon: "🚀",
      keywords: [
        "proactive",
        "volunteer",
        "step up",
        "without being asked",
        "took initiative",
        "started",
        "drive",
        "push forward",
        "go beyond",
      ],
    },
    {
      name: "Emotional Intelligence",
      icon: "🧠",
      keywords: [
        "manage emotions",
        "self-aware",
        "regulate",
        "calm",
        "patience",
        "composed",
        "reaction",
        "trigger",
        "feelings",
      ],
    },
    {
      name: "Strategic Thinking",
      icon: "♟️",
      keywords: [
        "long term",
        "big picture",
        "strategy",
        "prioritize",
        "plan ahead",
        "goal",
        "vision",
        "outcome",
        "roadmap",
        "future",
      ],
    },
  ];

function getTopStrengths(
  submissions: Scenario[],
  chats: ChatEntry[],
  limit: number,
) {
  const texts = [
    ...chats.map((c) => c.question),
    ...submissions.map((s) => s.text),
  ]
    .join(" ")
    .toLowerCase();

  return STRENGTH_KEYWORDS.map((cat) => ({
    ...cat,
    score: Math.min(
      100,
      cat.keywords.filter((kw) => texts.includes(kw)).length * 15,
    ),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function GrowthPathSection({
  submissions,
  chats,
  practiceCount = 0,
}: GrowthPathSectionProps) {
  // Compute explored cells
  const exploredCells = new Set(
    submissions
      .filter(
        (s) =>
          s.who !== null &&
          s.who !== undefined &&
          s.challengeType !== null &&
          s.challengeType !== undefined,
      )
      .map((s) => `${s.who}-${s.challengeType}`),
  );

  const totalInteractions = submissions.length + chats.length;
  const cellsUnlocked = exploredCells.size;
  const progressPct = Math.round((cellsUnlocked / 9) * 100);

  // Timeline — merge and sort by timestamp
  type TimelineItem =
    | { kind: "scenario"; item: Scenario; ts: number }
    | { kind: "chat"; item: ChatEntry; ts: number };

  const timelineItems: TimelineItem[] = [
    ...submissions.map((s) => ({
      kind: "scenario" as const,
      item: s,
      ts:
        typeof s.timestamp === "bigint"
          ? Number(s.timestamp) / 1_000_000
          : Number(s.timestamp),
    })),
    ...chats.map((c) => ({
      kind: "chat" as const,
      item: c,
      ts:
        typeof c.timestamp === "bigint"
          ? Number(c.timestamp) / 1_000_000
          : Number(c.timestamp),
    })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 8);

  const earnedCount = BADGE_DEFS.filter((b) =>
    b.check(submissions, chats),
  ).length;

  return (
    <section data-ocid="growth.section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">
            Your Growth Path
          </h2>
        </div>
        <Badge variant="outline" className="font-body text-xs gap-1">
          <Award className="w-3 h-3" />
          {earnedCount} / {BADGE_DEFS.length} badges
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          icon={<Grid3X3 className="w-4 h-4" />}
          label="Scenarios"
          value={submissions.length}
          sub="matrix paths explored"
          delay={0}
        />
        <StatCard
          icon={<MessageCircle className="w-4 h-4" />}
          label="Questions Asked"
          value={chats.length}
          sub="free-form coaching chats"
          delay={0.05}
        />
        <StatCard
          icon={<Target className="w-4 h-4" />}
          label="Cells Unlocked"
          value={`${cellsUnlocked} / 9`}
          sub={`${progressPct}% of matrix covered`}
          delay={0.1}
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Total Sessions"
          value={totalInteractions}
          sub="all coaching interactions"
          delay={0.15}
        />
        <StatCard
          icon={<GraduationCap className="w-4 h-4" />}
          label="Scenarios Practised"
          value={practiceCount}
          sub="practice scenarios completed"
          delay={0.2}
        />
      </div>

      {/* Matrix Coverage + Badges side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 3×3 Matrix Coverage Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="bg-card border border-border shadow rounded-2xl p-5"
          data-ocid="growth.panel"
        >
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Matrix Coverage
          </p>
          <div className="mb-3">
            <div className="flex justify-between text-xs font-body text-muted-foreground mb-1">
              <span>{cellsUnlocked} of 9 cells explored</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
          {/* Column headers: WHO */}
          <div className="grid grid-cols-4 gap-1 text-center">
            <div />
            {ALL_WHO.map((who) => (
              <div
                key={who}
                className="text-xs font-body font-semibold text-muted-foreground pb-1 flex flex-col items-center gap-0.5"
              >
                <span className="text-primary">{WHO_ICON[who]}</span>
                <span className="leading-none" style={{ fontSize: "0.65rem" }}>
                  {WHO_LABELS[who]}
                </span>
              </div>
            ))}
            {/* Rows: TYPE */}
            {ALL_TYPE.map((type) => (
              <>
                <div
                  key={`label-${type}`}
                  className="text-right pr-1 flex items-center justify-end"
                >
                  <span
                    className="text-xs font-body font-semibold text-muted-foreground leading-none"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {TYPE_LABELS[type]}
                  </span>
                </div>
                {ALL_WHO.map((who) => {
                  const key = `${who}-${type}`;
                  const explored = exploredCells.has(key);
                  return (
                    <div
                      key={key}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-body transition-all ${
                        explored
                          ? "bg-primary/20 border border-primary text-primary font-semibold"
                          : "bg-muted/40 border border-border/40 text-muted-foreground/40"
                      }`}
                      data-ocid="growth.row"
                    >
                      {explored ? "✓" : "·"}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </motion.div>

        {/* Milestone Badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="bg-card border border-border shadow rounded-2xl p-5"
          data-ocid="growth.panel"
        >
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Milestone Badges
          </p>
          <div className="space-y-3">
            {BADGE_DEFS.map((badge, i) => {
              const earned = badge.check(submissions, chats);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                    earned
                      ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                      : "bg-muted/30 border border-border/40"
                  }`}
                  data-ocid={`growth.item.${i + 1}`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      earned
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                        : "bg-muted text-muted-foreground/40"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`font-body text-sm font-semibold ${
                        earned
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {badge.label}
                    </p>
                    <p className="font-body text-xs text-muted-foreground/70 truncate">
                      {badge.description}
                    </p>
                  </div>
                  {earned && (
                    <span className="ml-auto text-amber-500 flex-shrink-0">
                      <Award className="w-4 h-4" />
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Timeline */}
      {timelineItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="bg-card border border-border shadow rounded-2xl p-5"
          data-ocid="growth.list"
        >
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Recent Activity
          </p>
          <div className="space-y-2">
            {timelineItems.map((item, i) => {
              const isScenario = item.kind === "scenario";
              const text = isScenario
                ? (item.item as Scenario).text
                : (item.item as ChatEntry).question;
              return (
                <motion.div
                  key={`${item.kind}-${i}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.25 }}
                  className="flex items-start gap-3 py-2 border-l-2 border-primary/30 pl-3"
                  data-ocid={`growth.item.${i + 1}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isScenario
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {isScenario ? (
                      <Grid3X3 className="w-3 h-3" />
                    ) : (
                      <MessageCircle className="w-3 h-3" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm text-foreground leading-snug line-clamp-1">
                      {text}
                    </p>
                    <p className="font-body text-xs text-muted-foreground/70 mt-0.5">
                      {isScenario ? "Matrix scenario" : "Coach chat"} ·{" "}
                      {formatRelativeTime(item.ts)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Confidence Journey */}
      <ConfidenceJourney />

      {/* Empty state */}
      {totalInteractions === 0 && (
        <div
          data-ocid="growth.empty_state"
          className="text-center py-16 border border-dashed border-border rounded-2xl"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Rocket className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            Your growth journey starts here.
          </p>
          <p className="font-body text-xs text-muted-foreground/70 mt-1">
            Use the matrix or Ask Coach above to begin tracking your progress.
          </p>
        </div>
      )}

      {/* Emerging Strengths Preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className="bg-card border border-border shadow rounded-2xl p-5 mt-6"
        data-ocid="growth.panel"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
            Emerging Strengths
          </p>
        </div>
        {totalInteractions < 3 ? (
          <p className="font-body text-sm text-muted-foreground italic">
            Complete 3+ sessions to unlock
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {getTopStrengths(submissions, chats, 3).map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 font-body"
              >
                {s.icon} {s.name}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
