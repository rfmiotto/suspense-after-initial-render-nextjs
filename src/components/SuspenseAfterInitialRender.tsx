import { ReactElement, Suspense, useEffect, useState } from "react";

function Lifecycle({ afterRender }: { afterRender: () => void }) {
  useEffect(() => {
    afterRender();
  }, []);

  return null;
}

function SuspenseAfterInitialRender({
  fallback,
  children,
}: {
  fallback: ReactElement;
  children: ReactElement;
}) {
  const [isInitialRender, setIsInitialRender] = useState(true);

  return isInitialRender ? (
    <>
      {children}
      <Lifecycle
        afterRender={() => {
          setIsInitialRender(false);
        }}
      />
    </>
  ) : (
    <Suspense fallback={fallback}>{children}</Suspense>
  );
}

export { SuspenseAfterInitialRender };
