import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          tweets: {
            select: {
              id: true,
            },
          },
        },
      });
    }),
});
