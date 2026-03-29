import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

const DISCLAIMER_KEY = "wc_disclaimer_accepted";

export function DisclaimerModal() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(DISCLAIMER_KEY) !== "true";
    } catch {
      return true;
    }
  });

  const handleAccept = () => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="max-w-lg font-body"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        data-ocid="disclaimer.dialog"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl font-bold text-foreground leading-snug">
              Before You Begin — Important Notice
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm text-foreground/80 font-body leading-relaxed">
          <p>
            Workplace Compass provides general informational content and
            AI-generated suggestions for{" "}
            <strong>educational and self-reflection purposes only</strong>. It
            does not constitute professional legal, HR, psychological, medical,
            or career advice.
          </p>
          <p>
            All suggestions, guidance, and coaching responses are provided{" "}
            <strong>strictly at your own discretion and risk</strong>. You are
            solely responsible for any decisions, actions, or outcomes that
            arise from your use of this tool.
          </p>
          <p>
            Workplace Compass, its creators, and associated parties{" "}
            <strong>accept no liability whatsoever</strong> for any direct,
            indirect, incidental, or consequential outcomes resulting from
            reliance on the content provided.
          </p>
          <p className="text-foreground/60 text-xs border-t border-border/40 pt-3">
            By using this tool, you acknowledge and agree to these terms.
          </p>
        </div>

        <DialogFooter>
          <Button
            data-ocid="disclaimer.confirm_button"
            onClick={handleAccept}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold h-11 rounded-xl gap-2"
          >
            <ShieldCheck className="w-4 h-4" />I Understand &amp; Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
