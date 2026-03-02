import { Italic } from "@/components/Italic";
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

const FIGURE_LOGIN = 1;
const FIGURE_JOIN = 2;

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
            Figure {FIGURE_LOGIN} below illustrates how the encryption keys are
            derived, and how group data is decrypted on the client side.
          </Text>

          <Text
            color="gray.500"
            fontStyle="italic"
            textAlign="center"
            marginTop="1em"
            alignSelf="center"
          >
            Figure {FIGURE_LOGIN}: Login and decryption flow of Vaultoy Count
          </Text>
          <Image
            src="/vaultoy_count_login_flow.png"
            alt="Vaultoy Count Login Flow"
            width={{ base: "100%", md: "50%" }}
            alignSelf="center"
          />
          <Heading as="h3" textAlign="left" marginTop="2em" size="lg">
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
            In this section, we discuss how the <Italic>password key</Italic>{" "}
            and the <Italic>authentication token</Italic> shown in Figure{" "}
            {FIGURE_LOGIN} are derived from the user's username and password.
            This process is critical as the <Italic>password key</Italic> is
            used (indirectly) to encrypt and decrypt all sensitive data, while
            the <Italic>authentication token</Italic> is used to authenticate
            the user to the server.
            <br />
            <br />
            First, a salt is derived by applying a hash function (
            <Italic>sha256</Italic>) to a combination of a static string common
            to all users of this application and the user's username. While a
            random salt is generally recommended, it doesn't apply well to
            end-to-end encrypted applications as the salt needs to be stored on
            the backend. As such, the backend could perform a downgrade attack
            by providing a known salt to the client. By deriving the salt from
            the username, we ensure that the client is safe from such attacks.
            <br />
            <br />
            Next, the <strong>argon2id</strong> key derivation function is
            applied to the user's password, using the aforementioned salt to
            obtain the <Italic>input key material</Italic>. This process is
            computationally expensive on purpose to make brute-force attacks
            more difficult. The parameters used for argon2id are as follows:
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
            The resulting <Italic>input key material</Italic> is used to derive
            two secrets: the <Italic>password key</Italic> and the{" "}
            <Italic>authentication token</Italic>. This is done using a HKDF key
            derivation function based on <Italic>sha256</Italic>. The two HKDF
            operations use a different <Italic>information</Italic> parameter.
            This ensures that the knownledge of the authentication token does
            not allow an attacker to derive the <Italic>password key</Italic>.
            This way, the server can{" "}
            <strong>
              authenticate the user without ever having access to the{" "}
              <Italic>password key</Italic> or the user's password
            </strong>
            .
            <br />
            <br />
            The <Italic>authentication token</Italic> is sent to the server in
            the login request. It is hashed once again on the server side using
            argon2id with a random salt and the same parameters as above. While
            the confidentiality of the user's data does not rely on the
            protection of the authentication token, hashing it one more time on
            the server side adds an additional layer of security to protect the
            user's account and password.
          </Text>

          <Heading as="h2" textAlign="left" marginTop="2em">
            Joining a group and creating group invitation links
          </Heading>
          <Text
            color="gray.500"
            fontStyle="italic"
            marginTop="0.5em"
            textAlign="justify"
          >
            The implementation of the group sharing and joining processes can be
            found on{" "}
            <Link
              color="gray.500"
              href="https://github.com/Vaultoy/vaultoy-count-frontend/blob/main/src/utils/groupInvitationDerivation.ts"
              variant="underline"
              target="_blank"
            >
              vaultoy-count-frontend/src/utils/groupInvitationDerivation.ts
            </Link>
          </Text>

          <Text textAlign="justify">
            This section describes how the group sharing and joining processes
            work. The solution we implement is designed to allow users to share
            the group encryption key to people they send their invitation link
            to,{" "}
            <strong>
              without ever giving any way for the server to decrypt the group
              data
            </strong>
            . Figure {FIGURE_JOIN} below illustrates how a user can join a group
            using an invitation link, and how the encryption keys are derived in
            this flow.
          </Text>

          <Text
            color="gray.500"
            fontStyle="italic"
            textAlign="center"
            marginTop="1em"
            alignSelf="center"
          >
            Figure {FIGURE_JOIN}: Group joining flow of Vaultoy Count
          </Text>
          <Image
            src="/vaultoy_count_join_flow.png"
            alt="Vaultoy Count Join Flow"
            width={{ base: "100%", md: "50%" }}
            alignSelf="center"
          />

          <Heading as="h3" textAlign="left" marginTop="2em" size="lg">
            Joining a group using an invitation link
          </Heading>

          <Text textAlign="justify" marginTop="0.5em">
            The invitation link contains both the id of the group that the user
            wants to join and the <Italic>invitation link secret</Italic>. As
            shown in Figure {FIGURE_JOIN}, this secret is used to derive the{" "}
            <Italic>invitation authentication token</Italic> and the{" "}
            <Italic>invitation key</Italic>. The{" "}
            <Italic>invitation authentication token</Italic> is sent to the
            server in the first group joining request to prove to the server the
            knowledge of the invitation secret, without disclosing this secret
            or the <Italic>invitation key</Italic> to the server. If the token
            is valid, the server will return the encrypted group data.
            <br />
            <br />
            Then, the client can use his <Italic>invitation key</Italic> to
            decrypt the <Italic>invitation group key</Italic> included in the
            server's response. The client can then decrypt the group data using
            the <Italic>group key</Italic>. The user is then asked to choose who
            he is in the list of group members. After this, the client encrypts
            the <Italic>invitation group key</Italic> with the user's{" "}
            <Italic>user key</Italic>. The way the <Italic>user key</Italic> is
            derived from the user's password is described in the previous
            section.
            <br />
            <br />
            Finally, the client sends the newly encrypted{" "}
            <Italic>group key</Italic>, the user's choice of group member, and
            the <Italic>invitation authentication token</Italic> to the server
            to complete the group joining process.
          </Text>

          <Heading as="h3" textAlign="left" marginTop="2em" size="lg">
            Creating the group invitation link
          </Heading>

          <Text textAlign="justify" marginTop="0.5em">
            To create a group invitation link, the client first generates a
            random <Italic>invitation link secret</Italic> of 32 bytes. This
            secret is used to derive the{" "}
            <Italic>invitation authentication token</Italic> and the{" "}
            <Italic>invitation key</Italic> in the same way as described in the
            previous subsection.
            <br />
            <br />
            The client encodes the <Italic>invitation link secret</Italic> in a
            URL format and displays it, so that the user can share it with other
            people. When joining the group, the other users will need to obtain
            a <Italic>group key</Italic>. Therefore, when creating the
            invitation link, the client also encrypts the{" "}
            <Italic>group key</Italic> with the <Italic>invitation key</Italic>{" "}
            and sends the encrypted <Italic>invitation group key</Italic> to the
            server. The client also sends the{" "}
            <Italic>invitation authentication token</Italic>.
            <br />
            <br />
            To allow group administrators to see previously generated invitation
            links, the client also encrypts the{" "}
            <Italic>invitation link secret</Italic> with the{" "}
            <Italic>group key</Italic> and sends the encrypted{" "}
            <Italic>invitation link secret</Italic> to the server. This way, the
            server can store the encrypted{" "}
            <Italic>invitation link secret</Italic> without ever having access
            to it, and send it back to the client when needed.
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  </Center>
);
