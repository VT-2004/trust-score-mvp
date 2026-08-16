import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { getUserRepos, getRepoCommits, getUserProfile } from "./github.js";
import { analyzeRepo, crossRepoConsistency, portfolioTimeline } from "./analyze.js";
import { generateTrustReport } from "./groq.js";
import { saveReport, getReport, listReportsForUser } from "./db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    githubTokenSet: !!process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "ghp_your_token_here",
    groqKeySet: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "gsk_your_key_here",
  });
});

app.post("/api/analyze", async (req, res) => {
  const { username, maxReposToAnalyze = 20 } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    const profile = await getUserProfile(username);
    const allRepos = await getUserRepos(username);

    if (allRepos.length === 0) {
      return res.status(404).json({ error: "No public, non-fork repositories found for this user." });
    }

    const substantiveRepos = allRepos.filter((r) => r.size > 5);
    const reposToConsider = substantiveRepos.length > 0 ? substantiveRepos : allRepos;
    const reposToAnalyze = reposToConsider.slice(0, maxReposToAnalyze);

    const repoAnalyses = [];
    const skippedRepos = [];
    for (const repo of reposToAnalyze) {
      const [owner, repoName] = repo.full_name.split("/");
      try {
        const commits = await getRepoCommits(owner, repoName, 100);
        const analysis = analyzeRepo(repo, commits, username);
        repoAnalyses.push(analysis);
      } catch (err) {
        skippedRepos.push({ repo: repo.full_name, reason: err.message });
      }
    }

    if (repoAnalyses.length === 0) {
      return res.status(404).json({
        error:
          "None of this user's repos could be analyzed (all were empty or inaccessible). Try a user with more active repos.",
      });
    }

    const crossConsistency = crossRepoConsistency(repoAnalyses, reposToAnalyze);
    const timeline = portfolioTimeline(allRepos, profile.created_at);

    const analysisPayload = {
      username,
      profileCreatedAt: profile.created_at,
      publicRepoCount: profile.public_repos,
      totalNonForkRepos: allRepos.length,
      substantiveRepoCount: substantiveRepos.length,
      reposAnalyzed: repoAnalyses.length,
      repoAnalyses,
      skippedRepos,
      crossRepoConsistency: crossConsistency,
      portfolioTimeline: timeline,
    };

    let aiReport;
    try {
      aiReport = await generateTrustReport(analysisPayload);
    } catch (aiError) {
      aiReport = {
        overall_summary: `AI reasoning layer unavailable: ${aiError.message}`,
        confidence_level: "unavailable",
        positive_signals: [],
        worth_reviewing: [],
        recommendation: "Review raw signal data manually below.",
      };
    }

    const fullReport = {
      username,
      generatedAt: new Date().toISOString(),
      aiReport,
      rawAnalysis: analysisPayload,
    };

    const reportId = saveReport(username, fullReport);

    res.json({ reportId, ...fullReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/report/:id", (req, res) => {
  const report = getReport(req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.json(report);
});

app.get("/api/reports/:username", (req, res) => {
  res.json(listReportsForUser(req.params.username));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nTrust Score MVP server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to use it.\n`);
});