import fs from "fs/promises";
import pdfParse from "pdf-parse";
import axios from "axios";

function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((item) => item.length > 2)
  );
}

function heuristicScore(jobText, cvText) {
  const jobTokens = tokenize(jobText);
  const cvTokens = tokenize(cvText);
  const overlap = [...jobTokens].filter((token) => cvTokens.has(token));
  const ratio = jobTokens.size ? overlap.length / jobTokens.size : 0;
  const score = Math.min(100, Math.max(10, Math.round(ratio * 100)));

  return {
    score,
    summary: `Heuristic fallback scoring. Κοινές λέξεις-κλειδιά: ${overlap.slice(0, 20).join(", ") || "καμία εμφανής αντιστοίχιση"}.`
  };
}

async function readPdfText(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return data.text || "";
}

async function callOpenAI(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/responses",
    {
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const content = response.data.output
  ?.flatMap((item) => item.content || [])
  .find((item) => item.type === "output_text")
  ?.text;

if (!content) {
  console.error("Δεν βρέθηκε κείμενο στην απάντηση OpenAI:");
  console.error(JSON.stringify(response.data, null, 2));
  throw new Error("Η OpenAI δεν επέστρεψε αξιοποιήσιμο κείμενο.");
}

return content;;
}

async function callGemini(prompt) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") || "";
}

function parseModelResponse(text) {
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return {
      score: Number(parsed.score) || 0,
      summary: parsed.summary || "Δεν επιστράφηκε σύνοψη."
    };
  } catch {
    return {
      score: 0,
      summary: text.slice(0, 2000) || "Αδυναμία ανάλυσης απάντησης μοντέλου."
    };
  }
}

export async function evaluateApplication({ jobTitle, jobDescription, cvFilePath, provider: customProvider }) {
  const cvText = await readPdfText(cvFilePath);
  const prompt = `
Αξιολόγησε πόσο ταιριάζει το παρακάτω βιογραφικό με την αγγελία.
Επέστρεψε μόνο JSON της μορφής:
{"score": 0-100, "summary": "σύντομη αιτιολόγηση στα ελληνικά"}

Αγγελία:
Τίτλος: ${jobTitle}
Περιγραφή:
${jobDescription}

Βιογραφικό:
${cvText.slice(0, 12000)}
`;

  const provider = (customProvider || process.env.LLM_PROVIDER || "mock").toLowerCase();

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    const content = await callOpenAI(prompt);
    return parseModelResponse(content);
  }

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    const content = await callGemini(prompt);
    return parseModelResponse(content);
  }

  return heuristicScore(`${jobTitle} ${jobDescription}`, cvText);
}

