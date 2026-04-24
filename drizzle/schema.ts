import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  bigint,
  decimal,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    avatar: text("avatar"), // URL to avatar image
    bio: text("bio"), // User bio/description
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    isBanned: boolean("isBanned").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table: any) => ({
    roleIdx: index("role_idx").on(table.role),
    isBannedIdx: index("is_banned_idx").on(table.isBanned),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Boards/Categories table - represents different discussion topics
 */
export const boards = mysqlTable(
  "boards",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly name
    description: text("description"),
    icon: text("icon"), // Icon URL or emoji
    color: varchar("color", { length: 20 }), // Hex color for board
    moderatorId: int("moderatorId").references(() => users.id), // Board moderator
    isPublic: boolean("isPublic").default(true).notNull(),
    order: int("order").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    slugIdx: index("slug_idx").on(table.slug),
    moderatorIdx: index("moderator_idx").on(table.moderatorId),
  })
);

export type Board = typeof boards.$inferSelect;
export type InsertBoard = typeof boards.$inferInsert;

/**
 * Articles/Posts table
 */
export const articles = mysqlTable(
  "articles",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly slug
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(), // Rich text content (HTML or markdown)
    excerpt: text("excerpt"), // Short preview
    boardId: int("boardId").notNull().references(() => boards.id),
    authorId: int("authorId").notNull().references(() => users.id),
    viewCount: int("viewCount").default(0).notNull(),
    likeCount: int("likeCount").default(0).notNull(),
    commentCount: int("commentCount").default(0).notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    isPinned: boolean("isPinned").default(false).notNull(), // Pinned to top
    images: json("images"), // Array of image URLs
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    slugIdx: index("article_slug_idx").on(table.slug),
    boardIdx: index("article_board_idx").on(table.boardId),
    authorIdx: index("article_author_idx").on(table.authorId),
    publishedIdx: index("article_published_idx").on(table.isPublished),
    pinnedIdx: index("article_pinned_idx").on(table.isPinned),
    createdAtIdx: index("article_created_at_idx").on(table.createdAt),
  })
);

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Comments/Replies table with nested structure support
 */
export const comments: any = mysqlTable(
  "comments",
  {
    id: int("id").autoincrement().primaryKey(),
    articleId: int("articleId").notNull().references(() => articles.id),
    authorId: int("authorId").notNull().references(() => users.id),
    content: text("content").notNull(),
    parentCommentId: int("parentCommentId").references((): any => comments.id), // For nested replies
    likeCount: int("likeCount").default(0).notNull(),
    isDeleted: boolean("isDeleted").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any): any => ({
    articleIdx: index("comment_article_idx").on(table.articleId),
    authorIdx: index("comment_author_idx").on(table.authorId),
    parentIdx: index("comment_parent_idx").on(table.parentCommentId),
    createdAtIdx: index("comment_created_at_idx").on(table.createdAt),
  })
);

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Likes table - tracks likes on articles and comments
 */
export const likes = mysqlTable(
  "likes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    articleId: int("articleId").references(() => articles.id), // NULL if liking a comment
    commentId: int("commentId").references(() => comments.id), // NULL if liking an article
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    userIdx: index("like_user_idx").on(table.userId),
    articleIdx: index("like_article_idx").on(table.articleId),
    commentIdx: index("like_comment_idx").on(table.commentId),
    // Prevent duplicate likes
    uniqueLikeArticle: index("unique_like_article").on(table.userId, table.articleId),
    uniqueLikeComment: index("unique_like_comment").on(table.userId, table.commentId),
  })
);

export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;

/**
 * Favorites/Bookmarks table - for saving articles
 */
export const favorites = mysqlTable(
  "favorites",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    articleId: int("articleId").notNull().references(() => articles.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    userIdx: index("favorite_user_idx").on(table.userId),
    articleIdx: index("favorite_article_idx").on(table.articleId),
    uniqueFavorite: index("unique_favorite").on(table.userId, table.articleId),
  })
);

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Page Views table - tracks article views with device info
 */
export const pageViews = mysqlTable(
  "pageViews",
  {
    id: bigint("id", { mode: "bigint" }).autoincrement().primaryKey(),
    articleId: int("articleId").notNull().references(() => articles.id),
    userId: int("userId").references(() => users.id), // NULL for anonymous users
    ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
    userAgent: text("userAgent"),
    referer: text("referer"),
    deviceType: mysqlEnum("deviceType", ["mobile", "tablet", "desktop"]),
    browser: varchar("browser", { length: 100 }),
    os: varchar("os", { length: 100 }),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  },
  (table: any) => ({
    articleIdx: index("view_article_idx").on(table.articleId),
    userIdx: index("view_user_idx").on(table.userId),
    viewedAtIdx: index("view_viewed_at_idx").on(table.viewedAt),
  })
);

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * System Logs table - tracks admin actions and system events
 */
export const systemLogs = mysqlTable(
  "systemLogs",
  {
    id: bigint("id", { mode: "bigint" }).autoincrement().primaryKey(),
    actionType: varchar("actionType", { length: 100 }).notNull(), // e.g., "user_created", "article_deleted", "comment_removed"
    userId: int("userId").references(() => users.id), // Admin/moderator who performed the action
    targetType: varchar("targetType", { length: 50 }), // "user", "article", "comment", "board", "system"
    targetId: int("targetId"), // ID of the affected resource
    description: text("description"), // Detailed description of the action
    metadata: json("metadata"), // Additional data (old values, new values, etc.)
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table: any) => ({
    actionTypeIdx: index("log_action_type_idx").on(table.actionType),
    userIdx: index("log_user_idx").on(table.userId),
    targetTypeIdx: index("log_target_type_idx").on(table.targetType),
    createdAtIdx: index("log_created_at_idx").on(table.createdAt),
  })
);

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = typeof systemLogs.$inferInsert;

/**
 * System Announcements table - for admin/moderator announcements
 */
export const announcements = mysqlTable(
  "announcements",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    authorId: int("authorId").notNull().references(() => users.id),
    type: mysqlEnum("type", ["info", "warning", "important"]).default("info").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    startDate: timestamp("startDate").defaultNow().notNull(),
    endDate: timestamp("endDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    isActiveIdx: index("announcement_is_active_idx").on(table.isActive),
    createdAtIdx: index("announcement_created_at_idx").on(table.createdAt),
  })
);

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Site Settings table - for storing configuration and metadata
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/**
 * Advertisement Slots table - for managing ad placements
 */
export const adSlots = mysqlTable(
  "adSlots",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    position: varchar("position", { length: 100 }).notNull(), // e.g., "sidebar", "header", "footer"
    imageUrl: text("imageUrl"), // URL to ad image
    linkUrl: text("linkUrl"), // Optional link for ad
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table: any) => ({
    positionIdx: index("ad_position_idx").on(table.position),
    isActiveIdx: index("ad_is_active_idx").on(table.isActive),
  })
);

export type AdSlot = typeof adSlots.$inferSelect;
export type InsertAdSlot = typeof adSlots.$inferInsert;
