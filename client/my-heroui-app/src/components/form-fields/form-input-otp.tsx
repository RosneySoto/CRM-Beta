import { InputOtp, InputOtpProps } from "@heroui/input-otp";
import { useFormContext, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { FieldPath, FieldValues } from "react-hook-form";

export interface FormInputOtpProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<InputOtpProps, "value" | "onChange" | "onBlur" | "name"> {
  name: TName;
  label?: string;
  description?: string;
}

export function FormInputOtp<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  ...props
}: FormInputOtpProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField<TFieldValues, TName>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <InputOtp
              value={field.value || ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!fieldState.error}
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
