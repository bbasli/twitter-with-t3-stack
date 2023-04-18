import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import type { User } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const filterUserForClient = (user: User) => {
  const { id, emailAddresses, profileImageUrl } = user;

  const username = emailAddresses[0]?.emailAddress.split("@")[0];

  return { id, username, profileImageUrl };
};

/* const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
}; */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const postsRouter = createTRPCRouter({
  getPostById: publicProcedure.input(z.object({ id: z.number() })).query(
    async ({ ctx, input }) =>
      ctx.prisma.tweet.findUnique({
        where: { id: input.id },
      })
    /* .then((post) => post && addUserDataToPosts([post]))
        .then((posts) => posts?.[0]) */
  ),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.tweet.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(posts);
  }),

  getTweetsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(
      async ({ ctx, input }) =>
        ctx.prisma.tweet.findMany({
          where: { authorId: input.userId },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
      /* .then(addUserDataToPosts) */
    ),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session?.user?.id;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.tweet.create({
        data: {
          authorId: parseInt(authorId, 10),
          text: input.content,
        },
      });

      return post;
    }),
});
