import { Logo } from "@/components/Logo";
import { UserContext } from "@/contexts/UserContext";
import {
  Button,
  Card,
  HStack,
  VStack,
  Text,
  Center,
  Box,
  Heading,
  SimpleGrid,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaArrowRight, FaLock, FaGlobeEurope, FaUsers } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { LuExternalLink, LuScrollText } from "react-icons/lu";
import { Link } from "react-router";
import { FeatureCard } from "./FeatureCard";

export const Home = () => {
  const { user } = useContext(UserContext);

  return (
    <Center>
      <VStack
        gap={6}
        marginTop="2em"
        marginBottom="4em"
        width={{ base: "94%", md: "70%", lg: "60%" }}
      >
        <Box
          width="100%"
          padding={{ base: "1.2em", md: "1.6em" }}
          margin="0"
          borderRadius="lg"
          bgGradient="to-br"
          gradientFrom="blue.50"
          gradientTo="purple.50"
        >
          <Logo size="large" showText marginTop="0.6em" />

          <HStack justifyContent="center" marginTop="2em">
            {!user && (
              <>
                <Link to="/login">
                  <Button>
                    Log In <FiLogIn />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" background="white">
                    Sign Up for Free
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <Link to="/app">
                <Button>
                  Welcome back, {user.username} <FaArrowRight width="0.6em" />
                </Button>
              </Link>
            )}
          </HStack>

          <VStack gap={4} marginTop="2em">
            <Heading size="lg" textAlign="center">
              Simply split expenses with your friends, without compromising your
              privacy.
            </Heading>
            <Text textAlign="center" fontSize="lg">
              Vaultoy Count is a group expense splitting app with end-to-end
              encryption, built as an alternative to apps like Tricount and
              Splitwise.
            </Text>
          </VStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} width="100%">
          <FeatureCard
            icon={FaLock}
            title="End-to-End Encrypted"
            titleColorPalette="purple"
            description={
              <Text>
                Your balances, transactions, and group data stay private. Only
                you and your group members can access them.
              </Text>
            }
          />

          <FeatureCard
            icon={FaUsers}
            title="Built for Simplicity"
            titleColorPalette="teal"
            description={
              <Text>
                A simple, intuitive experience to share expenses with your
                friends, roommates, or travel buddies.
              </Text>
            }
          />

          <FeatureCard
            icon={LuScrollText}
            title="Transparency"
            titleColorPalette="pink"
            description={
              <Text>
                The client{" "}
                <ChakraLink
                  href="https://github.com/Vaultoy"
                  variant="underline"
                  target="_blank"
                >
                  source code <LuExternalLink />
                </ChakraLink>{" "}
                and security{" "}
                <ChakraLink
                  href="/whitepaper"
                  variant="underline"
                  target="_blank"
                >
                  whitepaper
                  <LuExternalLink />
                </ChakraLink>{" "}
                are accessible for anyone to review and audit.
              </Text>
            }
          />

          <FeatureCard
            icon={FaGlobeEurope}
            title="Made & hosted in France 🇫🇷 🇪🇺"
            titleColorPalette="blue"
            description={
              <Text>
                You data is stored securely in France, under the European
                Union's GDPR regulations.
              </Text>
            }
          />
        </SimpleGrid>

        <Card.Root width="100%">
          <Card.Body>
            <Text>
              ⚠️ This is a very early prototype. Feel free to play around with
              it. However, be aware that until the project reaches a more mature
              state, I intent to <strong>regularly delete all data</strong> such
              as accounts and groups.
            </Text>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Center>
  );
};
