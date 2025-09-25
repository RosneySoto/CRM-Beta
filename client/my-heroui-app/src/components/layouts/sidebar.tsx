import React from "react";
import { NavLink } from "react-router-dom";
import { SearchNormal, Profile2User, User, Home, Filter, ChartSquare, Icon as IconType, ClipboardTick, UserAdd, Category2 } from "iconsax-react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

export const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-white border-r border-divider/50 flex flex-col">
            <div className="p-4 px-6 flex items-center gap-2">
                <div className="bg-primary rounded-medium p-1">
                    {/* <Logo /> */}
                </div>
                <h1 className="text-xl font-semibold">Knockturnals</h1>
            </div>

            <div className="p-4">
                <div className="bg-zinc-100 rounded-medium p-2 px-4">
                    <div className="relative flex items-center">
                        <SearchNormal size={25} variant="Bulk" color="currentColor" />
                        <input
                            type="text"
                            placeholder="Search Anything"
                            className="w-full bg-transparent border-none outline-none pl-4 text-sm text-foreground-600"
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 py-2">
                <p className="text-xs text-foreground-400 font-medium mb-2">Lista de Acciones</p>
                <nav className="space-y-1">
                    <NavItem icon={Home} label="Dashboard" to="/dashboard" />
                    <NavItem icon={Profile2User} label="Clientes" to="/customers" />
                    <NavItem icon={ClipboardTick} label="Órdenes de Servicios" to="/orders" />
                    <NavItem icon={Filter} label="Servicios" to="/services" />

                    <NavItem icon={ChartSquare} label="Reports" to="/reports" />
                    <NavItem icon={Filter} label="Invoice" to="/invoices" />
                </nav>
            </div>

            <div className="mt-auto">
                <Popover className="w-full min-w-60">
                    <PopoverTrigger>
                        <div className="flex items-center gap-3  p-4">
                            <div className="w-8 h-8 rounded-full bg-content3 flex items-center justify-center">
                                <User size={15} variant="Bold" color="currentColor" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">John Jacobs</p>
                                <p className="text-xs text-foreground-400">johnjacobs@gmail.com</p>
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-4">
                        <div className="space-y-1 w-full">
                            <NavItem icon={Category2} label="Roles" to="/roles" />
                            <NavItem icon={UserAdd} label="Usuarios" to="/users" />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </aside>
    );
};

interface NavItemProps {
    icon: React.ComponentType<any>;
    label: string;
    to: string;
    active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active }) => {
    const Icon = icon as IconType;
    console.log(to);
    console.log(active);

    return (
        <NavLink
            to={to}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-medium text-sm ${
                (active || isActive)
                    ? "bg-default-200 text-foreground"
                    : "text-foreground-400 hover:bg-default-100 hover:text-foreground-600"
            }`}
        >
            <Icon size={25} variant="Bold" color="currentColor" />
            <span>{label}</span>
        </NavLink>
    );
};