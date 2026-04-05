import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizViewProps {
  content: string;
  isStreaming: boolean;
}

export function QuizView({ content, isStreaming }: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  if (!content && !isStreaming) return null;

  let questions: Question[] = [];
  try {
    // Try to extract JSON from the content (it may have markdown wrapping)
    const jsonMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      questions = parsed.questions || [];
    }
  } catch {
    // Still streaming or invalid JSON
  }

  if (isStreaming && questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 md:p-8"
      >
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">
          Quiz
        </h2>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm" />
          <span>Generating questions…</span>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) return null;

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (revealed[qIdx]) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setRevealed((prev) => ({ ...prev, [qIdx]: true }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 md:p-8"
    >
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">
        Quiz
      </h2>
      <div className="space-y-8">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-3">
            <p className="font-medium text-foreground">
              {qIdx + 1}. {q.question}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[qIdx] === optIdx;
                const isCorrect = q.correct === optIdx;
                const isRevealed = revealed[qIdx];

                let optionClasses =
                  "p-3 rounded-lg border text-sm cursor-pointer transition-all text-left w-full ";
                if (isRevealed && isCorrect) {
                  optionClasses +=
                    "border-green-500 bg-green-500/10 text-foreground";
                } else if (isRevealed && isSelected && !isCorrect) {
                  optionClasses +=
                    "border-destructive bg-destructive/10 text-foreground";
                } else if (isSelected) {
                  optionClasses += "border-primary bg-primary/10 text-foreground";
                } else {
                  optionClasses +=
                    "border-border hover:border-primary/50 text-foreground";
                }

                return (
                  <button
                    key={optIdx}
                    className={optionClasses}
                    onClick={() => handleSelect(qIdx, optIdx)}
                  >
                    <span className="flex items-center justify-between">
                      {opt}
                      {isRevealed && isCorrect && (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                      {isRevealed && isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {revealed[qIdx] && q.explanation && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm text-muted-foreground bg-muted p-3 rounded-lg"
              >
                {q.explanation}
              </motion.p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
