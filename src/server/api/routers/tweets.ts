import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

/* import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
}); */

export const tweetsRouter = createTRPCRouter({
  getTweetById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) =>
      ctx.prisma.tweet.findUnique({
        where: { id: input.id },
        include: { author: true },
      })
    ),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const tweets = await ctx.prisma.tweet.findMany({
      include: {
        author: true,
      },
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return tweets;
  }),

  getTweetsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.tweet.findMany({
        where: { authorId: input.userId },
        orderBy: [{ createdAt: "desc" }],
        take: 100,
        include: { author: true },
      })
    ),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session?.user?.id;

      /* const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" }); */

      const post = await ctx.prisma.tweet.create({
        data: {
          authorId: parseInt(authorId, 10),
          text: input.content,
        },
      });

      return post;
    }),
});
