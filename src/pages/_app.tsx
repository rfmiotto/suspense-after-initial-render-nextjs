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
In order to fix our URL duplication, we simply created a function called
`messageUrl` that takes care of that. Maybe in a bigger application, we might
have hooks such as a "useMessage" for example that takes care of this kind of
stuff. But here we are taking a simple approach.

Ok, we are pre-fetching and we no longer have URL duplication, but there is still
a problem in our app:
If we hover a fresh message link and then quickly click on it, we still see the
spinner. It is arguable whether or not this is a good trade off between code
complexity and improving UX. In my personal opinion, the code as it is right now
is just perfect. We are pre-fetching and in some occasions, there is nothing
wrong with showing a spinner when the message is being fetched.

But say we really want to prevent navigation until the data was loaded on click,
thereby completely removing the spinners. How would we do that? Let's see in the
next commit...
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
