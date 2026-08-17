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

// Serve the simple frontend
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    githubTokenSet: !!process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "ghp_your_token_here",
    groqKeySet: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "gsk_your_key_here",
  });
});

// Main analysis endpoint: given a GitHub username, build a full trust report
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

    // Filter out trivially small repos (near-empty, size in KB from GitHub API)
    // before spending time analyzing them — keeps the score meaningful instead of
    // diluted by placeholder/empty repos.
    const substantiveRepos = allRepos.filter((r) => r.size > 5); // >5KB rules out empty/README-only repos
    const reposToConsider = substantiveRepos.length > 0 ? substantiveRepos : allRepos;

    // Split into coursework/assignment-style repos vs standalone projects.
    // Both get scored — but SEPARATELY and shown separately. An "-Assignment" repo
    // could be university coursework, or it could be a real take-home test from a
    // company (which is a genuinely strong signal). We don't guess which; we just
    // avoid mixing the two into one misleading blended number.
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
      publicRepoCount: profile.public_repos,          // GitHub's own total (includes forks/archived)
      totalNonForkRepos: allRepos.length,               // all non-fork repos found
      substantiveRepoCount: substantiveRepos.length,     // repos worth analyzing (not near-empty)

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

    // AI reasoning layer (Groq)
    let aiReport;
    try {
      aiReport = await generateTrustReport(analysisPayload);
    } catch (aiError) {
      // Degrade gracefully: still return the raw signal data even if AI layer fails
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

// Fetch a previously generated report by ID (for shareable links)
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