import { useQuery } from "react-query";
import Link from "next/link";
import { useRouter } from "next/router";

import { useState } from "react";
import { Spinner } from "./Spinner";
import api from "../services/api";
import { queryClient } from "../services/queryClient";
import { messageUrl } from "../pages/message/[mid]";

type MessageType = {
  id: string;
  title: string;
  body: string;
};

type MessageLinkProps = {
  message: MessageType;
};

type MessagesResponse = {
  messages: MessageType[];
};

function MessageLink({ message }: MessageLinkProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const active = router.asPath === `/message/${message.id}`;
  const href = `/message/${message.id}`;

  const fetchMessage = async () => {
    const response = await api.get(messageUrl(message.id));
    return response.data;
  };

  const handlePreFetchData = async () => {
    await queryClient.prefetchQuery(
      ["messages", String(message.id)],
      fetchMessage,
      { staleTime: 30 * 60 * 1000 }
    );
  };

  return (
    <Link href={href} passHref>
      <a
        href="/"
        className={`
        ${
          active
            ? "bg-blue-600 text-blue-50"
            : "text-white hover:bg-zinc-700/50"
        } 
        relative block truncate rounded px-2 py-2 pr-4 text-left text-sm`}
        onClick={async (e) => {
          if (e.ctrlKey || e.metaKey) return;

          e.preventDefault();

          setIsPending(true);

          await queryClient.cancelQueries("messages");
          await handlePreFetchData();

          setIsPending(false);

          router.push(href);
        }}
        onMouseEnter={handlePreFetchData}
      >
        {message.title}

        {isPending && (
          <span className="absolute inset-y-0 right-0 flex pr-1">
            <Spinner size="s" />
          </span>
        )}
      </a>
    </Link>
  );
}

export function Sidebar() {
  const { data } = useQuery<MessagesResponse, Error>(
    "messages",
    async () => {
      const response = await api.get("/messages");
      return response.data;
    },
    { suspense: true }
  );

  return (
    <div className="flex flex-col border-r border-zinc-700">
      <Link href="/">
        <a className="block px-2 py-3 text-xs font-medium text-zinc-400 hover:text-zinc-200">
          All messages
        </a>
      </Link>

      <div className="w-48 flex-1 space-y-1 px-2 pt-2">
        {data ? (
          data?.messages.map((message) => (
            <MessageLink message={message} key={message.id} />
          ))
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
}
