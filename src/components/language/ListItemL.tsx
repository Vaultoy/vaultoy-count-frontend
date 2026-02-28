import { LanguageContext, type TextLanguage } from "@/contexts/LanguageContext";
import { List, type ListItemProps } from "@chakra-ui/react";
import { useContext } from "react";
import { getText } from "./getText";

type ListItemLProps = Omit<ListItemProps, "children"> & {
  children: TextLanguage;
};

export const ListItemL = ({ children, ...props }: ListItemLProps) => {
  const { language } = useContext(LanguageContext);
  const text = getText(children, language);

  return <List.Item {...props}>{text}</List.Item>;
};
