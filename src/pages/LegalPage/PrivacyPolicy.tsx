import { HeadingL } from "@/components/language/HeadingL";
import { TextL } from "@/components/language/TextL";

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
        fr: "Bientôt disponible",
        en: "Coming soon",
      }}
    </TextL>
  </>
);
