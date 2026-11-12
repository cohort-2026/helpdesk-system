export interface Category {
  category_id: number;
  category_department_id: number;
  category_name: string;
  status: "active" | "inactive";
  created_at: Date;
  updated_at: Date;
  department_name?: string;
}

export interface CreateCategoryDto {
  category_name: string;
  category_department_id?: number;
  status?: "active" | "inactive";
}

export interface UpdateCategoryDto {
  category_name?: string;
  category_department_id?: number;
  status?: "active" | "inactive";
}

