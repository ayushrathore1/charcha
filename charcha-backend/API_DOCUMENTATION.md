# Charcha Backend - API Documentation for CodeLearnn Integration

**Base URL:** `http://localhost:5001/api`  
**Authentication:** Bearer token in `Authorization` header

---

## 🔐 Authentication

### Register
```
POST /auth/register
Body: { email, password, name, platform: "CODELEARNN" }
Response: { token, user: { id, username, aura, xp, cred, level, levelInfo } }
```

### Login
```
POST /auth/login
Body: { email, password }
Response: { token, user, loginReward: { xp: 5, streak } }
```
> Auto-awards +5 XP daily login bonus + streak tracking

### Get Current User
```
GET /auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { user: { aura, xp, cred, level, levelProgress, stats, streak, badges } }
```

### Update Profile
```
PUT /auth/profile
Body: { name?, bio?, customFlair?, avatarIndex? }
```

### Get Public Profile
```
GET /auth/users/:username
Response: { user: { username, aura, xp, cred, level, levelInfo, stats } }
```

### Leaderboard
```
GET /auth/leaderboard?type=aura&platform=CODELEARNN&limit=20
Response: { leaderboard: [{ rank, username, aura, xp, cred, level }] }
```

### SSO Sync (Create/Update User from External Platform)
```
POST /auth/sso-sync
Headers: { X-SSO-Secret: "your-sso-secret" }
Body: { 
  email: "user@example.com",
  name: "John Doe",
  avatarUrl: "https://example.com/avatar.jpg",  // optional
  codelearnId: "codelearnn_user_123",
  platform: "CODELEARNN"
}
Response: { 
  token, 
  user: { id, email, name, username, platform, codelearnId, avatarUrl, aura, xp, cred, level, levelInfo, avatarIndex } 
}
```
> Creates a new user or updates existing user. Use this when a user registers on CodeLearnn.

### SSO Login (Get Token for Existing User)
```
POST /auth/sso-login
Headers: { X-SSO-Secret: "your-sso-secret" }
Body: { 
  email: "user@example.com",
  codelearnId: "codelearnn_user_123",
  platform: "CODELEARNN"
}
Response: { 
  token, 
  user: { id, email, name, username, platform, codelearnId, avatarUrl, aura, xp, cred, level, levelInfo, levelProgress, avatarIndex, isAdmin, streak },
  loginReward: { xp: 5, message: "Daily login bonus!", streak } // or null if already claimed
}
```
> Returns a token for an existing user. Use this when a user logs into CodeLearnn.

---

## 📝 Posts

### Get Posts
```
GET /posts?sort=hot&platform=CODELEARNN&type=RESOURCE&tag=tutorials&page=1&limit=20
Sort options: hot, new, top, smart, quality
Types: NOTE, POST, RESOURCE, EXPLANATION, ROADMAP, REVIEW
Tags: doubts, resources, memes, off-topic, notes, roadmaps, tutorials
```

### Create Post
```
POST /posts
Body: { 
  title, content, 
  platform: "CODELEARNN",
  type: "RESOURCE",  // ROADMAP, REVIEW, etc.
  tag: "tutorials",
  isAnonymous?: false,
  fileUrl?: "https://...",
  mediaUrls?: [{ url, type: "image"|"video"|"pdf", filename }]
}
```
> Awards: POST_RESOURCE (+15 AURA, +8 XP), POST_ROADMAP (+25 AURA, +12 XP)

### Get Single Post
```
GET /posts/:idOrSlug
```

### Delete Post
```
DELETE /posts/:postId
```

### Bookmark Post
```
POST /posts/:postId/bookmark
```
> Awards post author: +3 AURA, +1 XP, +0.5 CRED

### Mark as High Quality (Moderator only)
```
POST /posts/:postId/quality
```
> Awards post author: +50 AURA, +10 XP, +5 CRED

---

## 💬 Comments

### Get Comments (Threaded)
```
GET /posts/:postId/comments?sort=best&page=1
Sort options: best (Wilson score), top, new, old
```

### Add Comment
```
POST /posts/:postId/comments
Body: { content, parentCommentId?: null, isAnonymous?: false }
```
> Awards commenter: +1 AURA, +2 XP  
> Awards post author: +1 AURA, +1 XP (for receiving comment)

### Delete Comment
```
DELETE /comments/:commentId
```

---

## 👍 Voting

### Vote on Post/Comment
```
POST /votes
Body: { targetType: "post"|"comment", targetId, voteType: 1|-1 }
```
> Upvote received: +2 AURA, +1 XP, +0.2 CRED  
> Downvote received: -2 AURA, -0.1 CRED  
> Vote weight scales with voter's CRED

### Get User's Votes
```
POST /votes/check
Body: { targetType: "post", targetIds: ["id1", "id2"] }
Response: { votes: { "id1": 1, "id2": -1 } }
```

---

## 👥 Follow System

### Follow/Unfollow User
```
POST /users/:userId/follow
DELETE /users/:userId/follow
```

### Get Followers/Following
```
GET /users/:userId/followers?page=1&limit=20
GET /users/:userId/following?page=1&limit=20
```

### Check If Following
```
GET /users/:userId/following/check
Response: { isFollowing: true|false }
```

---

## 🔔 Mentions

### Search Users (for @autocomplete)
```
GET /mentions/users/search?q=john
Response: { users: [{ username, avatarIndex, karma, rank }] }
```

### Get My Mentions
```
GET /mentions?unreadOnly=true&page=1
Response: { mentions, unreadCount }
```

### Mark Mentions Read
```
POST /mentions/read
Body: { mentionIds?: ["id1"] }  // Empty = mark all read
```

---

## 📊 Point System Summary

| Action | AURA | XP | CRED |
|--------|------|-----|------|
| POST_NOTE | +20 | +10 | 0 |
| POST_RESOURCE | +15 | +8 | 0 |
| POST_ROADMAP | +25 | +12 | 0 |
| POST_REVIEW | +8 | +10 | 0 |
| POST_GENERIC | +5 | +3 | 0 |
| UPVOTE_RECEIVED | +2 | +1 | +0.2 |
| DOWNVOTE_RECEIVED | -2 | 0 | -0.1 |
| BOOKMARK_RECEIVED | +3 | +1 | +0.5 |
| COMMENT_CREATED | +1 | +2 | 0 |
| QUALITY_RESOURCE | +50 | +10 | +5 |
| DAILY_LOGIN | 0 | +5 | 0 |

---

## 🎖️ Levels

| Level | Name | AURA Required |
|-------|------|---------------|
| 1 | 🌱 Newcomer | 0 |
| 2 | 📘 Explorer | 100 |
| 3 | 🧠 Contributor | 500 |
| 4 | 🔥 Mentor | 2000 |
| 5 | 🏆 Master | 10000 |

---

## 🛡️ Anti-Gaming

- **Vote weight** = f(CRED): Higher CRED = more influence on rankings
- **Rate limiting**: Max 100 votes/hour, 50 comments/hour
- **Anonymous limits**: 3 per day, 24hr account age required
- **Suspicious flags**: Auto-increment on rate limit breach

---

## CodeLearnn-Specific Mapping

| CodeLearnn Concept | Post Type | Tag |
|-------------------|-----------|-----|
| Resource curation | RESOURCE | resources |
| Roadmaps | ROADMAP | roadmaps |
| Tutorial reviews | REVIEW | tutorials |
| General posts | POST | off-topic |

**Set `platform: "CODELEARNN"` on all requests to filter/track platform-specific content.**
