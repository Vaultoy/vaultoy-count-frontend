import { Popover } from "@chakra-ui/react";
import { HiOutlineInformationCircle } from "react-icons/hi";

export const InfoPopover = ({ children }: { children: React.ReactNode }) => (
  <Popover.Root>
    <Popover.Trigger style={{ cursor: "pointer" }}>
      <HiOutlineInformationCircle
        style={{
          display: "inline",
          verticalAlign: "middle",
        }}
      />
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
