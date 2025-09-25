import { DateRangePicker, DateRangePickerProps } from "@heroui/date-picker";
import { useFormContext, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { FieldPath, FieldValues } from "react-hook-form";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { DateValue } from "@react-types/datepicker";

export interface FormDateRangePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<DateRangePickerProps, "defaultValue" | "value" | "onChange" | "name"> {
  name: TName;
  label?: string;
  description?: string;
}

export function FormDateRangePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  ...props
}: FormDateRangePickerProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  
  return (
    <FormField<TFieldValues, TName>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        // Convert JavaScript Date range to DateValue range
        const dateRangeValue = field.value ? {
          start: field.value.start instanceof Date 
            ? parseDate(field.value.start.toISOString().split('T')[0]) 
            : field.value.start,
          end: field.value.end instanceof Date 
            ? parseDate(field.value.end.toISOString().split('T')[0]) 
            : field.value.end
        } : null;
        
        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <DateRangePicker
                value={dateRangeValue}
                onChange={(range: RangeValue<DateValue> | null) => {
                  // Convert DateValue range back to JavaScript Date range
                  if (range) {
                    const jsDateRange = {
                      start: range.start.toDate(getLocalTimeZone()),
                      end: range.end.toDate(getLocalTimeZone())
                    };
                    field.onChange(jsDateRange);
                  } else {
                    field.onChange(null);
                  }
                }}
                onBlur={field.onBlur}
                isInvalid={!!fieldState.error}
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
