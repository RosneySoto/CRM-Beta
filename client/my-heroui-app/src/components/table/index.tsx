"use client"

import { cn, table as tableClasses } from "@heroui/theme"

const {
    base,
    table,
    thead,
    tbody,
    tr,
    th,
    td,
    tfoot,
} = tableClasses()

// Contenedor principal
export const Table = ({ children, className = "", removeWrapper = false }: { children: React.ReactNode, className?: string, removeWrapper?: boolean }) => {
    if (removeWrapper) {
        // Si removeWrapper = true → solo devuelve la tabla
        return <table className={cn(`${table()} ${className}`)}>{children}</table>
    }

    // Caso normal → con wrapper
    return (
        <div className={cn(`${base()} ${className}`)}>
            <table className={table()}>{children}</table>
        </div>
    )
}

// Head
export const TableHead = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return <thead className={cn(`${thead()} ${className}`)}>{children}</thead>
}

// Body
export const TableBody = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return <tbody className={cn(`${tbody()} ${className}`)}>{children}</tbody>
}

// Footer
export const TableFooter = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return <tfoot className={cn(`${tfoot()} ${className}`)}>{children}</tfoot>
}

// Row
export const TableRow = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return <tr className={cn(`${tr()} ${className}`)}>{children}</tr>
}

// Header Cell
export const TableHeadCell = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string }) => {
    return (
        <th className={cn(`${th()} ${className}`)} {...props}>
            {children}
        </th>
    )
}

// Data Cell
export const TableCell = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, colSpan?: number }) => {
    return (
        <td className={cn(`${td()} ${className}`)} {...props}>
            {children}
        </td>
    )
}
