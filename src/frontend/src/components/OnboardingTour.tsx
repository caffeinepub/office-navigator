import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface OnboardingTourProps {
  onComplete: () => void;
  onOpenProfile: () => void;
}

const SAMPLE_QUESTIONS = [
  "My manager keeps undermining me in meetings. How do I handle it?",
  "I'm being asked to do work outside my role. What should I say?",
  "I feel stuck in my career and don't know my next move.",
];

const MINI_MATRIX = [
  ["Micromanaging?", "Unclear expectations?", "Promotion blocked?"],
  ["Conflict with peer?", "Unfair credit?", "Skillset gaps?"],
  ["Bureaucracy walls?", "Culture mismatch?", "Org restructuring?"],
];

const WHO_LABELS = ["Leader/Mgr", "Peer/Team", "System/Org"];
const WHAT_LABELS = ["Behavior", "Perception", "Career"];

const STEP_DOTS = [0, 1, 2, 3];

export function OnboardingTour({
  onComplete,
  onOpenProfile,
}: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const handleComplete = () => {
    localStorage.setItem("wc_onboarding_done", "true");
    onComplete();
  };

  const handleNext = () => {
    if (step === totalSteps - 1) {
      handleComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <Dialog open onOpenChange={() => handleComplete()}>
      <DialogContent
        className="max-w-lg font-body p-0 overflow-hidden"
        data-ocid="onboarding.dialog"
      >
        <div className="absolute top-4 right-12 z-10">
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body underline underline-offset-2"
            data-ocid="onboarding.close_button"
          >
            Skip Tour
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="p-6 pt-10"
          >
            {step === 0 && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-3">🧭</div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Welcome to Workplace Compass
                  </h2>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    Your private AI coaching partner for navigating workplace
                    challenges — with confidence, clarity, and care.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "🗺️ Matrix Navigation",
                    "💬 AI Coach Chat",
                    "📈 Growth Tracking",
                  ].map((pill) => (
                    <span
                      key={pill}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold font-body ring-1 ring-primary/20"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground font-body text-center">
                  🔒 All your data stays private on your device — nothing is
                  stored on our servers.
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-3">👤</div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Personalise Your Experience
                  </h2>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    Tell us your role, industry, and experience level so
                    coaching feels relevant and tailored specifically to you.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-body">
                  {[
                    { icon: "🏷️", label: "Your Role" },
                    { icon: "🏭", label: "Industry" },
                    { icon: "📊", label: "Experience" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg bg-muted/50 p-3 space-y-1"
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div className="font-semibold text-foreground">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  data-ocid="onboarding.primary_button"
                  onClick={() => {
                    onOpenProfile();
                    setStep(2);
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold gap-2"
                >
                  Set Up Profile
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-3">🗺️</div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Navigate with the Matrix
                  </h2>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    Select WHO you&apos;re dealing with and WHAT the challenge
                    is to get targeted coaching for your exact situation.
                  </p>
                </div>
                <div className="rounded-xl border border-border overflow-hidden text-xs font-body">
                  <div className="grid grid-cols-4">
                    <div className="bg-muted/60 p-2 font-semibold text-muted-foreground" />
                    {WHAT_LABELS.map((l) => (
                      <div
                        key={l}
                        className="bg-muted/60 p-2 font-semibold text-center text-muted-foreground text-[10px]"
                      >
                        {l}
                      </div>
                    ))}
                    {WHO_LABELS.map((who, ri) => (
                      <>
                        <div
                          key={who}
                          className="bg-muted/30 p-2 font-semibold text-muted-foreground text-[10px] flex items-center"
                        >
                          {who}
                        </div>
                        {MINI_MATRIX[ri].map((cell) => (
                          <div
                            key={cell}
                            className="p-2 text-center text-foreground/70 bg-card border-t border-l border-border/40 text-[9px] leading-tight"
                          >
                            {cell}
                          </div>
                        ))}
                      </>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-3">💬</div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Ask Anything, Anytime
                  </h2>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    Use the Ask Coach tab for open-ended questions. Here are a
                    few prompts to get started:
                  </p>
                </div>
                <div className="space-y-2">
                  {SAMPLE_QUESTIONS.map((q) => (
                    <div
                      key={q}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs font-body text-foreground"
                    >
                      &ldquo;{q}&rdquo;
                    </div>
                  ))}
                </div>
                <div className="text-center text-xs text-muted-foreground font-body">
                  🎉 You&apos;re all set! Start exploring Workplace Compass.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="px-6 pb-6 space-y-4">
          <div className="flex justify-center gap-1.5">
            {STEP_DOTS.map((dotIdx) => (
              <div
                key={dotIdx}
                className={`rounded-full transition-all duration-300 ${
                  dotIdx === step
                    ? "w-5 h-1.5 bg-primary"
                    : dotIdx < step
                      ? "w-1.5 h-1.5 bg-primary/40"
                      : "w-1.5 h-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                data-ocid="onboarding.secondary_button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 font-body"
              >
                Back
              </Button>
            )}
            <Button
              data-ocid="onboarding.primary_button"
              onClick={handleNext}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold"
            >
              {step === totalSteps - 1 ? "Get Started 🚀" : "Next →"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
