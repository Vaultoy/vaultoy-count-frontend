import { Popover, Text } from "@chakra-ui/react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import {
  PasswordStrengthMeter,
  type PasswordStrengthMeterProps,
} from "./ui/password-input";

export const PasswordHints = (props: PasswordStrengthMeterProps) => (
  <>
    <PasswordStrengthMeter marginTop="1em" {...props} />
    <Popover.Root>
      <Popover.Trigger style={{ cursor: "pointer" }}>
        <Text textAlign="left">
          How to choose a great password?{" "}
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
          <Popover.Body>
            We recommend that you use a long and complex password that you don't
            use anywhere else.
            <br />
            <br />A great password would be choosen randomly, 21 characters long
            from a-z, A-Z, 0-9 and !@#$%^&*.
            <br />
            <br />
            As it is hard to remember such unique passwords, we recommend that
            you use a password manager to generate and store it for you.
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>

    <Text marginTop="1em" color="gray">
      This password will be used as a key to encrypt your data. If you lose it,
      you will lose access to your data.
    </Text>
  </>
);
