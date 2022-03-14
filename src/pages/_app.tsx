import { Suspense, useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ErrorBoundary } from "react-error-boundary";

import "../styles/globals.css";
import "../services/mirage";
import { queryClient } from "../services/queryClient";
import { SuspenseAfterInitialRender } from "../components/SuspenseAfterInitialRender";
import { Sidebar } from "../components/Sidebar";
import { Spinner } from "../components/Spinner";

function ErrorFallback() {
  return (
    <div role="alert" className="m-4 bg-red-600 p-4 text-white">
      <p className="text-lg">Something went wrong</p>
    </div>
  );
}

/*
In previous commits we saw how to suspend our application during initial render
to fix the spinner waterfall behavior. Now, we are going to improve UX by
removing the spinner whenever we can. We will start off by pre-fetching the
data when the user hovers one of the messages in the sidebar.
The most natural place to put this logic is inside MessageLink component, since
that is the target component that is going to pre-fetch data when hovered.

But notice something:
In our Message component, we call the API using:
`const response = await api.get(`messages/${query.mid}`);`
and then in the Sidebar component we do the same thing:
`const response = await api.get(`messages/${message.id}`);`
So we have some duplication here and if one of the URL changes, we would have
to modify the code in 2 different parts. In the next commit, we will fix this
and make something very simple to share this common URL.
*/

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex h-screen bg-zinc-800 text-zinc-100 antialiased">
      <Suspense fallback={<Spinner />}>
        <QueryClientProvider client={queryClient}>
          <Sidebar />

          <div className="flex w-full bg-zinc-900">
            <SuspenseAfterInitialRender fallback={<Spinner />}>
              <Component {...pageProps} />
            </SuspenseAfterInitialRender>
          </div>

          <ReactQueryDevtools />
        </QueryClientProvider>
      </Suspense>
    </div>
  );
}

function Wrapper({ Component, pageProps }: AppProps) {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const router = useRouter();

  // I use this so I only have to worry about CSR.
  useEffect(() => {
    if (router.isReady) {
      setIsInitialRender(false);
    }
  }, [router.isReady]);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {!isInitialRender && <MyApp Component={Component} {...pageProps} />}
    </ErrorBoundary>
  );
}

export default Wrapper;
