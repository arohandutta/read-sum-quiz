import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface SummaryViewProps {
  content: string;
  isStreaming: boolean;
}

export function SummaryView({ content, isStreaming }: SummaryViewProps) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 md:p-8"
    >
      <h2 className="font-display text-2xl font-bold text-foreground mb-4">
        Summary
      </h2>
      <div className="prose prose-sm max-w-none text-card-foreground prose-headings:font-display prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 rounded-sm" />
      )}
    </motion.div>
  );
}
