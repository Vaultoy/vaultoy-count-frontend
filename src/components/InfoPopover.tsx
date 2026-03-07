import { Popover, Text } from "@chakra-ui/react";
import { HiOutlineInformationCircle } from "react-icons/hi";

export const InfoPopover = ({ children }: { children: React.ReactNode }) => (
  <Popover.Root>
    <Popover.Trigger style={{ cursor: "pointer" }}>
      <Text textAlign="left">
        <HiOutlineInformationCircle
          style={{
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      </Text>
    </Popover.Trigger>
    <Popover.Positioner>
      <Popover.Content>
        <Popover.CloseTrigger />
        <Popover.Arrow />
        <Popover.Body>{children}</Popover.Body>
      </Popover.Content>
    </Popover.Positioner>
  </Popover.Root>
);
