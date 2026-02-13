"use client";

import type {
  ButtonProps,
  GroupProps,
  InputProps,
  StackProps,
} from "@chakra-ui/react";
import {
  Box,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Stack,
  mergeRefs,
  useControllableState,
} from "@chakra-ui/react";
import * as React from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

export interface PasswordVisibilityProps {
  /**
   * The default visibility state of the password input.
   */
  defaultVisible?: boolean;
  /**
   * The controlled visibility state of the password input.
   */
  visible?: boolean;
  /**
   * Callback invoked when the visibility state changes.
   */
  onVisibleChange?: (visible: boolean) => void;
  /**
   * Custom icons for the visibility toggle button.
   */
  visibilityIcon?: { on: React.ReactNode; off: React.ReactNode };
}

export interface PasswordInputProps
  extends InputProps, PasswordVisibilityProps {
  rootProps?: GroupProps;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput(props, ref) {
  const {
    rootProps,
    defaultVisible,
    visible: visibleProp,
    onVisibleChange,
    visibilityIcon = { on: <LuEye />, off: <LuEyeOff /> },
    ...rest
  } = props;

  const [visible, setVisible] = useControllableState({
    value: visibleProp,
    defaultValue: defaultVisible || false,
    onChange: onVisibleChange,
  });

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <InputGroup
      endElement={
        <VisibilityTrigger
          disabled={rest.disabled}
          onPointerDown={(e) => {
            if (rest.disabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            setVisible(!visible);
          }}
        >
          {visible ? visibilityIcon.off : visibilityIcon.on}
        </VisibilityTrigger>
      }
      {...rootProps}
    >
      <Input
        {...rest}
        ref={mergeRefs(ref, inputRef)}
        type={visible ? "text" : "password"}
      />
    </InputGroup>
  );
});

const VisibilityTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function VisibilityTrigger(props, ref) {
    return (
      <IconButton
        tabIndex={-1}
        ref={ref}
        me="-2"
        aspectRatio="square"
        size="sm"
        variant="ghost"
        height="calc(100% - {spacing.2})"
        aria-label="Toggle password visibility"
        {...props}
      />
    );
  },
);

interface PasswordStrengthMeterProps extends StackProps {
  value: number;
}

const PERFECT_PASSWORD_LENGTH = 21;

export const PasswordStrengthMeter = React.forwardRef<
  HTMLDivElement,
  PasswordStrengthMeterProps
>(function PasswordStrengthMeter(props, ref) {
  const { value, ...rest } = props;
  const { label, colorPalette, numberOfFilledBlocks } = getColorPalette(value);

  return (
    <Stack align="flex-end" gap="1" ref={ref} {...rest}>
      <HStack width="full" {...rest}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Box
            key={index}
            height="1"
            flex="1"
            rounded="sm"
            data-selected={index < numberOfFilledBlocks ? "" : undefined}
            layerStyle="fill.subtle"
            colorPalette="gray"
            _selected={{
              colorPalette,
              layerStyle: "fill.solid",
            }}
          />
        ))}
      </HStack>
      {label && <HStack textStyle="xs">{label}</HStack>}
    </Stack>
  );
});

function getColorPalette(value: number) {
  switch (true) {
    case value === 0:
      return {
        label: "Too short",
        colorPalette: "gray",
        numberOfFilledBlocks: 0,
      };
    case value < 8:
      return {
        label: "Too short",
        colorPalette: "red",
        numberOfFilledBlocks: 1,
      };
    case value < 14:
      return {
        label: "Short",
        colorPalette: "orange",
        numberOfFilledBlocks: 2,
      };
    case value < PERFECT_PASSWORD_LENGTH:
      return { label: "Long", colorPalette: "green", numberOfFilledBlocks: 3 };
    default:
      return {
        label: "Very long",
        colorPalette: "green",
        numberOfFilledBlocks: 4,
      };
  }
}
