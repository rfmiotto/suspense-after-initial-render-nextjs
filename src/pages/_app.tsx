import { Suspense, useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ErrorBoundary } from "react-error-boundary";

import "../styles/globals.css";
import "../services/mirage";
import { queryClient } from "../services/queryClient";
import { Sidebar } from "../components/Sidebar";
import Spinner from "../components/Spinner";

function ErrorFallback() {
  return (
    <div role="alert" className="m-4 bg-red-600 p-4 text-white">
      <p className="text-lg">Something went wrong</p>
    </div>
  );
}

/*
In this example, when we load the page for the first time (or during a refresh),
we see a loading spinner. This app was already wired up using Suspense, and we
have 2 components: a Sidebar and a component on the right that display the message.
As the Sidebar component fetches its own messages, we see that root suspense
boundary rendering the spinner while both components are loading their data.
But, there is something funny going on: once you start click different messages
that haven't been loaded yet, we fallback to that root suspense boundary, because
that is how Suspense works. Anytime a component fetches data with a Suspense,
React will render the next Suspense boundaries. Here, we don't want to render
the Suspense root boundary because it gives us a weird behavior.
Fortunately, Suspense supports nested boundaries, so we can solve this problem
by adding another boundary wrapping our `Component`. Now, the Component, which
in our case is going to be the Message component, is the only component fetching
data and React will leave the Sidebar render.
But now look at what happens when we refresh the page when a message is selected:
we have this sort of waterfall spinner problem whenever we start at an specific
message. After refreshing the page, we see the main spinner, then the Sidebar is
rendered and since the message takes longer to load, we see another spinner.
Here the Sidebar request is finishing first, so React will go ahead and render it,
but since the Message takes longer to complete its request and it is wrapped under
another Suspense boundary, we see that loading spinner.
So we are kind of in a middle of a pickle here: we want the inner Suspense boundary
to exist so that we keep the sidebar always rendered while the messages are being
loaded, but if we have a message selected in initial render, we only want one
spinner. How can we solve this problem?
*/

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex h-screen bg-zinc-800 text-zinc-100 antialiased">
      <Suspense fallback={<Spinner />}>
        <QueryClientProvider client={queryClient}>
          <Sidebar />

          <div className="flex w-full bg-zinc-900">
            <Suspense fallback={<Spinner />}>
              <Component {...pageProps} />
            </Suspense>
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
