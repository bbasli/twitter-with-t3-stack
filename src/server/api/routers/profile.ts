import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { User } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const filterUserForClient = (user: User) => {
  const { id, emailAddresses, profileImageUrl } = user;

  const username = emailAddresses[0]?.emailAddress.split("@")[0];

  return { id, username, profileImageUrl };
};
export const profieRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await clerkClient.users.getUserList({
        userId: [input.id],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return filterUserForClient(user);
    }),
});
