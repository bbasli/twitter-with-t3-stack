import Head from "next/head";
import type { NextPage } from "next";

import { api } from "~/utils/api";

import { PostView } from "~/components/post-view";

const SinglePostPage: NextPage<{ id: number }> = ({ id }) => {
  const { data } = api.tweets.getTweetById.useQuery({ id });

  if (!data) return <h1>404!!!</h1>;

  return (
    <>
      <Head>
        <title>{`${data.text ?? "-"} - ${data.author?.name ?? ""}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

import type { GetServerSidePropsContext } from "next";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const helpers = generateSSGHelper();
  const id = parseInt(context.params?.id as string);

  if (!id) throw new Error("No id");

  await helpers.tweets.getTweetById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};

export default SinglePostPage;
