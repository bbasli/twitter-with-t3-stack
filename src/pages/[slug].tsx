import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { data } = api.profile.getUserByUsername.useQuery({
    id: "user_2OFduXeGQOD8xr5BEt2USzDXf3Z",
  });

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex	min-h-screen justify-center">
        <div>{data?.username}</div>
      </main>
    </>
  );
};
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

export const getStaticProps = async (context) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: { prisma },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("Slug must be a string");
  }

  await ssg.profile.getUserByUsername.prefetch({ id: slug });
};

export default ProfilePage;
