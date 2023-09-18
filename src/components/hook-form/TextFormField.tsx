"use client";

import { TextInput, TextInputProps } from "@mantine/core";
import { Control, FieldValues, Path, useController } from "react-hook-form";

type TextFormFieldProps<TFieldValues extends FieldValues> = Omit<
  TextInputProps,
  "name"
> & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
};

export default function TextFormField<TFieldValues extends FieldValues>({
  name,
  control,
  ...rest
}: TextFormFieldProps<TFieldValues>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name });

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
