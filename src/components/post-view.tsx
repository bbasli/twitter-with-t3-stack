import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { RouterOutputs } from "~/utils/api";

export type TweetWithAuthor = RouterOutputs["tweets"]["getAll"][number];

dayjs.extend(relativeTime);

export const PostView = (props: TweetWithAuthor) => {
  const { author, ...tweet } = props;

  return (
    <div className="flex items-center gap-4 border-b border-slate-400 p-4">
      <Image
        width={48}
        height={48}
        alt={author.name ?? ""}
        className="rounded-full"
        src={author.image ?? ""}
      />
      <div>
        <div className="flex gap-2 text-slate-300">
          <Link href={`/${author.id}`}>
            <span>{`@${author.name ?? ""}`}</span>
          </Link>
          <Link href={`/post/${tweet.id}`}>
            <span className="font-thin">{` · ${dayjs(
              tweet.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-xl">{tweet.text}</span>
      </div>
    </div>
  );
};
