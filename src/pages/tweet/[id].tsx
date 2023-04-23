import Head from "next/head";
import type { NextPage } from "next";

import { api } from "~/utils/api";

import { TweetView } from "~/components/tweet-view";
import GoBackArrow from "~/components/goBackArrow";

const SinglePostPage: NextPage<{ id: number }> = ({ id }) => {
  const { data } = api.tweets.getTweetById.useQuery({ id });

  if (!data) return <h1>404!!!</h1>;

  return (
    <>
      <Head>
        <title>{`${data.text ?? "-"} - ${data.author?.name ?? ""}`}</title>
      </Head>
      <PageLayout>
        <div className="flex h-[55px] items-center gap-4 border-b border-slate-400 p-1">
          <GoBackArrow />
          <span className="text-xl font-bold">Tweets</span>
        </div>
        <TweetView {...data} />
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
