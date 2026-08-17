// Computes rule-based authenticity signals from repo + commit data.
// These are the "hard" numeric signals that feed into the AI reasoning layer.
// IMPORTANT: none of these prove fraud on their own — they're consistency signals,
// always presented with reasoning, never as a standalone accusation.

function daysBetween(a, b) {
  return Math.abs(new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24);
}

// Detects whether a repo looks like coursework/an assignment submission rather than
// a standalone product/portfolio project, based on naming conventions.
export function looksLikeAssignment(repo) {
  const text = `${repo.name} ${repo.description || ""}`.toLowerCase();
  return /(assignment|exercise|homework|lab-|-lab|practice|coursework|tutorial|bootcamp)/.test(
    text
  );
}

// Signal 1: commit cadence
function commitCadenceSignal(commits, repo) {
  if (commits.length === 0) {
    return { score: 0, note: "No commit history found." };
  }
  const isAssignment = looksLikeAssignment(repo);

  if (commits.length === 1) {
    if (isAssignment) {
      return {
        score: 65,
        note: "Single commit, but this repo is named/described like a coursework or assignment submission — a one-time push after local development is the normal pattern for this type of repo, not a red flag.",
        isAssignment: true,
      };
    }
    return {
      score: 30,
      note: "Only a single commit exists for this repo — for a standalone project (not coursework), this is more consistent with a one-time upload than iterative development.",
      isAssignment: false,
    };
  }
  const dates = commits.map((c) => new Date(c.date)).sort((a, b) => a - b);
  const spanDays = daysBetween(dates[0], dates[dates.length - 1]);
  const commitsPerDay = commits.length / Math.max(spanDays, 1);

  let score, note;
  if (spanDays < 1 && commits.length > 3) {
    score = isAssignment ? 55 : 35;
    note = isAssignment
      ? `${commits.length} commits within a single day on what looks like an assignment repo — plausible for a focused work session on a bounded task.`
      : `${commits.length} commits all within a single day — could be a legitimate sprint, or a bulk upload disguised as multiple commits.`;
  } else if (spanDays > 3) {
    score = 85;
    note = `Commits are spread across ${Math.round(spanDays)} days, consistent with organic iterative development.`;
  } else {
    score = 60;
    note = `Development window of ${Math.round(spanDays)} days with ${commits.length} commits — plausible but on the compressed side.`;
  }
  return { score, note, spanDays: Math.round(spanDays), commitsPerDay: +commitsPerDay.toFixed(2), isAssignment };
}

// Signal 2: commit message quality
function commitMessageSignal(commits) {
  if (commits.length === 0) return { score: 0, note: "No commit messages to analyze." };

  const genericPatterns = /^(update|initial commit|final|done|upload|add files?|first commit)\.?$/i;
  const genericCount = commits.filter((c) => genericPatterns.test(c.message.trim())).length;
  const genericRatio = genericCount / commits.length;

  const uniqueMessages = new Set(commits.map((c) => c.message.trim().toLowerCase()));
  const uniqueRatio = uniqueMessages.size / commits.length;

  let score, note;
  if (genericRatio > 0.7) {
    score = 30;
    note = `${Math.round(genericRatio * 100)}% of commit messages are generic ("update", "final", etc.) — real iterative work usually shows more varied, descriptive messages.`;
  } else if (uniqueRatio < 0.5) {
    score = 45;
    note = `Low message diversity (${Math.round(uniqueRatio * 100)}% unique) — many repeated commit messages.`;
  } else {
    score = 80;
    note = `Commit messages are varied and descriptive, consistent with genuine incremental work.`;
  }
  return { score, note, genericRatio: +genericRatio.toFixed(2), uniqueRatio: +uniqueRatio.toFixed(2) };
}

// Signal 3: author identity consistency
function authorConsistencySignal(commits, username) {
  if (commits.length === 0) return { score: 0, note: "No commits to check authorship on." };

  const uniqueAuthors = new Set(commits.map((c) => c.author_email || c.author_name));
  let score, note;
  if (uniqueAuthors.size > 3) {
    score = 55;
    note = `${uniqueAuthors.size} distinct commit authors found — could indicate team project or a course/bootcamp repo rather than solo work. Worth checking if solo ownership was claimed.`;
  } else {
    score = 85;
    note = `Commit authorship is consistent (${uniqueAuthors.size} author identity found), matching what you'd expect from solo work.`;
  }
  return { score, note, uniqueAuthorCount: uniqueAuthors.size };
}

// Signal 4: timeline plausibility
function timelinePlausibilitySignal(repo) {
  const created = new Date(repo.created_at);
  const pushed = new Date(repo.pushed_at);
  const ageDays = daysBetween(created, pushed);
  const sizeKB = repo.size || 0;

  let score, note;
  if (ageDays < 0.1 && sizeKB > 2000) {
    score = 25;
    note = `Repo is ${sizeKB}KB but created and last pushed within hours of each other — large codebase appearing near-instantly is a flag worth a closer look.`;
  } else {
    score = 80;
    note = `Repo size (${sizeKB}KB) and development timespan (${Math.round(ageDays)} days) are broadly consistent with organic growth.`;
  }
  return { score, note, ageDays: Math.round(ageDays), sizeKB };
}

// Aggregate all signals for one repo
export function analyzeRepo(repo, commits, username) {
  const cadence = commitCadenceSignal(commits, repo);
  const messages = commitMessageSignal(commits);
  const authorship = authorConsistencySignal(commits, username);
  const timeline = timelinePlausibilitySignal(repo);

  const overall = Math.round(
    (cadence.score + messages.score + authorship.score + timeline.score) / 4
  );

  return {
    repo: repo.full_name,
    overallSignalScore: overall,
    signals: {
      commitCadence: cadence,
      commitMessages: messages,
      authorConsistency: authorship,
      timelinePlausibility: timeline,
    },
    commitCount: commits.length,
  };
}

// Cross-repo style consistency
export function crossRepoConsistency(repoAnalyses, repos) {
  const languages = repos.map((r) => r.language).filter(Boolean);
  const uniqueLanguages = new Set(languages);
  const scores = repoAnalyses.map((r) => r.overallSignalScore);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const variance =
    scores.length > 1
      ? Math.round(
        scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length
      )
      : 0;

  return {
    averageSignalScore: avgScore,
    scoreVariance: variance,
    languageSpread: [...uniqueLanguages],
    note:
      variance > 400
        ? "Signal scores vary significantly across repos — some repos look far more organic than others. Worth reviewing individually."
        : "Signal scores are fairly consistent across repos.",
  };
}

// Portfolio-level timeline: oldest -> newest repo creation, plus assignment vs
// standalone repo split. This is the real chronological signal.
export function portfolioTimeline(repos, profileCreatedAt) {
  if (repos.length === 0) {
    return { note: "No repos to build a timeline from." };
  }
  const sorted = [...repos].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];
  const accountAgeDays = daysBetween(profileCreatedAt, new Date());
  const activitySpanDays = daysBetween(oldest.created_at, newest.created_at);

  const assignmentCount = repos.filter(looksLikeAssignment).length;
  const nonAssignmentCount = repos.length - assignmentCount;

  return {
    accountAgeDays: Math.round(accountAgeDays),
    oldestRepo: { name: oldest.full_name, createdAt: oldest.created_at },
    newestRepo: { name: newest.full_name, createdAt: newest.created_at },
    activitySpanDays: Math.round(activitySpanDays),
    assignmentStyleRepoCount: assignmentCount,
    standaloneProjectRepoCount: nonAssignmentCount,
    note:
      assignmentCount > nonAssignmentCount
        ? `Most repos (${assignmentCount} of ${repos.length}) follow coursework/assignment naming patterns. Single-commit pattern in these is expected, not a flag. Standalone projects (${nonAssignmentCount}) are the more informative signal for judging real-world development style.`
        : `Portfolio is spread over ${Math.round(activitySpanDays)} days of repo creation, on a GitHub account ${Math.round(accountAgeDays)} days old.`,
  };
}