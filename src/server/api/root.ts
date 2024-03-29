import { createTRPCRouter } from "~/server/api/trpc";
import { tweetsRouter } from "./routers/tweets";
import { profileRouter } from "./routers/profile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tweets: tweetsRouter,
  profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
