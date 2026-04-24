CREATE TABLE `adSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`position` varchar(100) NOT NULL,
	`imageUrl` text,
	`linkUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adSlots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`authorId` int NOT NULL,
	`type` enum('info','warning','important') NOT NULL DEFAULT 'info',
	`isActive` boolean NOT NULL DEFAULT true,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`boardId` int NOT NULL,
	`authorId` int NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`isPinned` boolean NOT NULL DEFAULT false,
	`images` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `boards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` text,
	`color` varchar(20),
	`moderatorId` int,
	`isPublic` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boards_id` PRIMARY KEY(`id`),
	CONSTRAINT `boards_name_unique` UNIQUE(`name`),
	CONSTRAINT `boards_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`parentCommentId` int,
	`likeCount` int NOT NULL DEFAULT 0,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleId` int,
	`commentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pageViews` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`userId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`referer` text,
	`deviceType` enum('mobile','tablet','desktop'),
	`browser` varchar(100),
	`os` varchar(100),
	`country` varchar(100),
	`city` varchar(100),
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pageViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `systemLogs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`actionType` varchar(100) NOT NULL,
	`userId` int,
	`targetType` varchar(50),
	`targetId` int,
	`description` text,
	`metadata` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_boardId_boards_id_fk` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boards` ADD CONSTRAINT `boards_moderatorId_users_id_fk` FOREIGN KEY (`moderatorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_articleId_articles_id_fk` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentCommentId_comments_id_fk` FOREIGN KEY (`parentCommentId`) REFERENCES `comments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_articleId_articles_id_fk` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_articleId_articles_id_fk` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_commentId_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pageViews` ADD CONSTRAINT `pageViews_articleId_articles_id_fk` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pageViews` ADD CONSTRAINT `pageViews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `systemLogs` ADD CONSTRAINT `systemLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ad_position_idx` ON `adSlots` (`position`);--> statement-breakpoint
CREATE INDEX `ad_is_active_idx` ON `adSlots` (`isActive`);--> statement-breakpoint
CREATE INDEX `announcement_is_active_idx` ON `announcements` (`isActive`);--> statement-breakpoint
CREATE INDEX `announcement_created_at_idx` ON `announcements` (`createdAt`);--> statement-breakpoint
CREATE INDEX `article_slug_idx` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `article_board_idx` ON `articles` (`boardId`);--> statement-breakpoint
CREATE INDEX `article_author_idx` ON `articles` (`authorId`);--> statement-breakpoint
CREATE INDEX `article_published_idx` ON `articles` (`isPublished`);--> statement-breakpoint
CREATE INDEX `article_pinned_idx` ON `articles` (`isPinned`);--> statement-breakpoint
CREATE INDEX `article_created_at_idx` ON `articles` (`createdAt`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `boards` (`slug`);--> statement-breakpoint
CREATE INDEX `moderator_idx` ON `boards` (`moderatorId`);--> statement-breakpoint
CREATE INDEX `comment_article_idx` ON `comments` (`articleId`);--> statement-breakpoint
CREATE INDEX `comment_author_idx` ON `comments` (`authorId`);--> statement-breakpoint
CREATE INDEX `comment_parent_idx` ON `comments` (`parentCommentId`);--> statement-breakpoint
CREATE INDEX `comment_created_at_idx` ON `comments` (`createdAt`);--> statement-breakpoint
CREATE INDEX `favorite_user_idx` ON `favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `favorite_article_idx` ON `favorites` (`articleId`);--> statement-breakpoint
CREATE INDEX `unique_favorite` ON `favorites` (`userId`,`articleId`);--> statement-breakpoint
CREATE INDEX `like_user_idx` ON `likes` (`userId`);--> statement-breakpoint
CREATE INDEX `like_article_idx` ON `likes` (`articleId`);--> statement-breakpoint
CREATE INDEX `like_comment_idx` ON `likes` (`commentId`);--> statement-breakpoint
CREATE INDEX `unique_like_article` ON `likes` (`userId`,`articleId`);--> statement-breakpoint
CREATE INDEX `unique_like_comment` ON `likes` (`userId`,`commentId`);--> statement-breakpoint
CREATE INDEX `view_article_idx` ON `pageViews` (`articleId`);--> statement-breakpoint
CREATE INDEX `view_user_idx` ON `pageViews` (`userId`);--> statement-breakpoint
CREATE INDEX `view_viewed_at_idx` ON `pageViews` (`viewedAt`);--> statement-breakpoint
CREATE INDEX `log_action_type_idx` ON `systemLogs` (`actionType`);--> statement-breakpoint
CREATE INDEX `log_user_idx` ON `systemLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `log_target_type_idx` ON `systemLogs` (`targetType`);--> statement-breakpoint
CREATE INDEX `log_created_at_idx` ON `systemLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `is_banned_idx` ON `users` (`isBanned`);