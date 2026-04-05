import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PDFUpload } from "@/components/PDFUpload";
import { SummaryView } from "@/components/SummaryView";
import { QuizView } from "@/components/QuizView";
import { ProcessFlow } from "@/components/ProcessFlow";
import { extractTextFromPDF } from "@/lib/pdfExtractor";
import { streamAI } from "@/lib/streamAI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, HelpCircle } from "lucide-react";

type Stage = "idle" | "extracting" | "summarizing" | "quizzing" | "done";

const Index = () => {
  const [stage, setStage] = useState<Stage>("idle");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState("");
  const [isSummaryStreaming, setIsSummaryStreaming] = useState(false);
  const [isQuizStreaming, setIsQuizStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const handleFile = async (file: File) => {
    setSummary("");
    setQuiz("");
    setActiveTab("summary");

    try {
      // Step 1: Extract text
      setStage("extracting");
      toast.info("Extracting text from PDF…");
      const text = await extractTextFromPDF(file);

      if (!text.trim()) {
        toast.error("Could not extract text. The PDF may be scanned/image-based.");
        setStage("idle");
        return;
      }

      // Step 2: Generate summary
      setStage("summarizing");
      setIsSummaryStreaming(true);
      toast.info("Generating summary…");

      await streamAI({
        text,
        mode: "summary",
        onDelta: (chunk) => setSummary((prev) => prev + chunk),
        onDone: () => setIsSummaryStreaming(false),
      });

      // Step 3: Generate quiz
      setStage("quizzing");
      setIsQuizStreaming(true);
      toast.info("Generating quiz…");

      await streamAI({
        text,
        mode: "quiz",
        onDelta: (chunk) => setQuiz((prev) => prev + chunk),
        onDone: () => setIsQuizStreaming(false),
      });

      setStage("done");
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
      setStage("idle");
      setIsSummaryStreaming(false);
      setIsQuizStreaming(false);
    }
  };

  const isProcessing = stage !== "idle" && stage !== "done";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Doc<span className="text-primary">Digest</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
            Upload a PDF. Get an instant AI summary and interactive quiz.
          </p>
        </motion.div>

        {/* Process Flow */}
        <ProcessFlow />

        {/* Upload */}
        <div className="mt-8">
          <PDFUpload onFileSelected={handleFile} isProcessing={isProcessing} />
        </div>

        {/* Status */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            {stage === "extracting" && "Extracting text from PDF…"}
            {stage === "summarizing" && "AI is reading your document…"}
            {stage === "quizzing" && "Generating quiz questions…"}
          </motion.div>
        )}

        {/* Results */}
        {(summary || quiz) && (
          <div className="mt-10">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Quiz
                </TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="mt-4">
                <SummaryView content={summary} isStreaming={isSummaryStreaming} />
              </TabsContent>
              <TabsContent value="quiz" className="mt-4">
                <QuizView content={quiz} isStreaming={isQuizStreaming} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
