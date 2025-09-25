// client/my-heroui-app/src/components/form-fields/form-logo.tsx
"use client"

import { Button } from "@heroui/button";
import { Trash } from "iconsax-react";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@heroui/input";

const FILES_ALLOWED = ["image/jpeg", "image/png", "image/jpg"]

interface FormLogoProps {
    name: string;
    preview: string;
    label?: string;
    className?: string;
}

export default function FormLogo({ name, preview, label, className }: FormLogoProps) {
    const { watch, setValue, setError, formState: { errors } } = useFormContext()
    const logoFile = watch(name) as File | null
    const logoPreviewField = watch(preview) as string | null

    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    useEffect(() => {
        if (logoFile) {
            if (FILES_ALLOWED.includes(logoFile.type)) {
                handleLogoChange(logoFile)
            } else {
                setError(name, {
                    type: "custom",
                    message: "Archivo no permitido"
                })
            }
        }
    }, [logoFile])

    useEffect(() => {
        if (logoPreviewField && !logoPreview) {
            setLogoPreview(logoPreviewField)
        }
    }, [logoPreviewField])

    const handleLogoChange = useCallback((file: File) => {
        if (!(file instanceof File)) return
        const reader = new FileReader()
        reader.onload = (e) => {
            setLogoPreview(e.target?.result as string)
            setValue(preview, e.target?.result as string, { shouldValidate: false, shouldDirty: true })
        }
        reader.readAsDataURL(file)
    }, [setValue, preview])

    const triggerFileInput = () => {
        const logoInput = document.getElementById(name) as HTMLInputElement;
        if (logoInput) {
            logoInput.click();
        }
    };

    const removeLogo = () => {
        setLogoPreview(null)
        setValue(name, null, { shouldValidate: true, shouldDirty: true })
        setValue(preview, null, { shouldValidate: false, shouldDirty: true })
        const logoInput = document.getElementById(name) as HTMLInputElement | null
        if (logoInput) logoInput.value = ''
    }

    return (
        <FormField
            name={name}
            render={({ field, fieldState }) => (
                <FormItem className={className}>
                    {label && (
                        <label className="block subpixel-antialiased text-small text-foreground mb-2">
                            {label}
                        </label>
                    )}
                    <FormControl>
                        <div className="relative flex-1 flex flex-col w-full gap-2">
                            <Input
                                id={name}
                                name={name}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const target = e.target as HTMLInputElement
                                    const file = target.files && target.files[0]
                                    if (file) {
                                        if (FILES_ALLOWED.includes(file.type)) {
                                            setValue(name, file, { shouldValidate: true, shouldDirty: true })
                                            handleLogoChange(file)
                                        } else {
                                            setError(name, {
                                                type: "custom",
                                                message: "Archivo no permitido"
                                            })
                                        }
                                    }
                                }}
                            />

                            {!logoPreview ? (
                                <button
                                    type="button"
                                    className={`${fieldState.error ? 'border-danger bg-danger-50' : ''} relative size-full min-h-40 max-h-40 flex justify-center items-center gap-4 border border-divider rounded-medium border-dashed cursor-pointer`}
                                    onClick={triggerFileInput}
                                >
                                    <p>Agregar logo</p>
                                </button>
                            ) : (
                                <div className="flex justify-center items-center relative size-full min-h-full bg-white border border-divider rounded-medium overflow-hidden">
                                    {/* Texto "Logo" en la esquina superior izquierda */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className="text-xs font-medium text-default-600">Logo</span>
                                    </div>

                                    {/* Imagen del logo centrada */}
                                    <div className="size-full min-h-40 max-h-40 flex items-center justify-center">
                                        <img
                                            src={logoPreview}
                                            alt="Logo de la empresa"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>

                                    {/* Botón eliminar en la esquina inferior derecha */}
                                    <div className="absolute bottom-2 right-2 z-10">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="flat"
                                            className="bg-default-100 hover:bg-default-200"
                                            onPress={removeLogo}
                                            type="button"
                                        >
                                            <Trash size={14} color="currentColor" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}