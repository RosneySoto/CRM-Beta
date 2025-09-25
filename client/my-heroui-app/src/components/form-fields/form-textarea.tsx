import { Textarea, TextAreaProps } from "@heroui/input";
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

export interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<
    TextAreaProps,
    "defaultValue" | "value" | "onChange" | "onBlur" | "name"
  > {
  name: TName;
  label?: string;
  description?: string;
  rows?: number;
}

export function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  ...props
}: FormTextareaProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField<TFieldValues, TName>
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              isInvalid={!!fieldState.error}
              value={field.value || ""}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
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
