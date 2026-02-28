import { HeadingL } from "@/components/language/HeadingL";
import { ListItemL } from "@/components/language/ListItemL";
import { TextL } from "@/components/language/TextL";
import { HStack, List, Text, Image } from "@chakra-ui/react";

export const PrivacyPolicy = () => (
  <>
    <HeadingL as="h2" textAlign="left" marginTop="2em" marginBottom="1em">
      {{
        fr: "Politique de confidentialité",
        en: "Privacy policy",
      }}
    </HeadingL>
    <TextL textAlign="justify">
      {{
        fr: "La protection de votre vie privée est au cœur de la mission de Vaultoy. Cette politique de confidentialité détaille la manière dont vos données sont traitées sur le Site.",
        en: "The protection of your privacy is at the heart of Vaultoy's mission. This privacy policy details how your data is processed on the Site.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Responsable du traitement des données",
        en: "Person in charge of data processing",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Le responsable du traitement des données collectées sur le Site est :",
        en: "The person in charge of data processing collected on the Site is:",
      }}
    </TextL>

    <List.Root marginLeft="1.5em" marginBottom="0.5em">
      <ListItemL>
        {{
          fr: "Thomas Sauvage",
          en: "Thomas Sauvage",
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
    </List.Root>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Nature des données collectées",
        en: "Nature of collected data",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "En raison de l'architecture de chiffrement de bout en bout utilisée par Vaultoy, nous distinguons deux types de données :",
        en: "Due to the end-to-end encryption architecture used by Vaultoy, we distinguish between two types of data:",
      }}
    </TextL>

    <List.Root marginLeft="1.5em" marginBottom="0.5em">
      <ListItemL>
        {{
          fr: "Données chiffrées : Les données chiffrées à l'aide d'une clé dérivée de votre mot de passe. Seulement la version chiffrée de ces données est envoyée et stockée sur nos serveurs. Nous n'avons aucun moyen de les déchiffrer ou d'y accéder. Cette catégorie inclut le nom des groupes, le nom des transactions, leurs montants, leurs émetteurs et destinataires, les balances de chaque membre, le surnom de ces membres, etc.",
          en: "Encrypted data: The data encrypted using a key derived from your password. Only the encrypted version of this data is sent and stored on our servers. We have no way to decrypt or access it. This category includes the name of groups, the name of transactions, their amounts, their senders and recipients, the balances of each member, the nickname of these members, etc.",
        }}
      </ListItemL>
      <ListItemL>
        {{
          fr: "Données non chiffrées : Les données nécessaires au fonctionnement du Site qui sont envoyées et stockées sur nos serveurs avec un chiffrement en transit mais sans chiffrement de bout en bout. Cette catégorie inclut votre nom d'utilisateur, les noms d'utilisateurs des membres d'un groupe, etc.",
          en: "Unencrypted data: The data necessary for the operation of the Site which is sent and stored on our servers with transit encryption but without end-to-end encryption. This category includes your username, the usernames of members of a group, etc.",
        }}
      </ListItemL>
    </List.Root>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Finalités du traitement des données",
        en: "Purposes of data processing",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Les données collectées sont utilisées pour les finalités suivantes :",
        en: "The collected data is used for the following purposes:",
      }}
    </TextL>

    <List.Root marginLeft="1.5em" marginBottom="0.5em">
      <ListItemL>
        {{
          fr: "Fournir et maintenir le Site : Les données sont utilisées pour assurer le bon fonctionnement du Site, notamment pour permettre la création et l'authentification des comptes, la création de groupes, et l'authentification des membres d'un groupe, etc.",
          en: "Provide and maintain the Site: The data is used to ensure the proper functioning of the Site, including to allow account creation and authentication, group creation, and authentication of group members, etc.",
        }}
      </ListItemL>
      <ListItemL>
        {{
          fr: "Communiquer avec vous : Les données sont utilisées pour répondre à vos demandes de support, vous envoyer des notifications importantes concernant le Site, etc.",
          en: "Communicate with you: The data is used to respond to your support requests, send you important notifications regarding the Site, etc.",
        }}
      </ListItemL>
    </List.Root>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Partage et transfert des données",
        en: "Data sharing and transfer",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Nous ne partageons et ne transférons pas vos données personnelles avec des tiers, à l'exception de l'hébergeur du Site mentionné dans les Mentions Légales. Le Site est hébergé en France.",
        en: "We do not share and transfer your personal data with third parties, except for the Site's hosting provider mentioned in the Legal Notice. The Site is hosted in France.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Durée de conservation des données",
        en: "Data retention period",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Les données liées à votre compte sont conservées aussi longtemps que votre compte est actif. En cas de suppression de votre compte, les données associées seront supprimées dans un délai de 30 jours.",
        en: "Data related to your account is retained as long as your account is active. In case of deletion of your account, the associated data will be deleted within 30 days.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Sécurité des données",
        en: "Data security",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, toute divulgation, altération ou destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée, et nous ne pouvons garantir une sécurité absolue.",
        en: "We implement appropriate technical and organizational security measures to protect your data against unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or method of electronic storage is completely secure, and we cannot guarantee absolute security.",
      }}
    </TextL>

    <TextL textAlign="justify">
      {{
        fr: "Vos données chiffrées bénéficient d'une sécurité renforcée grâce à l'architecture de chiffrement de bout en bout utilisée par Vaultoy. Cependant, il est important de noter que la sécurité de vos données chiffrées dépend également de la force de votre mot de passe et de la confidentialité de celui-ci. La méthode de chiffrement développée par Vaultoy est décrite plus en détail dans notre Whitepaper, disponible sur le Site.",
        en: "Your encrypted data benefits from enhanced security thanks to the end-to-end encryption architecture used by Vaultoy. However, it is important to note that the security of your encrypted data also depends on the strength of your password and its confidentiality. The encryption method developed by Vaultoy is described in more detail in our Whitepaper, available on the Site.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Droits des utilisateurs",
        en: "User rights",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Vous disposez notamment des droits suivants concernant vos données personnelles : ",
        en: "You have, in particular, the following rights regarding your personal data: ",
      }}
    </TextL>

    <List.Root marginLeft="1.5em" marginBottom="0.5em">
      <ListItemL>
        {{
          fr: "Droit d'accès : vous pouvez nous demander l'accès à vos données personnelles que nous détenons.",
          en: "Right of access: you can request access to your personal data that we hold.",
        }}
      </ListItemL>

      <ListItemL>
        {{
          fr: "Droit de rectification : vous pouvez nous demander de corriger ou de compléter vos données personnelles si elles sont inexactes ou incomplètes.",
          en: "Right of rectification: you can request us to correct or complete your personal data if it is inaccurate or incomplete.",
        }}
      </ListItemL>

      <ListItemL>
        {{
          fr: "Droit à l'effacement : vous pouvez nous demander de supprimer vos données personnelles, sous réserve de certaines exceptions prévues par la loi.",
          en: "Right to erasure: you can request us to delete your personal data, subject to certain exceptions provided by law.",
        }}
      </ListItemL>

      <ListItemL>
        {{
          fr: "Droit à la limitation du traitement : vous pouvez nous demander de limiter le traitement de vos données personnelles dans certaines circonstances.",
          en: "Right to restriction of processing: you can request us to restrict the processing of your personal data in certain circumstances.",
        }}
      </ListItemL>

      <ListItemL>
        {{
          fr: "Droit d'opposition : vous pouvez vous opposer au traitement de vos données personnelles pour des raisons tenant à votre situation particulière.",
          en: "Right to object: you can object to the processing of your personal data for reasons related to your particular situation.",
        }}
      </ListItemL>

      <ListItemL>
        {{
          fr: "Droit à la portabilité des données : vous pouvez nous demander de transférer vos données personnelles, dans un format structuré, couramment utilisé et lisible par machine.",
          en: "Right to data portability: you can request us to transfer your personal data, in a structured, commonly used and machine-readable format.",
        }}
      </ListItemL>
    </List.Root>

    <TextL textAlign="justify">
      {{
        fr: "Veuillez notez qu'en raison de la nature du chiffrement de bout en bout, nous ne sommes pas en mesure d'accéder ou rectifier les données chiffrées.",
        en: "Please note that due to the nature of end-to-end encryption, we are not able to access or rectify encrypted data.",
      }}
    </TextL>

    <TextL textAlign="justify">
      {{
        fr: "Pour exercer ces droits, veuillez nous contacter à l'adresse courriel indiquée dans la section 'Responsable du traitement des données' ci-dessus. Nous répondrons à votre demande dans les meilleurs délais.",
        en: "To exercise these rights, please contact us at the email address provided in the 'Person in charge of data processing' section above. We will respond to your request as soon as possible.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Utilisation de cookies",
        en: "Use of cookies",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Le Site utilise uniquement un cookie de session strictement nécessaire pour maintenir votre session de connexion. Nous ne collectons aucune donnée personnelle via ce cookie, et il n'est utilisé que pour assurer le bon fonctionnement du Site.",
        en: "The Site only uses one strictly necessary session cookie to maintain your login session. We do not collect any personal data through this cookie, and it is only used to ensure the proper functioning of the Site.",
      }}
    </TextL>
  </>
);
