"use client";

import { TextInput, TextInputProps } from "@mantine/core";
import {
  Control,
  ControllerProps,
  FieldValues,
  Path,
  useController,
} from "react-hook-form";

type TextFormFieldProps<TFieldValues extends FieldValues> = Omit<
  TextInputProps,
  "name"
> & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: ControllerProps<TFieldValues>["rules"];
};

export default function TextFormField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...rest
}: TextFormFieldProps<TFieldValues>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <TextInput
      value={value ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={rest.placeholder}
      label={rest.label}
      error={rest.error ? rest.error : error?.message}
      ref={ref}
      {...rest}
    />
  );
}
