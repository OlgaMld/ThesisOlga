import axios from "axios";
import fs from "fs/promises";
import pdfParse from "pdf-parse";

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

function extractOpenAIText(data) {
  if (!data) return "";

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];
  const textParts = [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        textParts.push(part.text);
      } else if (part?.type === "text" && typeof part.text === "string") {
        textParts.push(part.text);
      }
    }
  }

  return textParts.join("\n");
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

  return extractOpenAIText(response.data);
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

async function callAnthropic(prompt) {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": process.env.ANTHROPIC_VERSION || "2023-06-01",
        "Content-Type": "application/json"
      }
    }
  );

  const content = response.data.content || [];
  return content
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("\n");
}

async function callMistral(prompt) {
  const response = await axios.post(
    "https://api.mistral.ai/v1/chat/completions",
    {
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      max_tokens: 1024,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const output = response.data.choices?.[0]?.message?.content;
  if (Array.isArray(output)) {
    return output.map((part) => part.text || "").join("\n");
  }

  return output || "";
}

function extractProviderError(error) {
  const responseData = error?.response?.data;
  const apiMessage = responseData?.error?.message || responseData?.message || responseData?.error || error?.message || "Άγνωστο σφάλμα provider.";
  const rawStatus = error?.response?.status || error?.status || "unknown";

  if (typeof apiMessage === "string") {
    return `[${rawStatus}] ${apiMessage}`;
  }

  return `[${rawStatus}] ${JSON.stringify(apiMessage).slice(0, 500)}`;
}

function logProviderFailure(provider, error) {
  const status = error?.response?.status || "unknown";
  const detail = error?.response?.data || error?.message || "No details";
  console.warn(`[LLM Provider Failure] ${provider}: status=${status} detail=${JSON.stringify(detail).slice(0, 500)}`);
}

async function testProviderHealth(provider) {
  const prompt = "Reply with OK.";

  if (provider === "openai") {
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

    return response.status === 200 ? { ok: true } : { ok: false, status: response.status };
  }

  if (provider === "gemini") {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    return response.status === 200 ? { ok: true } : { ok: false, status: response.status };
  }

  if (provider === "claude") {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 8,
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": process.env.ANTHROPIC_VERSION || "2023-06-01",
          "Content-Type": "application/json"
        }
      }
    );

    return response.status === 200 ? { ok: true } : { ok: false, status: response.status };
  }

  if (provider === "mistral") {
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: process.env.MISTRAL_MODEL || "mistral-small-latest",
        max_tokens: 8,
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.status === 200 ? { ok: true } : { ok: false, status: response.status };
  }

  return { ok: false, status: "unsupported" };
}

export async function getProviderHealthStatus() {
  const providers = [
    { key: "openai", label: "OpenAI" },
    { key: "gemini", label: "Gemini" },
    { key: "claude", label: "Claude" },
    { key: "mistral", label: "Mistral" }
  ];

  const entries = [];

  for (const provider of providers) {
    const envKeyMap = {
      openai: "OPENAI_API_KEY",
      gemini: "GEMINI_API_KEY",
      claude: "ANTHROPIC_API_KEY",
      mistral: "MISTRAL_API_KEY"
    };

    const apiKey = process.env[envKeyMap[provider.key]];

    if (!apiKey) {
      entries.push({ key: provider.key, label: provider.label, enabled: false, ok: false, status: "missing_key" });
      continue;
    }

    try {
      const result = await testProviderHealth(provider.key);
      entries.push({
        key: provider.key,
        label: provider.label,
        enabled: true,
        ok: Boolean(result.ok),
        status: result.ok ? "ok" : String(result.status || "error")
      });
    } catch (error) {
      entries.push({
        key: provider.key,
        label: provider.label,
        enabled: true,
        ok: false,
        status: String(error?.response?.status || "error"),
        detail: error?.response?.data || error?.message || "Unknown provider error"
      });
    }
  }

  return entries;
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

  try {
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      const content = await callOpenAI(prompt);
      return parseModelResponse(content);
    }

    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      const content = await callGemini(prompt);
      return parseModelResponse(content);
    }

    if (provider === "claude" && process.env.ANTHROPIC_API_KEY) {
      const content = await callAnthropic(prompt);
      return parseModelResponse(content);
    }

    if (provider === "mistral" && process.env.MISTRAL_API_KEY) {
      const content = await callMistral(prompt);
      return parseModelResponse(content);
    }
  } catch (error) {
    const fallback = heuristicScore(`${jobTitle} ${jobDescription}`, cvText);
    logProviderFailure(provider, error);
    return {
      ...fallback,
      providerError: extractProviderError(error)
    };
  }

  return heuristicScore(`${jobTitle} ${jobDescription}`, cvText);
}

