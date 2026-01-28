/**
 * Reddit-style Ranking Algorithms for Charcha
 * Extended with CRED-based feed ranking
 */

/**
 * Calculate Hot Score for posts (Reddit algorithm)
 */
function calculateHotScore(upvotes, downvotes, createdAt) {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  
  const seconds = new Date(createdAt).getTime() / 1000;
  const epochOffset = 1134028003;
  
  return sign * order + (seconds - epochOffset) / 45000;
}

/**
 * Calculate Wilson Score for comments (Best sorting)
 */
function calculateWilsonScore(upvotes, downvotes) {
  const n = upvotes + downvotes;
  if (n === 0) return 0;
  
  const z = 1.96;
  const phat = upvotes / n;
  
  return (
    (phat + (z * z) / (2 * n) - z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n)) /
    (1 + (z * z) / n)
  );
}

/**
 * Calculate Controversial Score
 */
function calculateControversialScore(upvotes, downvotes) {
  const total = upvotes + downvotes;
  if (total === 0) return 0;
  
  const magnitude = total;
  const balance = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes, 1);
  
  return magnitude * balance;
}

/**
 * Calculate smart feed score (CRED-weighted)
 * Score = (upvotes - downvotes) + log(author.cred + 1) + freshnessBoost
 */
function calculateSmartFeedScore(post, authorCred) {
  const netVotes = post.upvotes - post.downvotes;
  const credBoost = Math.log10((authorCred || 0) + 1);
  
  // Freshness decay (24hr half-life)
  const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  const freshnessBoost = Math.pow(0.5, ageInHours / 24) * 10;
  
  // Quality bonus
  const qualityBonus = post.isHighQuality ? 5 : 0;
  
  return netVotes + credBoost + freshnessBoost + qualityBonus;
}

/**
 * Get sort query for posts
 */
function getPostSortQuery(sortType) {
  switch (sortType) {
    case "hot":
      return { hotScore: -1 };
    case "new":
      return { createdAt: -1 };
    case "top":
      return { upvotes: -1, createdAt: -1 };
    case "controversial":
      return { createdAt: -1 }; // Post-query sorting needed
    case "quality":
      return { qualityScore: -1, createdAt: -1 };
    default:
      return { hotScore: -1 };
  }
}

/**
 * Get sort query for comments
 */
function getCommentSortQuery(sortType) {
  switch (sortType) {
    case "best":
      return { wilsonScore: -1 };
    case "top":
      return { upvotes: -1 };
    case "new":
      return { createdAt: -1 };
    case "old":
      return { createdAt: 1 };
    default:
      return { wilsonScore: -1 };
  }
}

/**
 * Get rank from karma/aura points
 */
function getRankFromKarma(aura) {
  if (aura >= 10000) return "Master";
  if (aura >= 2000) return "Mentor";
  if (aura >= 500) return "Contributor";
  if (aura >= 100) return "Explorer";
  return "Newcomer";
}

/**
 * Get rank emoji
 */
function getRankEmoji(aura) {
  if (aura >= 10000) return "🏆";
  if (aura >= 2000) return "🔥";
  if (aura >= 500) return "🧠";
  if (aura >= 100) return "📘";
  return "🌱";
}

module.exports = {
  calculateHotScore,
  calculateWilsonScore,
  calculateControversialScore,
  calculateSmartFeedScore,
  getPostSortQuery,
  getCommentSortQuery,
  getRankFromKarma,
  getRankEmoji,
};
