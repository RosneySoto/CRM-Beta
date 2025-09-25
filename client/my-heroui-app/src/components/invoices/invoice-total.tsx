import { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@heroui/button";
import { DollarSquare, PercentageSquare, Trash } from "iconsax-react";
import { FormNumberInput } from "../form-fields/form-number-input";
import { FormInput } from "../form-fields/form-input";
import { useFormContext } from "react-hook-form";

interface InvoiceTotalProps {
    subtotal: number;
    discountAmount: number;
    totalTaxes: number;
    total: number;
    formattedSubtotal: string;
    formattedDiscountAmount: string;
    formattedTotalTaxes: string;
    formattedTotal: string;
}
function InvoiceTotal({ subtotal, discountAmount, totalTaxes, total, formattedSubtotal, formattedDiscountAmount, formattedTotalTaxes, formattedTotal }: InvoiceTotalProps) {

    const { setValue, getValues } = useFormContext();
    const [showDiscount, setShowDiscount] = useState(false);
    const [discount, setDiscount] = useState({ value: 0, type: 'percentage' });

    const setDiscountValue = (type: 'percentage' | 'fixed',) => {
        setDiscount({ value: getValues('invoice.discount.value'), type });
    }

    useEffect(() => {
        setValue('invoice.discount.type', discount.type);
        setValue('invoice.discount.value', discount.value);
    }, [discount]);


    useEffect(() => {
        setValue('totals.subtotal', subtotal);
        setValue('invoice.subtotal', subtotal);
        setValue('totals.discountAmount', discountAmount);
        setValue('invoice.discountAmount', discountAmount);
        setValue('totals.totalTaxes', totalTaxes);
        setValue('invoice.totalTaxes', totalTaxes);
        setValue('totals.total', total);
        setValue('invoice.total', total);
    }, [subtotal, discountAmount, totalTaxes, total]);

    return (
        <div className="flex flex-col gap-4 justify-end items-end w-full border-t border-divider py-4">
            <div className="flex flex-row gap-2 items-center justify-between">
                <p className="w-32 text-sm text-foreground-400">Subtotal</p>
                <p className="w-32 text-end text-sm">{formattedSubtotal}</p>
                <div className="hidden">
                    <FormNumberInput
                        aria-label="Sub total de la factura"
                        name="invoice.subtotal"
                        minValue={0}
                    />
                    <FormNumberInput aria-label="Sub total" name="totals.subtotal" />
                </div>
            </div>

            <div className="flex flex-row gap-2 justify-end items-center">
                <div className="w-52 text-end text-sm flex items-center justify-between gap-2">
                    {!showDiscount ? (
                        <button
                            type="button"
                            onClick={() => setShowDiscount(true)}
                            className="text-sm text-zinc-500 hover:text-zinc-700 cursor-pointer"
                        >
                            Agregar descuento
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-end gap-2">
                                <ButtonGroup>
                                    <Button
                                        type="button"
                                        onPress={() => setDiscountValue('percentage')}
                                        variant="flat"
                                        isIconOnly
                                        className={`${discount.type === 'percentage' ? 'bg-primary text-primary-foreground' : ''}`}
                                    >
                                        <PercentageSquare
                                            size={25}
                                            variant="Bold"
                                            color="currentColor"
                                        />
                                    </Button>
                                    <Button
                                        type="button"
                                        onPress={() => setDiscountValue('fixed')}
                                        variant="flat"
                                        isIconOnly
                                        className={`${discount.type === 'fixed' ? 'bg-primary text-primary-foreground' : ''}`}
                                    >
                                        <DollarSquare
                                            size={25}
                                            variant="Bold"
                                            color="currentColor"
                                        />
                                    </Button>
                                </ButtonGroup>

                                <div className="hidden">
                                    <FormInput name="invoice.discount.type" />
                                </div>

                                <FormNumberInput
                                    aria-label="Total de descuento"
                                    labelPlacement="outside"
                                    name="invoice.discount.value"
                                    minValue={0}
                                    maxValue={discount.type === 'percentage' ? 100 : undefined}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-32 text-end text-sm flex items-center justify-end gap-2">
                    <p>-{formattedDiscountAmount}</p>
                    <Button
                        type="button"
                        onPress={() => {
                            setDiscount({ value: 0, type: 'percentage' });
                            setShowDiscount(false);
                        }}
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="text-default-400 hover:text-default-600 h-6 w-6 min-h-6 min-w-6"
                    >
                        <Trash size={14} variant="Bold" color="currentColor" />
                    </Button>
                    <div className="hidden">
                        <FormNumberInput
                            aria-label="Total de descuento"
                            name="invoice.discountAmount"
                            minValue={0}
                        />
                        <FormNumberInput aria-label="Total descuento" name="totals.discountAmount" minValue={0} />
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-2 items-center justify-between">
                <p className="w-32 text-sm text-foreground-400">Total de impuestos</p>
                <p className="w-32 text-end text-sm">{formattedTotalTaxes}</p>
                <div className="hidden">
                    <FormNumberInput
                        aria-label="Total de impuestos"
                        name="invoice.totalTaxes"
                        minValue={0}
                    />
                    <FormNumberInput aria-label="Total impuestos" name="totals.totalTaxes" minValue={0} />
                </div>
            </div>
            <div className="flex flex-row gap-2 items-center justify-between font-semibold pt-2 border-t border-divider">
                <p className="w-32 text-sm">Total</p>
                <p className="w-32 text-end text-sm">{formattedTotal}</p>
                <div className="hidden">
                    <FormNumberInput
                        aria-label="Total"
                        name="invoice.total"
                        minValue={0}
                    />
                    <FormNumberInput aria-label="Total" name="totals.total" minValue={0} />
                </div>
            </div>
        </div>
    )
}

export default InvoiceTotal;