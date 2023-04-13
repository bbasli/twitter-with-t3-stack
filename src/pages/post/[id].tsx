import type { NextPage } from "next";

import Head from "next/head";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex	min-h-screen justify-center">SinglePostPage</main>
    </>
  );
};

export default SinglePostPage;
