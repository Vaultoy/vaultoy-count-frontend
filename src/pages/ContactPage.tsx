import { EmailButton } from "@/components/EmailButton";
import {
  Card,
  Center,
  Heading,
  List,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";

export const ContactPage = () => (
  <Center>
    <Card.Root
      marginTop="2em"
      marginBottom="4em"
      width={{ base: "94%", md: "70%", lg: "60%" }}
    >
      <Card.Header>
        <Heading marginTop="1em" textAlign="center" size="2xl">
          Contact Us
        </Heading>
      </Card.Header>

      <Card.Body>
        <VStack margin={{ base: "0", md: "2em" }} alignItems="start">
          <Text textAlign="justify">
            If you have any questions, feedback, GDPR requests, or simply would
            like to get in touch with us, please feel free to reach out!
          </Text>
          <List.Root
            marginLeft="1.5em"
            marginTop="1.5em"
            marginBottom="0.5em"
            gap="1em"
          >
            <List.Item>
              <HStack wrap="wrap">
                For general inquiries:{" "}
                <EmailButton mailUser="contact" mailDomain="vaultoy.com" />
              </HStack>
            </List.Item>
            <List.Item>
              <HStack wrap="wrap">
                For reporting vulnerabilities:{" "}
                <EmailButton mailUser="security" mailDomain="vaultoy.com" />
              </HStack>
            </List.Item>
          </List.Root>
        </VStack>
      </Card.Body>
    </Card.Root>
  </Center>
);
