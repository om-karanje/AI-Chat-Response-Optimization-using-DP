import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../public"));

let chatHistory = [];

// token func
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// lcs matrix
function lcsMatrix(a, b) {
  const n = a.length;
  const m = b.length;

  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

// length of lcs
function lcs(a, b) {
  const dp = lcsMatrix(a, b);
  return dp[a.length][b.length];
}

// importance calculation func
function calculateImportance(msg, query, index) {
  let score = 1;

  const similarity = lcs(msg.text.toLowerCase(), query.toLowerCase());
  score += similarity;

  score += index * 1.5;

  return score;
}

// relevance
function isRelevant(msg, query) {
  const similarity = lcs(msg.text.toLowerCase(), query.toLowerCase());
  return similarity > 3;
}

// func to run cpp file
function runCPP(messages, maxTokens) {
  return new Promise((resolve, reject) => {
    let input = `${messages.length} ${maxTokens}\n`;

    messages.forEach(m => {
      input += `${m.tokens} ${Math.floor(m.importance)} ${m.text}\n`;
    });

    const process = exec(".\\dp.exe", (error, stdout) => {
      if (error) return reject(error);

      const lines = stdout.trim().split("\n");

      let table = [];
      let selected = [];
      let mode = "";

      lines.forEach(line => {
        line = line.trim();

        if (line === "TABLE") mode = "table";
        else if (line === "SELECTED") mode = "selected";
        else if (mode === "table") {
          table.push(line.split(/\s+/).map(Number));
        } else if (mode === "selected") {
          selected = line.split(/\s+/).map(Number);
        }
      });

      resolve({ table, selected });
    });

    process.stdin.write(input);
    process.stdin.end();
  });
}

// ai chat
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  chatHistory.push({ text: message, role: "user" });

  const maxTokens = 300;

  const recentHistory = chatHistory.slice(-5);

  const filteredHistory = chatHistory.filter(msg =>
    isRelevant(msg, message)
  );

  const baseHistory = [...new Map(
    [...filteredHistory, ...recentHistory].map(m => [m.text, m])
  ).values()];

  const enriched = baseHistory.map((msg, i) => ({
    ...msg,
    tokens: estimateTokens(msg.text),
    importance: calculateImportance(msg, message, i)
  }));

  try {
    const result = await runCPP(enriched, maxTokens);

    const selectedMessages = result.selected.map(i => ({
      ...enriched[i],
      similarity: lcs(enriched[i].text.toLowerCase(), message.toLowerCase())
    }));

    const finalSelected =
      selectedMessages.length > 0
        ? selectedMessages
        : baseHistory.slice(-2);

    // lcs matrix for first selected context
    const lcsMat = lcsMatrix(
      message.toLowerCase(),
      finalSelected[0]?.text.toLowerCase() || ""
    );

    // prompt to ai
    const contextText =
      "You are a helpful assistant.\n\n" +
      "Answer the CURRENT question using previous context if needed.\n\n" +
      "Conversation:\n" +
      finalSelected.map(m => m.text).join("\n") +
      "\n\nCurrent question:\n" +
      message;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [{ role: "user", content: contextText }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    chatHistory.push({ text: reply, role: "assistant" });

    res.json({
      reply,
      selected: finalSelected,
      dpTable: result.table.length > 0 ? result.table : null,
      lcsMatrix: lcsMat
    });

  } catch (err) {
    console.error(err.message);
    res.json({ reply: "Error occurred", selected: [], dpTable: null, lcsMatrix: null });
  }
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);