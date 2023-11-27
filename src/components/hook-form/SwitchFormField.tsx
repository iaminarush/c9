"use client";

import { Switch, SwitchProps } from "@mantine/core";
import {
  Control,
  ControllerProps,
  FieldError,
  FieldValues,
  Path,
  useController,
} from "react-hook-form";

type SwitchFormFieldProps<TFieldValues extends FieldValues> = Omit<
  SwitchProps,
  "name" | "data"
> & {
  name: Path<TFieldValues>;
  parseError?: (error: FieldError) => string;
  control: Control<TFieldValues>;
  rules?: ControllerProps<TFieldValues>["rules"];
};

export default function SwitchFormField<TFieldValues extends FieldValues>({
  control,
  name,
  parseError,
  rules,
  ...rest
}: SwitchFormFieldProps<TFieldValues>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <Switch
      checked={value}
      onChange={onChange}
      onBlur={onBlur}
      ref={ref}
      error={
        error
          ? typeof parseError === "function"
            ? parseError(error)
            : error.message
          : undefined
      }
      {...rest}
    />
  );
}
