import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { User } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getName = (user: User) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ");

const filterUserForClient = (user: User) => {
  const { id, emailAddresses, profileImageUrl } = user;

  const username = emailAddresses[0]?.emailAddress.split("@")[0];

  return { id, username, profileImageUrl, name: getName(user) };
};
export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [[user], postCount] = await Promise.all([
        clerkClient.users.getUserList({
          userId: [input.id],
        }),
        ctx.prisma.post.count({
          where: { authorId: input.id },
        }),
      ]);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        postCount,
        ...filterUserForClient(user),
      };
    }),
});
