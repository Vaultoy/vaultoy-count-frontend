import { Link } from "react-router";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "../components/ui/password-input";
import {
  AbsoluteCenter,
  Button,
  Card,
  Center,
  Heading,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";

export const LoginSignup = ({ isLogin }: { isLogin: boolean }) => {
  return (
    <AbsoluteCenter>
      <Card.Root padding="1em">
        <Card.Header>
          <HStack justifyContent="space-between">
            <Heading>{isLogin ? "Log In" : "Sign Up"}</Heading>
            <Link to={isLogin ? "/signup" : "/login"}>
              <Button variant="outline">
                {isLogin ? "Sign up" : "Log in"} instead
              </Button>
            </Link>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Text>Username</Text>
          <Input />
          <Text marginTop="1em">Password</Text>
          <PasswordInput />
          {!isLogin && (
            <>
              <Text marginTop="1em">Confirm Password</Text>
              <PasswordInput />
              <PasswordStrengthMeter marginTop="1em" value={3} />
              <Text marginTop="1em" color="gray">
                This password will be used as a key to encrypt your data.
                <br />
                Therefore, we recommend that you use a long and complex password
                that you don't use anywhere else.
              </Text>
            </>
          )}
        </Card.Body>
        <Card.Footer>
          <Button>{isLogin ? "Log in" : "Sign up"}</Button>
        </Card.Footer>
      </Card.Root>
    </AbsoluteCenter>
  );
};
