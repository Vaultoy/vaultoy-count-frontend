import { argon2idParams } from "@/encryption/derivationParams";
import {
  Card,
  Center,
  Heading,
  Image,
  Link,
  List,
  Text,
  VStack,
} from "@chakra-ui/react";

export const WhitepaperPage = () => (
  <Center>
    <Card.Root
      marginTop="2em"
      marginBottom="4em"
      width={{ base: "94%", md: "70%", lg: "60%" }}
    >
      <Card.Header>
        <Heading marginTop="1em" textAlign="center" size="2xl">
          Vaultoy Count Security Whitepaper
        </Heading>
      </Card.Header>
      <Card.Body>
        <VStack margin={{ base: "0", md: "2em" }} alignItems="start">
          <Text textAlign="justify">
            This document describes the design security and cryptographic
            concepts behind the end-to-end encrypted Vaultoy Count application.
          </Text>
          <Heading as="h2" textAlign="left" marginTop="2em">
            Summary
          </Heading>
          <Text textAlign="justify">
            Most importantly, Vaultoy Count is designed in a way that the server{" "}
            <strong>never has access to any sensitive data</strong> such as
            group names, transactions, etc. Instead, all sensitive data is{" "}
            <strong>encrypted on the client side</strong> before it is sent to
            the server. This means that even if an attacker was able to
            compromise the server and gain access to the database, they would
            not be able to read any sensitive data.
            <br />
            <br />
            The encryption and decryption of data is done using a key that is{" "}
            <strong>derived from the user's password</strong> using a key
            derivation function. The{" "}
            <strong>
              user password and the decryption keys are never sent to the server
            </strong>
            .
          </Text>

          <Heading as="h2" textAlign="left" marginTop="2em">
            Encryption and Decryption Flow
          </Heading>
          <Text textAlign="justify">
            Figure 1 below illustrates how the encryption keys are derived, and
            how group data is decrypted on the client side.
          </Text>

          <Text
            color="gray.500"
            fontStyle="italic"
            textAlign="center"
            marginTop="1em"
            alignSelf="center"
          >
            Figure 1: Login and decryption flow of Vaultoy Count
          </Text>
          <Image
            src="/vaultoy_count_login_flow.png"
            alt="Vaultoy Count Login Flow"
            width={{ base: "100%", md: "50%" }}
            alignSelf="center"
          />
          <Heading as="h3" textAlign="left" marginTop="2em">
            Key derivation
          </Heading>
          <Text
            color="gray.500"
            fontStyle="italic"
            marginTop="0.5em"
            textAlign="justify"
          >
            The implementation of the key derivation process can be found on{" "}
            <Link
              color="gray.500"
              href="https://github.com/Vaultoy/vaultoy-count-frontend/blob/main/src/utils/keyDerivation.worker.ts"
              variant="underline"
              target="_blank"
            >
              vaultoy-count-frontend/src/utils/keyDerivation.worker.ts
            </Link>
          </Text>
          <Text textAlign="justify" marginTop="0.5em">
            In this section, we discuss how the{" "}
            <span style={{ fontStyle: "italic" }}>password key</span> and the{" "}
            <span style={{ fontStyle: "italic" }}>authentication token</span>{" "}
            shown in Figure 1 are derived from the user's username and password.
            This process is critical as the{" "}
            <span style={{ fontStyle: "italic" }}>password key</span> is used
            (indirectly) to encrypt and decrypt all sensitive data, while the{" "}
            <span style={{ fontStyle: "italic" }}>authentication token</span> is
            used to authenticate the user to the server.
            <br />
            <br />
            First, a salt is derived by applying a hash function (
            <span style={{ fontStyle: "italic" }}>sha256</span>) to a
            combination of a static string common to all users of this
            application and the user's username. While a random salt is
            generally recommended, it doesn't apply well to end-to-end encrypted
            applications as the salt needs to be stored on the backend. As such,
            the backend could perform a downgrade attack by providing a known
            salt to the client. By deriving the salt from the username, we
            ensure that the client is safe from such attacks.
            <br />
            <br />
            Next, the <strong>argon2id</strong> key derivation function is
            applied to the user's password, using the aforementioned salt to
            obtain the{" "}
            <span style={{ fontStyle: "italic" }}>input key material</span>.
            This process is computationally expensive on purpose to make
            brute-force attacks more difficult. The parameters used for argon2id
            are as follows:
          </Text>
          <List.Root marginLeft="1.5em" marginTop="0.5em" marginBottom="0.5em">
            <List.Item>Parallelism: {argon2idParams.parallelism}</List.Item>
            <List.Item>Iterations: {argon2idParams.iterations}</List.Item>
            <List.Item>
              Memory Size: {argon2idParams.memorySize / 1024} MiB
            </List.Item>
          </List.Root>
          <Text textAlign="justify">
            Those parameters are chosen to strike a balance between security and
            performance, ensuring that the key derivation process is
            sufficiently slow to deter brute-force attacks while still providing
            a good user experience. Those parameters offer a stronger security
            than the{" "}
            <Link
              href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id"
              variant="underline"
              target="_blank"
            >
              OWASP recommendation
            </Link>{" "}
            and the{" "}
            <Link
              href="https://bitwarden.com/help/kdf-algorithms/#argon2id"
              variant="underline"
              target="_blank"
            >
              Bitwarden defaults
            </Link>
            .
            <br />
            <br />
            The resulting{" "}
            <span style={{ fontStyle: "italic" }}>input key material</span> is
            used to derive two secrets: the{" "}
            <span style={{ fontStyle: "italic" }}>password key</span> and the{" "}
            <span style={{ fontStyle: "italic" }}>authentication token</span>.
            This is done using a HKDF key derivation function based on{" "}
            <span style={{ fontStyle: "italic" }}>sha256</span>. The two HKDF
            operations use a different{" "}
            <span style={{ fontStyle: "italic" }}>information</span> parameter.
            This ensures that the knownledge of the authentication token does
            not allow an attacker to derive the{" "}
            <span style={{ fontStyle: "italic" }}>password key</span>. This way,
            the server can{" "}
            <strong>
              authenticate the user without ever having access to the{" "}
              <span style={{ fontStyle: "italic" }}>password key</span> or the
              user's password
            </strong>
            .
            <br />
            <br />
            The{" "}
            <span style={{ fontStyle: "italic" }}>authentication token</span> is
            sent to the server in the login request. It is hashed once again on
            the server side using argon2id with a random salt and the same
            parameters as above. While the confidentiality of the user's data
            does not rely on the protection of the authentication token, hashing
            it one more time on the server side adds an additional layer of
            security to protect the user's account and password.
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  </Center>
);
