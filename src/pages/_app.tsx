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
Now, let's see how to prevent navigation until the data was loaded on click,
thereby completely removing the spinners.
Just to show the point, let's use the onClick instead of onMouseEnter in our
Sidebar component. We will later add the onMouseEnter behavior, don't worry.
In the onClick logic, we will prevent the default behavior of the browser
(prevent refreshing the page) we will load the data and just then push to the
href. With this approach we are basically pausing the app until the data is
ready and, just like before, if this data is already in cache, the transition
is instant.

If the time for the data to get ready is low, this solution gives actually a
great UX. A lot of native iOS apps don't show loading states until something
takes a certain amount of time. So if we get lucky here and our data loads quick,
this is an okay approach. But, depending on the situation, there is a good change
you wanna show some feedback to your user. If the data takes too long to be
ready, it is gonna feel like if the app is broken.

In the next commit we are going to fix that.
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
