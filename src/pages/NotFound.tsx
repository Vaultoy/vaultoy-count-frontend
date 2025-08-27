import {
  AbsoluteCenter,
  Button,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router";

export const NotFoundPage = () => (
  <AbsoluteCenter>
    <VStack>
      <Heading>404 - Page Not Found</Heading>
      <Text marginBottom="2em">
        Unfortunately, the page you were looking for was not found.
      </Text>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </VStack>
  </AbsoluteCenter>
);
