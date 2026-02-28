import { HeadingL } from "@/components/language/HeadingL";
import { ListItemL } from "@/components/language/ListItemL";
import { TextL } from "@/components/language/TextL";
import { HStack, List, Text, Image } from "@chakra-ui/react";

export const LegalNotice = () => (
  <>
    <HeadingL as="h2" textAlign="left" marginTop="2em" marginBottom="1em">
      {{
        fr: "Mentions légales",
        en: "Legal notice",
      }}
    </HeadingL>
    <TextL textAlign="justify">
      {{
        fr: `Conformément aux dispositions de l'article 6 de la Loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN), il est précisé aux utilisateurs du site vaultoy.com et de l'ensemble de ses sous-domaines (ci-après désignés collectivement comme "le Site") l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.`,
        en: `In accordance with the provisions of Article 6 of the French Law No. 2004-575 of June 21, 2004 for Confidence in the Digital Economy (LCEN), the identity of the different parties involved in the creation and monitoring of the vaultoy.com website and all its subdomains (hereinafter collectively referred to as "the Site") is specified to users.`,
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Éditeur du Site",
        en: "Site publisher",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Le Site est édité par :",
        en: "The Site is published by:",
      }}
    </TextL>

    <List.Root marginLeft="1.5em" marginBottom="0.5em">
      <ListItemL>
        {{
          fr: "Propriétaire et éditeur : Thomas Sauvage",
          en: "Owner and publisher: Thomas Sauvage",
        }}
      </ListItemL>
      <List.Item>
        <HStack alignItems="center" gap="0">
          <TextL>
            {{
              fr: "Contact par courriel :",
              en: "Contact by email:",
            }}
          </TextL>
          <Text marginLeft="0.4em">contact</Text>
          <Image
            src="/at.png"
            height="1.1em"
            marginBottom="-0.1em"
            marginLeft="0.1em"
            marginRight="0.1em"
          />
          <Text>vaultoy.com</Text>
        </HStack>
      </List.Item>
      <ListItemL>
        {{
          fr: "Directeur de la publication : Thomas Sauvage",
          en: "Publication director: Thomas Sauvage",
        }}
      </ListItemL>
    </List.Root>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Hébergeur du Site",
        en: "Site host",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Le Site est hébergé par :",
        en: "The Site is hosted by:",
      }}
    </TextL>

    <List.Root marginLeft="1.5em" marginBottom="0.5em">
      <ListItemL>
        {{
          fr: "Hébergeur : OVH SAS",
          en: "Host: OVH SAS",
        }}
      </ListItemL>
      <ListItemL>
        {{
          fr: "Siège social : 2 rue Kellermann - 59100 Roubaix - France",
          en: "Headquarters: 2 rue Kellermann - 59100 Roubaix - France",
        }}
      </ListItemL>
      <ListItemL>
        {{
          fr: "Numéro SIRET : 424 761 419 00045",
          en: "SIRET number: 424 761 419 00045",
        }}
      </ListItemL>
      <ListItemL>
        {{
          fr: "Téléphone : +33 1007",
          en: "Phone: +33 1007",
        }}
      </ListItemL>
      <ListItemL>
        {{
          fr: "Site web : https://ovh.com",
          en: "Website: https://ovh.com",
        }}
      </ListItemL>
    </List.Root>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Propriété intellectuelle",
        en: "Intellectual property",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "L'ensemble des éléments constituant le Site (structure, textes, graphismes, logos, icônes, images, sons, ainsi que les codes sources et développements logiciels) est la propriété exclusive de Thomas Sauvage, sous réserve des droits appartenant à des tiers (notamment les bibliothèques logicielles sous licences open-source).",
        en: "All elements constituting the Site (structure, texts, graphics, logos, icons, images, sounds, as well as source codes and software developments) are the exclusive property of Thomas Sauvage, except for rights belonging to third parties (notably open-source licensed software libraries).",
      }}
    </TextL>

    <TextL textAlign="justify">
      {{
        fr: "Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'auteur.",
        en: "Any reproduction, representation, modification, publication, adaptation of all or part of the elements of the Site, regardless of the means or process used, is prohibited, except with the prior written permission of the author.",
      }}
    </TextL>
  </>
);
