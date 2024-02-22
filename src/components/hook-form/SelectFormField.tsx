"use client";

import { ComboboxData, Loader, Select, SelectProps } from "@mantine/core";
import {
  Control,
  ControllerProps,
  FieldError,
  FieldValues,
  Path,
  useController,
} from "react-hook-form";

type SelectFormFieldProps<TFieldValues extends FieldValues> = Omit<
  SelectProps,
  "name" | "data"
> & {
  name: Path<TFieldValues>;
  parseError?: (error: FieldError) => string;
  control: Control<TFieldValues>;
  data: ComboboxData | undefined;
  loading?: boolean;
  rules?: ControllerProps<TFieldValues>["rules"];
};

export default function SelectFormField<TFieldValues extends FieldValues>({
  parseError,
  name,
  control,
  loading,
  data,
  rules,
  onChange,
  ...rest
}: SelectFormFieldProps<TFieldValues>) {
  const {
    field: { ref, value, onChange: fieldOnChange, onBlur },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <Select
      value={value || null}
      onChange={(e, option) => {
        fieldOnChange(e);
        onChange?.(e, option);
      }}
      onBlur={onBlur}
      ref={ref}
      data={data || []}
      error={
        error
          ? typeof parseError === "function"
            ? parseError(error)
            : error.message
          : undefined
      }
      rightSection={loading ? <Loader size={16} /> : null}
      searchable
      // limit={20}
      {...rest}
    />
  );
}
