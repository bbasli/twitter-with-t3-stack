import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    id: "user_2OFduXeGQOD8xr5BEt2USzDXf3Z",
  });

  if (isLoading) return <div>Loading...</div>;

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
import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetServerSidePropsContext } from "next";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  const slug = context.params?.slug as string;

  if (!slug) throw new Error("No slug");

  await helpers.profile.getUserByUsername.prefetch({ id: slug });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

export default ProfilePage;
