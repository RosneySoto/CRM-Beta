import { RadioGroup, Radio, RadioGroupProps } from "@heroui/radio";
import { useFormContext, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { FieldPath, FieldValues } from "react-hook-form";

export interface RadioOption {
  value: string;
  label: string;
}

export interface FormRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<RadioGroupProps, "defaultValue" | "value" | "onChange" | "onValueChange" | "name"> {
  name: TName;
  options: RadioOption[];
  label?: string;
  description?: string;
}

export function FormRadioGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  options,
  label,
  description,
  ...props
}: FormRadioGroupProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  
  return (
    <FormField<TFieldValues, TName>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!fieldState.error}
              {...props}
            >
              {options.map((option) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
