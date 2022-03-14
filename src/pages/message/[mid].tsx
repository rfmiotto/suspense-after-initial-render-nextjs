import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { Spinner } from "../../components/Spinner";
import api from "../../services/api";

type MessageResponse = {
  message: {
    title: string;
    body: string;
  };
};

export default function Message() {
  const { query } = useRouter();

  const { data } = useQuery<MessageResponse, Error>(
    ["messages", String(query.mid)],
    async () => {
      const response = await api.get(`messages/${query.mid}`);
      return response.data;
    },
    { suspense: true }
  );

  return (
    <div className="w-full overflow-y-scroll p-8">
      {data ? (
        <>
          <h1 className="text-2xl font-bold">{data.message.title}</h1>

          <div className="mt-6 space-y-2 text-zinc-400">
            {data.message.body.split("\n").map((paragraph) => (
              <p key={Math.random()}>{paragraph}</p>
            ))}
          </div>
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
