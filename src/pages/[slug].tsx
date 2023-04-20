import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { FiArrowLeft } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

import { PostView } from "~/components/post-view";
import { LoadingPage } from "~/components/loading";

import { getUsernameFromUser } from "~/utils/info-exraction";

const ProfileFeed = (props: { userId: number }) => {
  const { data, isLoading } = api.tweets.getTweetsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || !data.length) return <h1>User has not posted</h1>;

  return (
    <div className="flex grow flex-col overflow-y-scroll">
      {data?.map((tweetWithUser) => (
        <PostView key={tweetWithUser.id} {...tweetWithUser} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ id: number }> = ({ id }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ id });

  if (!data) return <h1>404!!!</h1>;

  return (
    <>
      <Head>
        <title>{data?.name}</title>
      </Head>
      <PageLayout>
        <div className="flex items-center gap-4 p-1">
          <Link href={"/"} className="px-4">
            <FiArrowLeft size={24} />
          </Link>
          <div>
            <div className="text-[20px] font-bold leading-6">
              {data?.name ?? ""}
            </div>
            <div className="text-[13px] font-thin text-slate-400">{`${
              data?.tweets.length ?? ""
            } Tweet`}</div>
          </div>
        </div>
        <div className="relative h-48 bg-slate-600">
          <Image
            height={192}
            width={192}
            src={
              "https://pbs.twimg.com/profile_banners/171393795/1619389264/1500x500"
            }
            alt="banner"
            className="absolute left-0 top-0 h-full w-full object-cover"
          />
          <Image
            width={128}
            height={128}
            src={data?.image ?? "/avatar.png"}
            alt={`${data?.name ?? "user"}'s profile`}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-6">
          <div className="text-2xl font-bold">{data?.name ?? ""}</div>
          <div className="text-base font-thin text-slate-600">
            {`@${getUsernameFromUser(data)}`}
          </div>
        </div>
        <div className="w-full border-b border-slate-400"></div>
        <ProfileFeed userId={id} />
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

  if (!context.params?.slug) throw new Error("No slug");

  const slug = parseInt(context.params?.slug as string);

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
