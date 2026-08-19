import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { getUserRepos, getRepoCommits, getUserProfile, getRateLimitStatus } from "./github.js";
import { analyzeRepo, crossRepoConsistency, portfolioTimeline, looksLikeAssignment } from "./analyze.js";
import { generateTrustReport, verifyResumeClaims } from "./groq.js";
import { saveReport, getReport, listReportsForUser, listRecentReports, getLatestReportForUser, saveReview, listReviews } from "./db.js";
import { signupUser, loginUser, getMeFromToken } from "./auth.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

import fs from "fs";

const distPath = path.join(__dirname, "..", "..", "frontend", "dist");
const staticPath = fs.existsSync(distPath) ? distPath : path.join(__dirname, "..", "..", "frontend");
app.use(express.static(staticPath));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    githubTokenSet: !!process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "ghp_your_token_here",
    groqKeySet: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "gsk_your_key_here",
    databaseUrlSet: !!process.env.DATABASE_URL,
    version: "2.0.0",
    features: ["parallel_fetching", "hour_rhythm_signals", "interview_prompts", "report_caching", "deterministic_fallback", "pr_collaboration_index"]
  });
});

app.get("/api/rate-limit", async (req, res) => {
  try {
    const status = await getRateLimitStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper for bounded concurrency
async function asyncPool(limit, array, fn) {
  const ret = [];
  const executing = new Set();
  for (const item of array) {
    const p = Promise.resolve().then(() => fn(item));
    ret.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

app.post("/api/analyze", async (req, res) => {
  const { username, maxReposToAnalyze = 20, forceRefresh = false } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  const cleanUsername = username.trim().replace(/^@/, "");

  try {
    // 1. Check for 24-hour cache if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedRow = await getLatestReportForUser(cleanUsername);
        if (cachedRow) {
          const cacheAgeMs = Date.now() - new Date(cachedRow.created_at).getTime();
          const cacheAgeHours = cacheAgeMs / (1000 * 60 * 60);
          if (cacheAgeHours < 24) {
            return res.json({
              reportId: cachedRow.id,
              cached: true,
              cachedAt: cachedRow.created_at,
              ...cachedRow.report_json
            });
          }
        }
      } catch (cacheErr) {
        console.warn("Cache lookup warning:", cacheErr.message);
      }
    }

    const profile = await getUserProfile(cleanUsername);
    const allRepos = await getUserRepos(cleanUsername);

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

    async function analyzeGroupConcurrent(repoList, cap) {
      const targetSlice = repoList.slice(0, cap);
      const results = await asyncPool(5, targetSlice, async (repo) => {
        const [owner, repoName] = repo.full_name.split("/");
        try {
          const commits = await getRepoCommits(owner, repoName, 100);
          return { success: true, analysis: analyzeRepo(repo, commits, cleanUsername) };
        } catch (err) {
          return { success: false, repo: repo.full_name, reason: err.message };
        }
      });

      const analyses = [];
      const skipped = [];
      for (const r of results) {
        if (r.success) {
          analyses.push(r.analysis);
        } else {
          skipped.push({ repo: r.repo, reason: r.reason });
        }
      }
      return { analyses, skipped };
    }

    const standaloneResult = await analyzeGroupConcurrent(standaloneRepos, maxReposToAnalyze);
    const assignmentResult = await analyzeGroupConcurrent(assignmentRepos, maxReposToAnalyze);

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
      username: cleanUsername,
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
        interview_questions: ["Ask the candidate to explain their top public repository."],
        recommendation: "Review raw signal data manually below.",
      };
    }

    const fullReport = {
      username: cleanUsername,
      generatedAt: new Date().toISOString(),
      aiReport,
      rawAnalysis: analysisPayload,
    };

    let reportId = null;
    try {
      reportId = await saveReport(cleanUsername, fullReport);
    } catch (dbErr) {
      console.warn("Could not save report to DB:", dbErr.message);
    }

    res.json({ reportId, cached: false, ...fullReport });
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

// Public dashboard feed: most recent reports across everyone who has run an
// analysis. This is intentionally public — anyone who runs an analysis on a
// username should know the result may appear here.
app.get("/api/dashboard", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const reports = await listRecentReports(limit);
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Submit review & feedback
app.post("/api/reviews", async (req, res) => {
  try {
    const { username, rating, reviewerRole, comment, candidateAnalyzed } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and feedback comment are required." });
    }
    const review = await saveReview({
      username: username || "Anonymous Tester",
      rating: Number(rating),
      reviewerRole: reviewerRole || "Tester",
      comment,
      candidateAnalyzed: candidateAnalyzed || ""
    });
    res.json({ success: true, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List all community reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const reviews = await listReviews(limit);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Authentication Endpoints (DB + Bcrypt)
// ==========================================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await signupUser({ name, email, password, role });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const user = await getMeFromToken(token);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ==========================================
// Zero-Leakage Resume vs GitHub Claims Verifier
// ==========================================
app.post("/api/verify-resume", async (req, res) => {
  try {
    const { username, resumeText } = req.body;
    if (!username || !resumeText) {
      return res.status(400).json({ error: "Username and resume text are required." });
    }

    const cleanUsername = username.trim().replace(/^@/, "");
    
    // Fetch GitHub repos & profile
    const profile = await getUserProfile(cleanUsername);
    const repos = await getUserRepos(cleanUsername);

    const nonForkRepos = repos.filter(r => !r.fork && !r.archived);
    const assignmentRepos = nonForkRepos.filter(looksLikeAssignment);
    const standaloneRepos = nonForkRepos.filter(r => !looksLikeAssignment(r));

    const analysisPayload = {
      username: cleanUsername,
      profileCreatedAt: profile.created_at,
      totalNonForkRepos: nonForkRepos.length,
      repos: nonForkRepos.map(r => ({
        name: r.name,
        language: r.language,
        created_at: r.created_at,
        pushed_at: r.pushed_at,
        stargazers_count: r.stargazers_count,
        isAssignment: looksLikeAssignment(r)
      })),
      standaloneCount: standaloneRepos.length,
      assignmentCount: assignmentRepos.length
    };

    // Stateless AI verification with PII redaction
    const verificationReport = await verifyResumeClaims(resumeText, analysisPayload);

    res.json({
      success: true,
      username: cleanUsername,
      verifiedAt: new Date().toISOString(),
      report: verificationReport
    });
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