export interface User {
    user_id: string;
    name: string;
    surname: string;
    email: string;
    password?: string;
    role: string;
    active: boolean;
    created_at: Date;
    department_id?: number | null;
}

export interface CreateUserDto {
    user_id: string;
    name: string;
    surname: string;
    email: string;
    password?: string;
    role?: string;
    active?: boolean;
    department_id?: number | null;
}

export interface UpdateUserDto {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    role?: string;
    active?: boolean;
    department_id?: number | null;
}