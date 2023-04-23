import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { api, type RouterOutputs } from "~/utils/api";
import { getUsernameFromUser } from "~/utils/info-exraction";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faRetweet,
  faComment,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

export type TweetWithAuthor = RouterOutputs["tweets"]["getAll"][number];

dayjs.extend(relativeTime);

export const TweetView = (props: TweetWithAuthor) => {
  const { author, ...tweet } = props;

  const like = api.tweets.likeTweet.useMutation();

  const handleLikeClick = () => {
    like.mutate({ tweetId: tweet.id });
  };

  const isUserLiked = tweet.likes.some(
    (like) => like.userId === props.author.id
  );

  return (
    <article className="flex gap-4 border-b border-slate-400 p-4">
      <Image
        width={48}
        height={48}
        alt={author.name ?? ""}
        className="h-12 rounded-full"
        src={
          author.image ??
          "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"
        }
      />
      <div className="flex flex-1 flex-col gap-2">
        <div>
          <div className="flex gap-2 text-slate-300">
            <Link href={`/${author.id}`}>
              <span className="font-bold">{`${author.name ?? ""}`}</span>
              <span className="ml-4 font-thin text-gray-500">{`@${
                getUsernameFromUser(author) ?? ""
              }`}</span>
            </Link>
            <Link href={`/tweet/${tweet.id}`}>
              <span className="font-thin text-gray-500">{` · ${dayjs(
                tweet.createdAt
              ).fromNow()}`}</span>
            </Link>
          </div>
          <span className="text-sm">{tweet.text}</span>
        </div>
        <div className="mt-2 flex h-[16px] gap-20">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faComment} />
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faRetweet} />
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faHeart}
              style={
                isUserLiked
                  ? { color: "#ff0000", cursor: "pointer" }
                  : { cursor: "pointer" }
              }
              onClick={handleLikeClick}
            />
            {tweet.likes.length > 0 && (
              <span className="ml-1 text-sm">{tweet.likes.length}</span>
            )}
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faChartSimple} />
          </div>
        </div>
      </div>
    </article>
  );
};
