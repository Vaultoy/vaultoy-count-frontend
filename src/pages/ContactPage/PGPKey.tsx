import { toaster } from "@/components/ui/toast-store";
import { Button, HStack, List, Text, useClipboard } from "@chakra-ui/react";
import { LuClipboard, LuClipboardCheck } from "react-icons/lu";

const pgpKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEaZ4TsBYJKwYBBAHaRw8BAQdApXCmEQ9ILdsTGdUFfPmvOW2b6cz/COykSSa5
Y+DakSu0HlZhdWx0b3kgPHNlY3VyaXR5QHZhdWx0b3kuY29tPoiTBBMWCgA7FiEE
zDB+74wUbcPIGHmtNrmBuP54VaQFAmmeE7ACGwMFCwkIBwICIgIGFQoJCAsCBBYC
AwECHgcCF4AACgkQNrmBuP54VaR90AEA9QsxdP7qgQxytlJkZgb6bkT6+nVNQ7P2
vB8ZwJPyo1IA/jzGVr2zpyf/Qikk25lYRntNAX+iW9ctceAGdzAqrlwNtB1WYXVs
dG95IDxjb250YWN0QHZhdWx0b3kuY29tPoiTBBMWCgA7FiEEzDB+74wUbcPIGHmt
NrmBuP54VaQFAmmeFBkCGwMFCwkIBwICIgIGFQoJCAsCBBYCAwECHgcCF4AACgkQ
NrmBuP54VaSAxQD9FXG3wjP01Y/jAnOVz0JnCMqNhwrodneGIvnF6lzQMFcA/RcK
17X/87p4xa40zDGr1Xgh4qQjjt5lAMb8wpNiiiYEuDgEaZ4TsBIKKwYBBAGXVQEF
AQEHQEm4In71MK1oaf2wKZs7CZN7qDoQT1kny3fX6QU9ML4dAwEIB4h4BBgWCgAg
FiEEzDB+74wUbcPIGHmtNrmBuP54VaQFAmmeE7ACGwwACgkQNrmBuP54VaTwmwD/
V+vR+Us0W3S6yM8rxoKfLVoDG3uKfiLGPzGQWo0buTUBAPRsWuSrUSrwwTAXlyN1
qnBfNSv5US5grkBAohsk7cEP
=hcP3
-----END PGP PUBLIC KEY BLOCK-----`;

const pgpFingerprint = "CC30 7EEF 8C14 6DC3 C818 79AD 36B9 81B8 FE78 55A4";

export const PGPKey = () => {
  const copyData = {
    pgpKey: {
      clipboard: useClipboard({
        value: pgpKey,
      }),
      message: "PGP Key copied to clipboard",
    },
    pgpFingerprint: {
      clipboard: useClipboard({
        value: pgpFingerprint,
      }),
      message: "PGP Fingerprint copied to clipboard",
    },
  };

  const copy = (key: keyof typeof copyData) => {
    const { clipboard, message } = copyData[key];
    clipboard.copy();

    toaster.create({
      title: message,
      type: "success",
    });
  };

  return (
    <List.Root
      marginLeft="1.5em"
      marginTop="1.5em"
      marginBottom="0.5em"
      gap="1em"
    >
      <List.Item>
        <HStack wrap="wrap">
          PGP public key
          <Button
            color="accent"
            disabled={copyData.pgpKey.clipboard.copied}
            onClick={() => {
              if (copyData.pgpKey.clipboard.copied) return;
              copy("pgpKey");
            }}
            size="xs"
          >
            {copyData.pgpKey.clipboard.copied ? (
              <LuClipboardCheck />
            ) : (
              <LuClipboard />
            )}
            <Text>Copy</Text>
          </Button>
        </HStack>
      </List.Item>
      <List.Item>
        <HStack wrap="wrap">
          <span>
            With fingerprint:{" "}
            <code style={{ marginRight: "0.8em" }}>{pgpFingerprint}</code>
            <Button
              color="accent"
              disabled={copyData.pgpFingerprint.clipboard.copied}
              onClick={() => {
                if (copyData.pgpFingerprint.clipboard.copied) return;
                copy("pgpFingerprint");
              }}
              size="xs"
            >
              <Text>Copy</Text>
              {copyData.pgpFingerprint.clipboard.copied ? (
                <LuClipboardCheck />
              ) : (
                <LuClipboard />
              )}
            </Button>
          </span>
        </HStack>
      </List.Item>
    </List.Root>
  );
};
