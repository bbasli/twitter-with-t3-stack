import type { NextPage } from "next";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import React from "react";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/post-view";
import { signIn, signOut, useSession } from "next-auth/react";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { data: sessionData } = useSession();

  const [content, setContent] = React.useState<string>("");

  if (!sessionData) return null;

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.tweets.create.useMutation({
    onSuccess: () => {
      setContent("");
      void ctx.tweets.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err?.data?.zodError?.fieldErrors?.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <div className="flex w-full gap-4">
      <Image
        width={56}
        height={56}
        alt={"Profile image"}
        className="rounded-full"
        src={sessionData.user.image ?? ""}
      />
      <input
        type="text"
        value={content}
        disabled={isPosting}
        placeholder="Type just some emojis"
        onChange={(e) => setContent(e.target.value)}
        className="grow bg-transparent outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            mutate({ content });
          }
        }}
      />
      {content !== "" && !isPosting && (
        <button onClick={() => mutate({ content })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={24} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.tweets.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex grow flex-col overflow-y-scroll">
      {data?.map((postWithUser) => (
        <PostView key={postWithUser.id} {...postWithUser} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  // Start fetching asap
  api.tweets.getAll.useQuery();

  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4">
        <div className="flex justify-end">
          <button
            className="rounded-full bg-slate-600 px-6 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </button>
        </div>
        {sessionData && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
