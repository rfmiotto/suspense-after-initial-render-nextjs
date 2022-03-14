import { ReactElement, Suspense, useEffect, useState } from "react";
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
Let's refactor this code...
Instead of "NewComponent", let's give it a better name: "Lifecycle", after all
that is what it is about.
We also want to have the same signature of Suspense to render our component
depending on whether it is an initial render. So let's substitute that ternary
operator by a "SuspenseAfterInitialRender" component. This component will
essentially communicate that this won't suspend the first time it's rendered, but
after that first render it will insert this Suspense boundary into our tree.
Creating this component is actually not hard. We have already coded all the logic
before, so all we have done here was to move it inside SuspenseAfterInitialRender.

Okay, once again we see that our app is working as expected. However, we are
still rendering this Lifecycle component and we have this isInitialRender state
in our MyApp. So maybe we can do better than this...
*/

function Lifecycle({ afterRender }: { afterRender: () => void }) {
  useEffect(() => {
    afterRender();
  }, []);

  return null;
}

function SuspenseAfterInitialRender({
  fallback,
  isInitialRender,
  children,
}: {
  fallback: ReactElement;
  isInitialRender: boolean;
  children: ReactElement;
}) {
  return isInitialRender ? (
    children
  ) : (
    <Suspense fallback={fallback}>{children}</Suspense>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const [isInitialRender, setIsInitialRender] = useState(true);

  return (
    <div className="flex h-screen bg-zinc-800 text-zinc-100 antialiased">
      <Suspense fallback={<Spinner />}>
        <QueryClientProvider client={queryClient}>
          <Sidebar />

          <Lifecycle
            afterRender={() => {
              setIsInitialRender(false);
            }}
          />

          <div className="flex w-full bg-zinc-900">
            <SuspenseAfterInitialRender
              fallback={<Spinner />}
              isInitialRender={isInitialRender}
            >
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
