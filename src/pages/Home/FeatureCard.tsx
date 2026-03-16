import { Badge, Card, Heading, Icon } from "@chakra-ui/react";
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
  return (
    <Card.Root>
      <Card.Body textAlign="center" alignItems="center">
        <Icon as={icon} boxSize="1.6em" color={`${titleColorPalette}.700`} />
        <Badge
          colorPalette={titleColorPalette}
          marginTop="0.8em"
          marginBottom="0.6em"
        >
          <Heading size="sm" fontWeight="bold">
            {title}
          </Heading>
        </Badge>
        {description}
      </Card.Body>
    </Card.Root>
  );
};
