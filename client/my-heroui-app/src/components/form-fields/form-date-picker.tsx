import { DatePicker, DatePickerProps } from "@heroui/date-picker";
import { FieldPath, FieldValues } from "react-hook-form";
import { parseDate, getLocalTimeZone } from "@internationalized/date";

import {
  useFormContext,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../ui/form";

export interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<DatePickerProps, "value" | "onChange" | "name"> {
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

export function FormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  ...props
}: FormDatePickerProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();

  const labelProp = LABEL_PLACEMENT.includes(
    props.labelPlacement as (typeof LABEL_PLACEMENT)[number],
  )
    ? { label: label }
    : {};

  return (
    <FormField<TFieldValues, TName>
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        // Convert JavaScript Date to DateValue safely
        let dateValue = null;

        if (field.value instanceof Date) {
          try {
            dateValue = parseDate(field.value.toISOString().split("T")[0]);
          } catch (error) {
            dateValue = null;
          }
        } else if (
          field.value &&
          typeof field.value === "object" &&
          "calendar" in field.value
        ) {
          // Already a DateValue
          dateValue = field.value;
        }

        return (
          <FormItem>
            {label &&
              !LABEL_PLACEMENT.includes(
                props.labelPlacement as (typeof LABEL_PLACEMENT)[number],
              ) && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <DatePicker
                aria-label={label || `Date picker for ${name}`}
                isInvalid={!!fieldState.error}
                value={dateValue}
                onBlur={field.onBlur}
                onChange={field.onChange}
                {...labelProp}
                {...props}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
