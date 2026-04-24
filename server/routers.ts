import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllBoards,
  getBoardBySlug,
  getArticleBySlug,
  getArticlesByBoardId,
  getHotArticles,
  searchArticles,
  getArticlesByAuthorId,
  getCommentsByArticleId,
  getCommentReplies,
  isArticleLikedByUser,
  isCommentLikedByUser,
  isFavoritedByUser,
  getFavoritesByUserId,
  getActiveAnnouncements,
  getAdSlotByPosition,
  recordPageView,
  getArticleViewCount,
  getUserById,
  createSystemLog,
  getSystemLogs,
  getSystemLogsByActionType,
  getSiteSetting,
  setSiteSetting,
  getBoardById,
  getArticleById,
  getCommentById,
} from "./db";
import { getDb } from "./db";
import { articles, comments, likes, favorites, pageViews, systemLogs, boards, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Helper to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100) + "-" + nanoid(6);
}

// Helper to get client IP
function getClientIp(req: any): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// Helper to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  let browser = "Unknown";
  let os = "Unknown";
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";

  // Detect browser
  if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("safari")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("edge")) browser = "Edge";

  // Detect OS
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

  // Detect device type
  if (ua.includes("mobile") || ua.includes("android")) deviceType = "mobile";
  else if (ua.includes("tablet") || ua.includes("ipad")) deviceType = "tablet";

  return { browser, os, deviceType };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Board routes
  boards: router({
    list: publicProcedure.query(async () => {
      return getAllBoards();
    }),

    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return getBoardBySlug(input.slug);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          slug: z.string().min(1).max(100),
          description: z.string().optional(),
          icon: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(boards).values({
          ...input,
          moderatorId: ctx.user.id,
        });

        await createSystemLog({
          actionType: "board_created",
          userId: ctx.user.id,
          targetType: "board",
          description: `Created board: ${input.name}`,
          ipAddress: getClientIp(ctx.req),
        });

        return result;
      }),
  }),

  // Article routes
  articles: router({
    list: publicProcedure
      .input(
        z.object({
          boardSlug: z.string().optional(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        if (input.boardSlug) {
          const board = await getBoardBySlug(input.boardSlug);
          if (!board) return [];
          return getArticlesByBoardId(board.id, input.limit, input.offset);
        }
        return [];
      }),

    hot: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return getHotArticles(input.limit);
      }),

    search: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return searchArticles(input.query, input.limit, input.offset);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input, ctx }) => {
        const article = await getArticleBySlug(input.slug);
        if (!article) return null;

        // Record page view
        const { browser, os, deviceType } = parseUserAgent(
          ctx.req.headers["user-agent"] || ""
        );
        await recordPageView({
          articleId: article.id,
          userId: ctx.user?.id || null,
          ipAddress: getClientIp(ctx.req),
          userAgent: ctx.req.headers["user-agent"] as string,
          referer: ctx.req.headers["referer"] as string,
          deviceType,
          browser,
          os,
        });

        // Get related data
        const author = await getUserById(article.authorId);
        const comments = await getCommentsByArticleId(article.id);
        const isLiked = ctx.user ? await isArticleLikedByUser(article.id, ctx.user.id) : false;
        const isFavorited = ctx.user
          ? await isFavoritedByUser(article.id, ctx.user.id)
          : false;

        return {
          ...article,
          author,
          comments,
          isLiked,
          isFavorited,
        };
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          content: z.string().min(1),
          boardId: z.number(),
          excerpt: z.string().optional(),
          images: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const slug = generateSlug(input.title);

        const result = await db.insert(articles).values({
          slug,
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          boardId: input.boardId,
          authorId: ctx.user.id,
          images: input.images ? JSON.stringify(input.images) : null,
        });

        await createSystemLog({
          actionType: "article_created",
          userId: ctx.user.id,
          targetType: "article",
          description: `Created article: ${input.title}`,
          ipAddress: getClientIp(ctx.req),
        });

        return { slug };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          excerpt: z.string().optional(),
          images: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const article = await getArticleById(input.id);
        if (!article) throw new Error("Article not found");
        if (article.authorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const updateData: any = {};
        if (input.title) updateData.title = input.title;
        if (input.content) updateData.content = input.content;
        if (input.excerpt) updateData.excerpt = input.excerpt;
        if (input.images) updateData.images = JSON.stringify(input.images);

        await db.update(articles).set(updateData).where(eq(articles.id, input.id));

        await createSystemLog({
          actionType: "article_updated",
          userId: ctx.user.id,
          targetType: "article",
          targetId: input.id,
          description: `Updated article: ${article.title}`,
          ipAddress: getClientIp(ctx.req),
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const article = await getArticleById(input.id);
        if (!article) throw new Error("Article not found");
        if (article.authorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        await db.update(articles).set({ isPublished: false }).where(eq(articles.id, input.id));

        await createSystemLog({
          actionType: "article_deleted",
          userId: ctx.user.id,
          targetType: "article",
          targetId: input.id,
          description: `Deleted article: ${article.title}`,
          ipAddress: getClientIp(ctx.req),
        });

        return { success: true };
      }),

    getUserArticles: publicProcedure
      .input(
        z.object({
          userId: z.number(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return getArticlesByAuthorId(input.userId, input.limit, input.offset);
      }),
  }),

  // Comment routes
  comments: router({
    list: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return getCommentsByArticleId(input.articleId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          articleId: z.number(),
          content: z.string().min(1),
          parentCommentId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(comments).values({
          articleId: input.articleId,
          authorId: ctx.user.id,
          content: input.content,
          parentCommentId: input.parentCommentId,
        });

        // Update article comment count
        const article = await getArticleById(input.articleId);
        if (article) {
          await db
            .update(articles)
            .set({ commentCount: article.commentCount + 1 })
            .where(eq(articles.id, input.articleId));
        }

        const commentId = (result as any).insertId || 0;
        await createSystemLog({
          actionType: "comment_created",
          userId: ctx.user.id,
          targetType: "comment",
          targetId: commentId,
          description: `Created comment on article ${input.articleId}`,
          ipAddress: getClientIp(ctx.req),
        });

        return { id: commentId };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const comment = await getCommentById(input.id);
        if (!comment) throw new Error("Comment not found");
        if (comment.authorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        await db.update(comments).set({ isDeleted: true }).where(eq(comments.id, input.id));

        await createSystemLog({
          actionType: "comment_deleted",
          userId: ctx.user.id,
          targetType: "comment",
          targetId: input.id,
          description: `Deleted comment`,
          ipAddress: getClientIp(ctx.req),
        });

        return { success: true };
      }),

    getReplies: publicProcedure
      .input(z.object({ parentCommentId: z.number() }))
      .query(async ({ input }) => {
        return getCommentReplies(input.parentCommentId);
      }),
  }),

  // Like routes
  likes: router({
    toggleArticleLike: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const isLiked = await isArticleLikedByUser(input.articleId, ctx.user.id);
        const article = await getArticleById(input.articleId);
        if (!article) throw new Error("Article not found");

        if (isLiked) {
          await db
            .delete(likes)
            .where(
              and(
                eq(likes.articleId, input.articleId),
                eq(likes.userId, ctx.user.id)
              )
            );
          await db
            .update(articles)
            .set({ likeCount: Math.max(0, article.likeCount - 1) })
            .where(eq(articles.id, input.articleId));
        } else {
          await db.insert(likes).values({
            articleId: input.articleId,
            userId: ctx.user.id,
          });
          await db
            .update(articles)
            .set({ likeCount: article.likeCount + 1 })
            .where(eq(articles.id, input.articleId));
        }

        return { liked: !isLiked };
      }),

    toggleCommentLike: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const isLiked = await isCommentLikedByUser(input.commentId, ctx.user.id);
        const comment = await getCommentById(input.commentId);
        if (!comment) throw new Error("Comment not found");

        if (isLiked) {
          await db
            .delete(likes)
            .where(
              and(
                eq(likes.commentId, input.commentId),
                eq(likes.userId, ctx.user.id)
              )
            );
          await db
            .update(comments)
            .set({ likeCount: Math.max(0, comment.likeCount - 1) })
            .where(eq(comments.id, input.commentId));
        } else {
          await db.insert(likes).values({
            commentId: input.commentId,
            userId: ctx.user.id,
          });
          await db
            .update(comments)
            .set({ likeCount: comment.likeCount + 1 })
            .where(eq(comments.id, input.commentId));
        }

        return { liked: !isLiked };
      }),
  }),

  // Favorite routes
  favorites: router({
    toggle: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const isFav = await isFavoritedByUser(input.articleId, ctx.user.id);

        if (isFav) {
          await db
            .delete(favorites)
            .where(
              and(
                eq(favorites.articleId, input.articleId),
                eq(favorites.userId, ctx.user.id)
              )
            );
        } else {
          await db.insert(favorites).values({
            articleId: input.articleId,
            userId: ctx.user.id,
          });
        }

        return { favorited: !isFav };
      }),

    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input, ctx }) => {
        return getFavoritesByUserId(ctx.user.id, input.limit, input.offset);
      }),
  }),

  // Announcement routes
  announcements: router({
    list: publicProcedure.query(async () => {
      return getActiveAnnouncements();
    }),
  }),

  // Ad routes
  ads: router({
    getSlot: publicProcedure
      .input(z.object({ position: z.string() }))
      .query(async ({ input }) => {
        return getAdSlotByPosition(input.position);
      }),
  }),

  // System logs routes
  logs: router({
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return getSystemLogs(input.limit, input.offset);
      }),

    getByActionType: adminProcedure
      .input(
        z.object({
          actionType: z.string(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        return getSystemLogsByActionType(input.actionType, input.limit);
      }),
  }),

  // Settings routes
  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return getSiteSetting(input.key);
      }),

    set: adminProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await setSiteSetting(input.key, input.value);

        await createSystemLog({
          actionType: "setting_updated",
          userId: ctx.user.id,
          description: `Updated setting: ${input.key}`,
          ipAddress: getClientIp(ctx.req),
        });

        return { success: true };
      }),
  }),

  // User routes
  users: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getUserById(input.userId);
      }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          avatar: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.bio !== undefined) updateData.bio = input.bio;
        if (input.avatar !== undefined) updateData.avatar = input.avatar;

        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
