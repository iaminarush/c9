import { NumberInput, NumberInputProps } from "@mantine/core";
import {
  Control,
  ControllerProps,
  FieldValues,
  Path,
  useController,
} from "react-hook-form";

type NumberFormFieldProps<TFieldValues extends FieldValues> = Omit<
  NumberInputProps,
  "name"
> & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: ControllerProps<TFieldValues>["rules"];
};

export default function NumberFormField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...rest
}: NumberFormFieldProps<TFieldValues>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <NumberInput
      value={value}
      onChange={onChange}
      ref={ref}
      onBlur={onBlur}
      error={rest.error ? rest.error : error?.message}
      {...rest}
    />
  );
}
