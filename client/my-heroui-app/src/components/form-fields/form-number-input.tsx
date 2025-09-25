import { NumberInput, NumberInputProps } from "@heroui/number-input";
import { FieldPath, FieldValues } from "react-hook-form";

import {
  useFormContext,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../ui/form";
import { cn } from "@heroui/theme";

const LABEL_PLACEMENT = [
  "outside",
  "outside-left",
  "outside-top",
  "inside",
] as const;

export interface FormNumberInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<NumberInputProps, "value" | "onChange" | "onBlur" | "name"> {
  name: TName;
  label?: string;
  description?: string;
  onChange?: ((value: number) => void) | undefined
}

export function FormNumberInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  onChange,
  ...props
}: FormNumberInputProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField<TFieldValues, TName>
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label &&
            !LABEL_PLACEMENT.includes(
              props.labelPlacement as (typeof LABEL_PLACEMENT)[number],
            ) && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <NumberInput
              isInvalid={!!fieldState.error}
              value={field.value ?? undefined}
              onBlur={field.onBlur}
              onValueChange={(value) => {
                field.onChange(value)
                if(onChange) onChange(value)
              }}
              {...(LABEL_PLACEMENT.includes(
                props.labelPlacement as (typeof LABEL_PLACEMENT)[number],
              )
                ? { label: label }
                : {})}
              classNames={{
                inputWrapper: "shadow-none"
              }}
              {...props}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
