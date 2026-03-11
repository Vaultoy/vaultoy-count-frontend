import { Center, Spinner } from "@chakra-ui/react";
import { Suspense } from "react";

export const LazyPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <Center marginTop="30vh">
          <Spinner size="xl" />
        </Center>
      }
    >
      {children}
    </Suspense>
  );
};
