import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ id });

  if (!data) return <h1>404!!!</h1>;

  return (
    <>
      <Head>
        <title>{data?.username}</title>
      </Head>
      <PageLayout>
        <div>{data?.username}</div>
      </PageLayout>
    </>
  );
};
import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetServerSidePropsContext } from "next";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";

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
      id: slug,
    },
  };
};

export default ProfilePage;
