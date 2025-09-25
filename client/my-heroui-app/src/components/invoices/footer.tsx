"use client";

import { FormTextarea } from "@/components/form-fields/form-textarea";
import { FormSelect } from "@/components/form-fields/form-select";

interface AdvancedSectionProps {
    categories: { id: string, key: string, label: string }[];
    templates: { id: string, key: string, label: string }[];
    tags: { id: string, key: string, label: string }[];
}

export default function AdvancedSection(
    { categories, templates, tags }: AdvancedSectionProps
) {
    return (
        <div className="flex flex-row gap-8">
            <div className="flex-1 flex flex-col flex-wrap gap-4 w-full">
                <FormTextarea
                    minRows={8}
                    name="invoice.info.footer"
                    label="Pie de página"
                    placeholder="Escribe el pie de página de tu factura"
                />
            </div>
            <div className="flex-1 flex flex-col flex-wrap gap-4 w-full">

                <FormSelect
                    name="invoice.info.category"
                    options={categories.map((category) => ({
                        id: category.id,
                        key: category.key,
                        label: category.label,
                        value: category.id
                    }))}
                    label="Categoría"
                />

                <FormSelect
                    name="invoice.info.template"
                    label="Plantilla"
                    options={templates.map((template) => ({
                        id: template.id,
                        key: template.key,
                        label: template.label,
                        value: template.id
                    }))}
                />

                <FormSelect
                    name="invoice.info.tags"
                    label="Etiquetas"
                    selectionMode="multiple"
                    options={tags.map((tag) => ({
                        id: tag.id,
                        key: tag.key,
                        label: tag.label,
                        value: tag.id
                    }))}
                />
            </div>
        </div>
    );
}

