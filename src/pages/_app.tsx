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
Okay, we want the inner Suspense boundary to exist so that we keep the sidebar 
always rendered while the messages are being loaded, but if we have a message
selected in initial render, we only want one spinner.
Really what we want is 2 different trees based on whether it is the initial render.
So if we had some state here to store if it is an initial render, we would be
all set. But do we know when this initial render has finished?
*We can use the fact that side effects don't run within a Suspense boundary until*
*all of the components have finished suspending.*
To exemplify this, let's create a NewComponent and place it inside a Suspense
Boundary. Notice that the message "MyApp rendered" will be logged in the console
but the "NewComponent rendered" message will only be logged after all these
components finish suspending. That only occurs because NewComponent is sitting
inside a Suspense tree. We can use this fact to pass down a callback that says
"hey, it's not an initial render anymore".
This solution basically solves our problem, but there is a lot of boilerplate
here: we have this isInitialRender state, we have this NewComponent, and also
we are duplicating our Component (the Message) because of this two different
trees.
Let's refactor this code...
*/

function NewComponent({ afterRender }: { afterRender: () => void }) {
  useEffect(() => {
    console.log("NewComponent rendered");
    afterRender();
  }, []);

  return null;
}

function MyApp({ Component, pageProps }: AppProps) {
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    console.log("MyApp rendered");
  }, []);

  return (
    <div className="flex h-screen bg-zinc-800 text-zinc-100 antialiased">
      <Suspense fallback={<Spinner />}>
        <QueryClientProvider client={queryClient}>
          <Sidebar />

          <NewComponent
            afterRender={() => {
              setIsInitialRender(false);
            }}
          />

          <div className="flex w-full bg-zinc-900">
            {isInitialRender ? (
              <Component {...pageProps} />
            ) : (
              <Suspense fallback={<Spinner />}>
                <Component {...pageProps} />
              </Suspense>
            )}
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
