import { eq, desc, and, or, like, isNull, count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  boards,
  articles,
  comments,
  likes,
  favorites,
  pageViews,
  systemLogs,
  announcements,
  adSlots,
  siteSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatar", "bio"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Board queries
export async function getAllBoards() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(boards).orderBy(boards.order, boards.name);
}

export async function getBoardBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(boards)
    .where(eq(boards.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBoardById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(boards).where(eq(boards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Article queries
export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArticlesByBoardId(boardId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(articles)
    .where(and(eq(articles.boardId, boardId), eq(articles.isPublished, true)))
    .orderBy(desc(articles.isPinned), desc(articles.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getHotArticles(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(articles)
    .where(eq(articles.isPublished, true))
    .orderBy(
      desc(sql`${articles.likeCount} + ${articles.commentCount}`),
      desc(articles.createdAt)
    )
    .limit(limit);
}

export async function searchArticles(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.isPublished, true),
        or(
          like(articles.title, `%${query}%`),
          like(articles.content, `%${query}%`)
        )
      )
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getArticlesByAuthorId(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(articles)
    .where(and(eq(articles.authorId, userId), eq(articles.isPublished, true)))
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);
}

// Comment queries
export async function getCommentsByArticleId(articleId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(comments)
    .where(and(eq(comments.articleId, articleId), eq(comments.isDeleted, false)))
    .orderBy(comments.createdAt);
}

export async function getCommentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCommentReplies(parentCommentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.parentCommentId, parentCommentId),
        eq(comments.isDeleted, false)
      )
    )
    .orderBy(comments.createdAt);
}

// Like queries
export async function isArticleLikedByUser(articleId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(likes)
    .where(
      and(
        eq(likes.articleId, articleId),
        eq(likes.userId, userId),
        isNull(likes.commentId)
      )
    )
    .limit(1);
  return result.length > 0;
}

export async function isCommentLikedByUser(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(likes)
    .where(
      and(
        eq(likes.commentId, commentId),
        eq(likes.userId, userId),
        isNull(likes.articleId)
      )
    )
    .limit(1);
  return result.length > 0;
}

// Favorite queries
export async function isFavoritedByUser(articleId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.articleId, articleId), eq(favorites.userId, userId)))
    .limit(1);
  return result.length > 0;
}

export async function getFavoritesByUserId(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({ article: articles })
    .from(favorites)
    .innerJoin(articles, eq(favorites.articleId, articles.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .limit(limit)
    .offset(offset);
}

// System Log queries
export async function createSystemLog(log: typeof systemLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(systemLogs).values(log);
  return result;
}

export async function getSystemLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(systemLogs)
    .orderBy(desc(systemLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getSystemLogsByActionType(actionType: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(systemLogs)
    .where(eq(systemLogs.actionType, actionType))
    .orderBy(desc(systemLogs.createdAt))
    .limit(limit);
}

// Announcement queries
export async function getActiveAnnouncements() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.isActive, true),
        sql`${announcements.startDate} <= ${now}`,
        or(isNull(announcements.endDate), sql`${announcements.endDate} > ${now}`)
      )
    )
    .orderBy(desc(announcements.createdAt));
}

// Ad Slot queries
export async function getAdSlotByPosition(position: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adSlots)
    .where(and(eq(adSlots.position, position), eq(adSlots.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Page View tracking
export async function recordPageView(view: typeof pageViews.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(pageViews).values(view);
  return result;
}

export async function getArticleViewCount(articleId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: count() })
    .from(pageViews)
    .where(eq(pageViews.articleId, articleId));
  return result[0]?.count || 0;
}

// Site Settings
export async function getSiteSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await getSiteSetting(key);
  if (existing) {
    return db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
  } else {
    return db.insert(siteSettings).values({ key, value });
  }
}
