import { HeadingL } from "@/components/language/HeadingL";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { TextL } from "@/components/language/TextL";
import { Card, Center, VStack, Grid } from "@chakra-ui/react";
import { LegalNotice } from "./LegalNotice";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { TermsService } from "./TermsService";

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
            fr: "Documents légaux",
            en: "Legal documents",
          }}
        </HeadingL>
      </Card.Header>
      <Card.Body>
        <VStack margin={{ base: "0", md: "2em" }} alignItems="start">
          <Grid
            alignSelf="center"
            gap="1em"
            justifyContent="center"
            alignItems="center"
            marginTop={{ base: "1em", md: "0" }}
            templateColumns={{ base: "1fr", md: "3fr 1fr" }}
          >
            <VStack gap="0" alignItems="flex-start">
              <TextL>
                {{
                  fr: "Veuillez sélectionner votre langue préférée",
                  en: "Please select your preferred language",
                }}
              </TextL>
              <TextL color="gray.500" fontStyle="italic">
                {{
                  fr: "Please select your preferred language",
                  en: "Veuillez sélectionner votre langue préférée",
                }}
              </TextL>
            </VStack>
            <LanguageSelector />
          </Grid>

          <TextL color="gray.500" fontStyle="italic" marginTop="2em">
            {{
              fr: "Dernière mise à jour : 28 février 2026",
              en: "Last updated: February 28th, 2026",
            }}
          </TextL>

          <TextL textAlign="justify" marginTop="1em">
            {{
              fr: "Bienvenue sur la page des documents légaux de Vaultoy ! Vous trouverez ici nos mentions légales, notre politique de confidentialité et nos conditions générales d'utilisation. Pour pouvoir créer un compte et continuer à l'utiliser, vous devez accepter les termes décrits dans ces documents.",
              en: "Welcome to the legal documents page of Vaultoy! Here you will find our legal notice, privacy policy, and terms of service. To be able to create an account and continue using it, you must accept the terms described in these documents.",
            }}
          </TextL>

          <LegalNotice />

          <PrivacyPolicy />

          <TermsService />

          <HeadingL as="h2" textAlign="left" marginTop="2em" marginBottom="1em">
            {{
              fr: "Modifications des mentions légales, de la politique de confidentialité et des conditions générales d'utilisation",
              en: "Changes to the legal notice, privacy policy and terms of service",
            }}
          </HeadingL>

          <TextL textAlign="justify">
            {{
              fr: "Nous nous réservons le droit de modifier ces documents à tout moment. En cas de modification, nous mettrons à jour la date de 'Dernière mise à jour' en haut de cette page et vous informerons des changements importants via une notification sur le Site. Nous vous encourageons à consulter régulièrement cette page pour prendre connaissance de toute modification.",
              en: "We reserve the right to modify these documents at any time. In case of changes, we will update the 'Last updated' date at the top of this page and inform you of significant changes through a notification on the Site. We encourage you to regularly review this page to stay informed of any changes.",
            }}
          </TextL>
        </VStack>
      </Card.Body>
    </Card.Root>
  </Center>
);
