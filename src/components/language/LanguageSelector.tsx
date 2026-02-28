import { LanguageContext } from "@/contexts/LanguageContext";
import { createListCollection, Portal, Select } from "@chakra-ui/react";
import { useContext } from "react";

const languageCollection = createListCollection({
  items: [
    { label: "English", value: "en" },
    { label: "Français", value: "fr" },
  ],
});

export const LanguageSelector = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <Select.Root
      collection={languageCollection}
      value={[language]}
      onValueChange={(e) => setLanguage(e.value[0] as "en" | "fr")}
      width="auto"
      minWidth="8em"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select language" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {languageCollection.items.map((language) => (
              <Select.Item item={language} key={language.value}>
                {language.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};
