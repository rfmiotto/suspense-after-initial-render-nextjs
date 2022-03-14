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
In this commit we display a loading spinner in the Sidebar component when the
data is not ready yet.

At this point, we are using a onClick in the anchor tag that is inside our Sidebar
component. This onClick has a preventDefault behavior of the browser to avoid
navigating once we click any of the links. We prevent that in order to wait loading
the data, and just then we navigate to that link.
But as soon as we start using preventDefault in our click handlers, we are treading
into dangerous waters in terms of breaking native browser functionality. So you
always wanna be careful about that. For example, here, if I command-click on one
of those links, I would expect it to open in another tab, but that just doesn't
happen. We've broken that behavior because of preventDefault.
To fix this, we added `if (e.ctrlKey || e.metaKey) return;` so that the anchor
tag behaves normally once we click on it.
So that is one of the reasons why simply pre-fetching the data and allow the
spinner to show on the screen seems to be a good trade-off.

As a (almost) last step to finish our application, I also put back our
onMouseEnter to pre-fetch the data.

But, our approach is actually still not handling every situation. If I were to
refresh the page so we have a cold cache and I click on a couple links quickly,
you'll see we have a funny behavior: we see multiple loading spinners and then
we transition to multiple pages sequentially. That is because we are not in
control of multiple pending transitions and these links don't actually know about
each other. The click events aren't aware that other transitions could be pending.
To solve this, we would need some sort of port controller where we push a stack
of pending transitions and if there is one we cancel the last one making sure
we only navigate to the last press click. As you can see, this gets kind of
involved pretty quickly, and that is another reason why simply pre-fetching data
onMouseEnter seems to be a good solution. It doesn't touch with the links, we
don't have to call preventDefault, Next is still in control of routing for us.

There is a new API coming to React 18 called useTransition which is designed to
solve this kind of problem.
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
