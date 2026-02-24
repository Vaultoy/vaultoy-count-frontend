import { Badge, Card, Heading } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface FeatureCardProps {
  icon: IconType;
  title: string;
  titleColorPalette: string;
  description: ReactNode;
}

export const FeatureCard = ({
  icon,
  title,
  titleColorPalette,
  description,
}: FeatureCardProps) => {
  const Icon = icon;

  return (
    <Card.Root>
      <Card.Body textAlign="center" alignItems="center">
        <Icon size="1.6em" />
        <Badge
          colorPalette={titleColorPalette}
          fontSize="0.85em"
          marginTop="0.8em"
          marginBottom="0.6em"
        >
          <Heading size="sm">{title}</Heading>
        </Badge>

        {description}
      </Card.Body>
    </Card.Root>
  );
};
