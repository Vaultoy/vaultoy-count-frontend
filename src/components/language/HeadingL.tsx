import { LanguageContext, type TextLanguage } from "@/contexts/LanguageContext";
import { useContext } from "react";
import { getText } from "./getText";
import { Heading, type HeadingProps } from "@chakra-ui/react";

type HeadingLProps = Omit<HeadingProps, "children"> & {
  children: TextLanguage;
};

/** Text component with multiple languages support */
export const HeadingL = ({ children, ...props }: HeadingLProps) => {
  const { language } = useContext(LanguageContext);
  const text = getText(children, language);

  return <Heading {...props}>{text}</Heading>;
};
