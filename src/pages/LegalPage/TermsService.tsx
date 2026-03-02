import { HeadingL } from "@/components/language/HeadingL";
import { TextL } from "@/components/language/TextL";
import { Text } from "@chakra-ui/react";

export const TermsService = () => (
  <>
    <HeadingL as="h2" textAlign="left" marginTop="2em" marginBottom="1em">
      {{
        fr: "Conditions générales d'utilisation",
        en: "Terms of service",
      }}
    </HeadingL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Utilisation du service",
        en: "Use of the service",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Vaultoy Count est un service de partage de dépenses de groupe chiffré de bout en bout. Vous êtes responsable de l'utilisation que vous faites du service et des données que vous y saisissez.",
        en: "Vaultoy Count is an end-to-end encrypted group expense splitting service. You are responsible for your use of the service and the data you enter.",
      }}
    </TextL>
    <TextL textAlign="justify">
      {{
        fr: "Vous vous engagez à ne pas utiliser le service à des fins illégales ou interdites par les présentes conditions. Vous ne devez pas tenter de compromettre la sécurité ou l'intégrité de nos systèmes informatiques ou de ceux de nos utilisateurs. Vous ne devez pas tenter de perturber la qualité du service pour les autres utilisateurs.",
        en: "You agree not to use the service for any illegal or prohibited purpose. You must not attempt to compromise the security or integrity of our computer systems or those of our users. You must not attempt to disrupt the quality of the service for other users.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Comptes utilisateurs",
        en: "User accounts",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Pour utiliser certaines fonctionnalités, vous devez créer un compte utilisateur en fournissant une adresse courriel valide. Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités effectuées sous votre compte.",
        en: "To use certain features, you must create a user account by providing a valid email address. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.",
      }}
    </TextL>
    <TextL textAlign="justify">
      {{
        fr: "Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de non-respect manifeste de ces conditions, d'utilisation illégale confirmée, ou si les autorités compétentes nous y contraignent.",
        en: "We reserve the right to suspend or terminate your account in case of manifest violation of these terms, confirmed illegal use, or if compelled by competent authorities.",
      }}
    </TextL>

    <Text textAlign="justify">
      <TextL fontWeight="bold" as="span">
        {{
          fr: "⚠️ Important : ",
          en: "⚠️ Important: ",
        }}
      </TextL>
      <TextL as="span">
        {{
          fr: "En raison du chiffrement de bout en bout, si vous perdez votre mot de passe, nous ne pourrons jamais le réinitialiser. Vous perdrez définitivement l'accès à votre compte et à toutes vos données. Vous êtes seul responsable de la conservation de votre mot de passe.",
          en: "Due to end-to-end encryption, if you lose your password, we will never be able to reset it. You will permanently lose access to your account and all your data. You are solely responsible for keeping your password.",
        }}
      </TextL>
    </Text>

    <TextL textAlign="justify">
      {{
        fr: "La sécurité de votre compte et du chiffrement de vos données dépend de la force de votre mot de passe. Nous vous recommandons d'utiliser un mot de passe fort et unique pour protéger votre compte. Nous ne sommes pas responsables si la sécurité de votre compte ou du chiffrement est compromise en raison d'un mot de passe faible ou divulgué.",
        en: "The security of your account and the encryption of your data depends on the strength of your password. We recommend using a strong and unique password to protect your account. We are not responsible if the security of your account or encryption is compromised due to a weak or disclosed password.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Limitation de responsabilité",
        en: "Limitation of liability",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "L'éditeur est tenu à une obligation de moyens pour assurer la disponibilité et la sécurité du service. Toutefois, dans la limite permise par la loi, l'éditeur ne saurait être tenu responsable des dommages indirects (telles que la perte de données, de profits ou d'opportunités) résultant de l'utilisation ou de l'impossibilité d'utiliser le service.",
        en: "The publisher is under an obligation of means (best effort) to ensure the availability and security of the service. However, to the extent permitted by law, the publisher shall not be liable for any indirect damages (such as loss of data, profits, or opportunities) resulting from the use or inability to use the service.",
      }}
    </TextL>

    <TextL textAlign="justify">
      {{
        fr: "Le Site est fourni 'tel quel' et 'tel que disponible'. Nous ne pouvons garantir que le service sera ininterrompu, exempt de vulnérabilités de sécurité ou d'erreurs.",
        en: "The Site is provided on an 'as is' and 'as available' basis. We cannot guarantee that the service will be uninterrupted, free of security vulnerabilities or errors.",
      }}
    </TextL>

    <HeadingL as="h3" textAlign="left" size="lg">
      {{
        fr: "Lois applicables",
        en: "Governing law",
      }}
    </HeadingL>

    <TextL textAlign="justify">
      {{
        fr: "Ces conditions sont régies et interprétées conformément aux lois françaises, sans égard à ses dispositions relatives aux conflits de lois.",
        en: "These Terms shall be governed and construed in accordance with the laws of France, without regard to its conflict of law provisions.",
      }}
    </TextL>
  </>
);
