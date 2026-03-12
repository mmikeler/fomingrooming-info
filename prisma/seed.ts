import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";
import { slugify } from "../src/lib/slug";
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  SeedUser,
  SeedPost,
  SeedNotification,
  SeedModerationLog,
} from "./seed-data/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Load seed data from JSON files
 */
function loadSeedData() {
  const seedDataDir = path.join(__dirname, "seed-data");

  const users: SeedUser[] = JSON.parse(
    fs.readFileSync(path.join(seedDataDir, "users.json"), "utf-8"),
  );

  const posts: SeedPost[] = JSON.parse(
    fs.readFileSync(path.join(seedDataDir, "posts.json"), "utf-8"),
  );

  const notifications: SeedNotification[] = JSON.parse(
    fs.readFileSync(path.join(seedDataDir, "notifications.json"), "utf-8"),
  );

  const moderationLogs: SeedModerationLog[] = JSON.parse(
    fs.readFileSync(path.join(seedDataDir, "moderation-logs.json"), "utf-8"),
  );

  return { users, posts, notifications, moderationLogs };
}

/**
 * Seed data for development
 * Run with: npx prisma db seed
 */
async function main() {
  console.log("Starting seed...");

  // Load data from JSON files
  console.log("Loading seed data from JSON files...");
  const { users, posts, notifications, moderationLogs } = loadSeedData();
  console.log(
    `Loaded ${users.length} users, ${posts.length} posts, ${notifications.length} notifications, ${moderationLogs.length} moderation logs`,
  );

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.moderationLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users and build ID mapping (string -> number)
  console.log("Creating users...");
  const userIdMap = new Map<string, number>();

  // Define roles for seed users
  const userRoles: Record<string, string> = {
    "1": "SUPERADMIN",
    "2": "ADMIN",
    "3": "MODERATOR",
    "4": "AUTHOR",
    "5": "USER",
  };

  for (const userData of users) {
    const role = userRoles[userData.id.toString()] || "USER";
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        slug: slugify(userData.name),
        password: await hash(userData.password, 10),
        role: role as "USER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPERADMIN",
        emailVerified: new Date(),
      },
    });
    userIdMap.set(userData.id.toString(), user.id);
    console.log(
      `  Created user: ${user.name} (${user.email}) with role: ${role}`,
    );
  }

  // Create posts with resolved author IDs and build post ID mapping
  console.log("Creating posts...");
  const postIdMap = new Map<number, number>(); // seed index -> real ID

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const authorId = userIdMap.get(String(post.authorId));
    if (!authorId) {
      console.warn(
        `  Warning: Author not found for post "${post.title}", skipping...`,
      );
      continue;
    }

    // Handle status from JSON or convert published boolean
    const status = post.status || (post.published ? "PUBLISHED" : "DRAFT");

    const createdPost = await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        status: status as
          | "DRAFT"
          | "PENDING"
          | "PUBLISHED"
          | "REJECTED"
          | "ARCHIVED",
        authorId,
        rejectionReason: post.rejectionReason,
        moderatedAt: post.moderatedAt ? new Date(post.moderatedAt) : undefined,
        moderatedBy: post.moderatedBy
          ? userIdMap.get(String(post.moderatedBy))
          : undefined,
      },
    });
    postIdMap.set(i + 1, createdPost.id); // 1-based index for JSON reference
    console.log(`  Created post: ${post.title} (status: ${status})`);
  }

  // Create notifications
  console.log("Creating notifications...");
  for (const notification of notifications) {
    const userId = userIdMap.get(String(notification.userId));
    if (!userId) {
      console.warn(
        `  Warning: User not found for notification "${notification.title}", skipping...`,
      );
      continue;
    }

    await prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        type: notification.type,
      },
    });
  }
  console.log(`  Created ${notifications.length} notifications`);

  // Create moderation logs
  console.log("Creating moderation logs...");
  for (const log of moderationLogs) {
    const postId = postIdMap.get(log.postIndex);
    const moderatorId = userIdMap.get(String(log.moderatorId));

    if (!postId) {
      console.warn(
        `  Warning: Post not found for moderation log (index ${log.postIndex}), skipping...`,
      );
      continue;
    }
    if (!moderatorId) {
      console.warn(
        `  Warning: Moderator not found for moderation log, skipping...`,
      );
      continue;
    }

    await prisma.moderationLog.create({
      data: {
        postId,
        moderatorId,
        oldStatus: log.oldStatus as
          | "DRAFT"
          | "PENDING"
          | "PUBLISHED"
          | "REJECTED"
          | "ARCHIVED",
        newStatus: log.newStatus as
          | "DRAFT"
          | "PENDING"
          | "PUBLISHED"
          | "REJECTED"
          | "ARCHIVED",
        reason: log.reason,
      },
    });
  }
  console.log(`  Created ${moderationLogs.length} moderation logs`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
