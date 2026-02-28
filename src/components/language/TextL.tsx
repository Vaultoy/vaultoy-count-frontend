import { LanguageContext, type TextLanguage } from "@/contexts/LanguageContext";
import { useContext } from "react";
import { getText } from "./getText";
import { Text, type TextProps } from "@chakra-ui/react";

type TextLProps = Omit<TextProps, "children"> & {
  children: TextLanguage;
};

/** Text component with multiple languages support */
export const TextL = ({ children, ...props }: TextLProps) => {
  const { language } = useContext(LanguageContext);
  const text = getText(children, language);

  return <Text {...props}>{text}</Text>;
};
