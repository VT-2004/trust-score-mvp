import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { getUserRepos, getRepoCommits, getUserProfile } from "./github.js";
import { analyzeRepo, crossRepoConsistency, portfolioTimeline, looksLikeAssignment } from "./analyze.js";
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
    databaseUrlSet: !!process.env.DATABASE_URL,
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

    const assignmentRepos = reposToConsider.filter(looksLikeAssignment);
    const standaloneRepos = reposToConsider.filter((r) => !looksLikeAssignment(r));

    if (assignmentRepos.length === 0 && standaloneRepos.length === 0) {
      return res.status(404).json({ error: "No substantive repos found to analyze." });
    }

    async function analyzeGroup(repoList, cap) {
      const analyses = [];
      const skipped = [];
      for (const repo of repoList.slice(0, cap)) {
        const [owner, repoName] = repo.full_name.split("/");
        try {
          const commits = await getRepoCommits(owner, repoName, 100);
          analyses.push(analyzeRepo(repo, commits, username));
        } catch (err) {
          skipped.push({ repo: repo.full_name, reason: err.message });
        }
      }
      return { analyses, skipped };
    }

    const standaloneResult = await analyzeGroup(standaloneRepos, maxReposToAnalyze);
    const assignmentResult = await analyzeGroup(assignmentRepos, maxReposToAnalyze);

    if (standaloneResult.analyses.length === 0 && assignmentResult.analyses.length === 0) {
      return res.status(404).json({
        error: "None of this user's repos could be analyzed (all were empty or inaccessible).",
      });
    }

    const standaloneConsistency =
      standaloneResult.analyses.length > 0
        ? crossRepoConsistency(standaloneResult.analyses, standaloneRepos.slice(0, maxReposToAnalyze))
        : null;
    const assignmentConsistency =
      assignmentResult.analyses.length > 0
        ? crossRepoConsistency(assignmentResult.analyses, assignmentRepos.slice(0, maxReposToAnalyze))
        : null;

    const timeline = portfolioTimeline(allRepos, profile.created_at);

    const analysisPayload = {
      username,
      profileCreatedAt: profile.created_at,
      publicRepoCount: profile.public_repos,
      totalNonForkRepos: allRepos.length,
      substantiveRepoCount: substantiveRepos.length,

      standaloneProjects: {
        repoCount: standaloneRepos.length,
        analyzedCount: standaloneResult.analyses.length,
        repoAnalyses: standaloneResult.analyses,
        skippedRepos: standaloneResult.skipped,
        consistency: standaloneConsistency,
      },
      assignmentRepos: {
        repoCount: assignmentRepos.length,
        analyzedCount: assignmentResult.analyses.length,
        repoAnalyses: assignmentResult.analyses,
        skippedRepos: assignmentResult.skipped,
        consistency: assignmentConsistency,
        note: "These are repos named/described like assignments — could be university coursework OR a real take-home test from a company. Scored separately since single-commit is expected either way, but the underlying code quality still matters.",
      },

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

    const reportId = await saveReport(username, fullReport);

    res.json({ reportId, ...fullReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/report/:id", async (req, res) => {
  try {
    const report = await getReport(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/reports/:username", async (req, res) => {
  try {
    res.json(await listReportsForUser(req.params.username));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nTrust Score MVP server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to use it.\n`);
});