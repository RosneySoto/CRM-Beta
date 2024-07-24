
export enum UserRole {
   Admin = 'Admin',
   User = 'User'
};

export interface RoleType {
   name: UserRole;
   description: string;
}