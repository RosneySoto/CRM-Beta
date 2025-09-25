import { Input, InputProps } from "@heroui/input";
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

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<
    InputProps,
    "defaultValue" | "value" | "onChange" | "onBlur" | "name"
  > {
  name: TName;
  label?: string;
  description?: string;
}

const LABEL_PLACEMENT = [
  "outside",
  "outside-left",
  "outside-top",
  "inside",
] as const;

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, label, description, ...props }: FormInputProps<TFieldValues, TName>) {
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
            <Input
              isInvalid={!!fieldState.error}
              value={field.value || ""}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              {...(LABEL_PLACEMENT.includes(
                props.labelPlacement as (typeof LABEL_PLACEMENT)[number],
              )
                ? { label: label }
                : {})}
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
