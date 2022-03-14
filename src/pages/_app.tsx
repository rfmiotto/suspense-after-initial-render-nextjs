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
Okay, once again we see that our app is working as expected. However, we are
still rendering this Lifecycle component and we have this isInitialRender state
in our MyApp. So maybe we can do better than this...

The first thing we are going to do is to move the state inside our SuspenseAfterInitialRender
component instead of passing it down as a prop. We are also going to move this
Lifecycle component inside the SuspenseAfterInitialRender.
Now, our SuspenseAfterInitialRender have the exact same signature of Suspense and
it provides a really simple and nice solution to our problem.
As a final touch, let's move the SuspenseAfterInitialRender and Lifecycle
definitions into a separate file so that we have a reusable component.
Notice that we don't have any complicated logic inside MyApp component anymore.

At the present moment (Jan 2022), Suspense from React has an unstable prop that
basically does the same thing, but they don't know if it is going to be added.
Since there is still no official solution to this, our approach seems to be
very nice and simple.
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
