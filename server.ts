import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy init Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Study Buddy "Kigozi" Endpoint
app.post("/api/ai/tutor-hint", async (req, res) => {
  try {
    const { question, studentAnswer, correctAnswer, subject, gradeLevel, concept } = req.body;
    
    const client = getGeminiClient();
    const systemPrompt = `You are "Kigozi", an encouraging, patient, and cheerful Ugandan primary school AI study tutor aligned with the Uganda National Curriculum Development Centre (NCDC).
Target audience: Ugandan primary school children (Grades ${gradeLevel || "P.4 - P.7"}).
Rules:
1. Explain warmly and simply using everyday Ugandan relatable examples (e.g. sharing Rolex/Matooke portions for fractions, traveling by Matatu between Kampala, Jinja, or Masaka for speed/time, planting groundnuts/cassava in the shamba for science).
2. NEVER give the direct final answer right away if the student got it wrong. Give a Socratic, gentle step-by-step hint to help them think and discover the answer.
3. If they got it right, praise them enthusiastically (e.g. "Webale nyo! Great job!", "Brilliant thinking, scholar!").
4. Keep the explanation short, clean, and bite-sized (2-3 short paragraphs max, easy to read on a mobile screen).`;

    const userPrompt = `Subject: ${subject}
Class: ${gradeLevel}
Topic/Concept: ${concept}
Question: ${question}
${studentAnswer ? `Student's submitted answer: ${studentAnswer}` : "Student asked for a hint on how to solve this."}
${correctAnswer ? `Correct answer (for reference): ${correctAnswer}` : ""}

Please provide an encouraging, easy-to-understand explanation or hint.`;

    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      text: response.text || "Keep going, scholar! You are making great progress.",
    });
  } catch (error: any) {
    console.error("Error generating tutor hint:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI tutor hint. Please try again.",
      fallback: "Here is a quick hint: Break the problem down into smaller steps. Review what each number represents, or think about how you would do this with real objects!",
    });
  }
});

// AI Parent Insights Generator
app.post("/api/ai/parent-insight", async (req, res) => {
  try {
    const { studentName, gradeLevel, stats, weakTopics, strongTopics } = req.body;
    const client = getGeminiClient();
    
    const prompt = `You are an educational psychologist and NCDC Uganda primary school advisor.
Analyze this Ugandan primary student's weekly learning data and generate:
1. A warm, encouraging executive summary for the parent (ROI of their time & progress).
2. 2 specific high-impact home activities or questions the parent can do with the child this week to bridge weak spots.
3. A projected PLE (Primary Leaving Examinations) trajectory statement.

Student Name: ${studentName || "The student"}
Class: ${gradeLevel || "P.6"}
Weekly Study Time: ${stats?.weeklyMinutes || 120} minutes
Accuracy / Mastery: ${stats?.masteryPercent || 78}%
Lessons Completed: ${stats?.lessonsCount || 14}
Streak: ${stats?.streak || 7} days
Strong Topics: ${(strongTopics || []).join(", ") || "General Arithmetic, Plant Biology"}
Areas Needing Focus: ${(weakTopics || []).join(", ") || "Long Division, Uganda Rivers & Lakes"}

Keep it concise, actionable, and inspiring for a busy Ugandan parent.`;

    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      insight: response.text || "Your child is showing remarkable consistency and mastery growth this week.",
    });
  } catch (error: any) {
    console.error("Error generating parent insight:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate parent insight.",
      insight: "Your child has demonstrated outstanding consistency this week! Practicing daily bite-sized math and science problems for 15 minutes is yielding significant retention gains towards PLE readiness.",
    });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Soma Ugandan Edutech platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
