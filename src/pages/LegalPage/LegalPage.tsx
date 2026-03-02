import { HeadingL } from "@/components/language/HeadingL";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { TextL } from "@/components/language/TextL";
import { Card, Center, VStack, Grid, HStack, List } from "@chakra-ui/react";
import { LegalNotice } from "./LegalNotice";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { TermsService } from "./TermsService";
import { EmailAddress } from "@/components/EmailAddress";

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
            fr: "Informations légales",
            en: "Legal information",
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
              fr: "Dernière mise à jour : 2 Mars 2026",
              en: "Last updated: March 2nd, 2026",
            }}
          </TextL>

          <TextL textAlign="justify" marginTop="1em">
            {{
              fr: "Bienvenue sur la page des informations légales de Vaultoy ! Vous trouverez ici nos mentions légales, notre politique de confidentialité et nos conditions générales d'utilisation.",
              en: "Welcome to the legal information page of Vaultoy! Here you will find our legal notice, privacy policy, and terms of service.",
            }}
          </TextL>

          <TextL textAlign="justify">
            {{
              fr: `En utilisant le site vaultoy.com ou l'un de ses sous-domaines (ci-après désignés collectivement comme "le Site"), vous acceptez les mentions légales, la politique de confidentialité et les conditions générales d'utilisation décrites dans les sections suivantes. Si vous ne souhaitez pas accepter ces documents, veuillez ne pas utiliser nos services.`,
              en: `By using the vaultoy.com website or one of its subdomains (collectively referred to as "the Site"), you agree to the legal notice, privacy policy, and terms of service described in the following sections. If you do not wish to agree to these documents, please do not use our services.`,
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
              fr: "Nous nous réservons le droit de modifier ces documents à tout moment. En cas de modification, nous mettrons à jour la date de 'Dernière mise à jour' en haut de cette page et vous informerons des changements importants via un courriel ou une notification sur le Site. Nous vous encourageons à consulter régulièrement cette page pour prendre connaissance de toute modification.",
              en: "We reserve the right to modify these documents at any time. In case of changes, we will update the 'Last updated' date at the top of this page and inform you of significant changes through an email or a notification on the Site. We encourage you to regularly review this page to stay informed of any changes.",
            }}
          </TextL>

          <HeadingL as="h2" textAlign="left" marginTop="2em" marginBottom="1em">
            {{
              fr: "Nous contacter",
              en: "Contact us",
            }}
          </HeadingL>
          <TextL textAlign="justify">
            {{
              fr: "N'hésitez pas à nous contacter si vous avez des questions concernant ces documents légaux.",
              en: "Please feel free to contact us if you have any questions about these legal documents.",
            }}
          </TextL>
          <List.Root marginLeft="1.5em" marginTop="0.5em" marginBottom="0.5em">
            <List.Item>
              <HStack gap="0.3em" wrap="wrap">
                <TextL>
                  {{
                    fr: "Contact par courriel :",
                    en: "Contact by email:",
                  }}
                </TextL>
                <EmailAddress mailUser="contact" mailDomain="vaultoy.com" />
              </HStack>
            </List.Item>
          </List.Root>
        </VStack>
      </Card.Body>
    </Card.Root>
  </Center>
);
