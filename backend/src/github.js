import fetch from "node-fetch";

const GITHUB_API = "https://api.github.com";

function headers() {
  const h = {
    Accept: "application/vnd.github+json",
    "User-Agent": "trust-score-mvp",
  };
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "ghp_your_token_here") {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function ghGet(path) {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: headers() });
  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new Error(
      `GitHub API rate limit hit (remaining: ${remaining}). Add a GITHUB_TOKEN in .env to raise the limit to 5000/hour.`
    );
  }
  if (res.status === 404) {
    throw new Error(`GitHub resource not found: ${path}`);
  }
  if (res.status === 409) {
    const err = new Error(`Repo appears to be empty (no commits): ${path}`);
    err.isEmptyRepo = true;
    throw err;
  }
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} on ${path}`);
  }
  return res.json();
}

// Fetch ALL of a user's public, non-fork, non-archived repos (paginated).
export async function getUserRepos(username) {
  let page = 1;
  let allRepos = [];
  while (true) {
    const batch = await ghGet(`/users/${username}/repos?per_page=100&page=${page}&sort=updated`);
    allRepos = allRepos.concat(batch);
    if (batch.length < 100) break;
    page++;
    if (page > 10) break; // safety cap
  }
  return allRepos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      created_at: r.created_at,
      pushed_at: r.pushed_at,
      stargazers_count: r.stargazers_count,
      size: r.size,
      default_branch: r.default_branch,
    }));
}

export async function getRepoCommits(owner, repo, limit = 100) {
  const commits = await ghGet(
    `/repos/${owner}/${repo}/commits?per_page=${Math.min(limit, 100)}`
  );
  return commits.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    author_name: c.commit.author?.name,
    author_email: c.commit.author?.email,
    date: c.commit.author?.date,
  }));
}

export async function getRepoLanguages(owner, repo) {
  return ghGet(`/repos/${owner}/${repo}/languages`);
}

export async function getUserProfile(username) {
  return ghGet(`/users/${username}`);
}