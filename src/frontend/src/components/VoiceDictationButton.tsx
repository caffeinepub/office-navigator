import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceDictationButton({
  onTranscript,
  disabled,
}: VoiceDictationButtonProps) {
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    interimTranscript,
  } = useSpeechRecognition(onTranscript);

  if (!isSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={isListening ? "Recording... click to stop" : "Click to dictate"}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isListening
            ? "bg-destructive/10 border-destructive/40 text-destructive hover:bg-destructive/20"
            : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isListening && (
          <span className="absolute inset-0 rounded-xl animate-ping bg-destructive/20 pointer-events-none" />
        )}
        {isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
      {isListening && interimTranscript && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg px-2 py-1 text-xs text-muted-foreground font-body whitespace-nowrap max-w-[200px] truncate shadow-md z-50">
          {interimTranscript}
        </div>
      )}
    </div>
  );
}
