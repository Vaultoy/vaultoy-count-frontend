import {
  AbsoluteCenter,
  Button,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
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
      <Heading textAlign="center">{title}</Heading>
      <Text marginBottom="2em" textAlign="center">
        {description}
      </Text>
      <Link to="/">
        <Button>
          <MdArrowBack /> Back to Home
        </Button>
      </Link>
    </VStack>
  </AbsoluteCenter>
);
