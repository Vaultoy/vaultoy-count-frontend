import { HeadingL } from "@/components/language/HeadingL";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { TextL } from "@/components/language/TextL";
import { Card, Center, VStack, Grid } from "@chakra-ui/react";

export const LegalPage = () => (
  <Center>
    <Card.Root
      marginTop="2em"
      marginBottom="4em"
      width={{ base: "94%", md: "70%", lg: "60%" }}
    >
      <Card.Header>
        <HeadingL marginTop="1em" textAlign="center" size="2xl">
          {{
            en: "Legal documents",
            fr: "Documents légaux",
          }}
        </HeadingL>
      </Card.Header>
      <Card.Body>
        <VStack margin={{ base: "0", md: "2em" }} alignItems="start">
          <Grid
            alignSelf="center"
            gap="1em"
            justifyContent="center"
            marginTop={{ base: "1em", md: "0" }}
            templateColumns={{ base: "1fr", md: "3fr 1fr" }}
          >
            <VStack gap="0" alignItems="flex-start">
              <TextL>
                {{
                  en: "Please select your preferred language",
                  fr: "Veuillez sélectionner votre langue préférée",
                }}
              </TextL>
              <TextL color="gray.500" fontStyle="italic">
                {{
                  en: "Veuillez sélectionner votre langue préférée",
                  fr: "Please select your preferred language",
                }}
              </TextL>
            </VStack>
            <LanguageSelector />
          </Grid>

          <HeadingL as="h2" textAlign="left" marginTop="2em">
            {{
              fr: "Mentions légales",
              en: "Legal notice",
            }}
          </HeadingL>
          <TextL textAlign="justify">
            {{
              fr: "Bientôt disponible",
              en: "Coming soon",
            }}
          </TextL>

          <HeadingL as="h2" textAlign="left" marginTop="2em">
            {{
              fr: "Politique de confidentialité",
              en: "Privacy policy",
            }}
          </HeadingL>
          <TextL textAlign="justify">
            {{
              fr: "Bientôt disponible",
              en: "Coming soon",
            }}
          </TextL>

          <HeadingL as="h2" textAlign="left" marginTop="2em">
            {{
              fr: "Conditions générales d'utilisation",
              en: "Terms of service",
            }}
          </HeadingL>
          <TextL textAlign="justify">
            {{
              fr: "Bientôt disponible",
              en: "Coming soon",
            }}
          </TextL>
        </VStack>
      </Card.Body>
    </Card.Root>
  </Center>
);
