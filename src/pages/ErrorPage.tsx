import {
  AbsoluteCenter,
  Button,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router";

export const ErrorPage = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <AbsoluteCenter>
    <VStack>
      <Heading>{title}</Heading>
      <Text marginBottom="2em">{description}</Text>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </VStack>
  </AbsoluteCenter>
);
