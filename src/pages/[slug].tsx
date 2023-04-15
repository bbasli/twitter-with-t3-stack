import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { FiArrowLeft } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

import { PostView } from "~/components/post-view";
import { LoadingPage } from "~/components/loading";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || !data.length) return <h1>User has not posted</h1>;

  return (
    <div className="flex grow flex-col overflow-y-scroll">
      {data?.map((postWithUser) => (
        <PostView key={postWithUser.post.id} {...postWithUser} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ id });

  if (!data) return <h1>404!!!</h1>;

  return (
    <>
      <Head>
        <title>{data?.username}</title>
      </Head>
      <PageLayout>
        <div className="flex items-center gap-4 p-1">
          <Link href={"/"} className="px-4">
            <FiArrowLeft size={24} />
          </Link>
          <div>
            <div className="text-[20px leading-6] font-bold">
              {data?.name ?? ""}
            </div>
            <div className="text-sm font-thin text-slate-400">{`${
              data?.postCount ?? ""
            } Tweet`}</div>
          </div>
        </div>
        <div className="relative h-36 bg-slate-600">
          <Image
            width={128}
            height={128}
            src={data?.profileImageUrl}
            alt={`${data?.username ?? "user"}'s profile`}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-6">
          <div className="text-2xl font-bold">{data?.name ?? ""}</div>
          <div className="text-base font-thin text-slate-600">{`@${
            data?.username ?? ""
          }`}</div>
        </div>
        <div className="w-full border-b border-slate-400"></div>
        <ProfileFeed userId={id} />
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
