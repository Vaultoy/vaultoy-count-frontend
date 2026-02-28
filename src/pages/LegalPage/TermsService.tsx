import { HeadingL } from "@/components/language/HeadingL";
import { TextL } from "@/components/language/TextL";

export const TermsService = () => (
  <>
    <HeadingL as="h2" textAlign="left" marginTop="2em" marginBottom="1em">
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
  </>
);
