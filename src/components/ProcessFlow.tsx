import { FileText, Sparkles, HelpCircle, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: FileText, label: "Upload PDF", desc: "Drag & drop your document" },
  { icon: Sparkles, label: "AI Analysis", desc: "Text extraction & processing" },
  { icon: HelpCircle, label: "Get Results", desc: "Summary + interactive quiz" },
];

export function ProcessFlow() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 py-6">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3"
          >
            <step.icon className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </motion.div>
          {i < steps.length - 1 && (
            <ArrowDown className="h-4 w-4 text-muted-foreground sm:rotate-[-90deg]" />
          )}
        </div>
      ))}
    </div>
  );
}
