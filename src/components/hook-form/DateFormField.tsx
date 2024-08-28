import { DateInput, DateInputProps } from "@mantine/dates";
import {
  Control,
  ControllerProps,
  FieldValues,
  Path,
  useController,
} from "react-hook-form";

type DateFormFieldProps<TFieldValues extends FieldValues> = Omit<
  DateInputProps,
  "name"
> & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: ControllerProps<TFieldValues>["rules"];
};

export default function DateFormField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...rest
}: DateFormFieldProps<TFieldValues>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <DateInput
      value={value}
      onChange={onChange}
      ref={ref}
      onBlur={onBlur}
      error={rest.error ? rest.error : error?.message}
      {...rest}
    />
  );
}
