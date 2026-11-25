import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/categories`;

export type CategoryPriority = "low" | "normal" | "high" | "urgent";
export type CategoryFieldType = "text" | "number" | "longtext" | "date";

export interface CategoryField {
  id: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
}

export interface Category {
  category_id: number;
  category_department_id: number | null;
  department_name: string | null;
  category_name: string;
  description: string | null;
  status: "active" | "inactive";
  default_priority: CategoryPriority;
  needs_approval: boolean;
  extra_fields: CategoryField[];
}

export interface CategoryPayload {
  department_id?: number;
  name?: string;
  description?: string | null;
  status?: "active" | "inactive";
  default_priority?: CategoryPriority;
  needs_approval?: boolean;
  extra_fields?: CategoryField[];
}

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Category request failed.";
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<{ categories: Category[] }>(API, {
      withCredentials: true,
    });
    return response.data.categories;
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
};

export const createCategory = async (
  payload: CategoryPayload
): Promise<Category> => {
  try {
    const response = await axios.post<{ category: Category }>(API, payload, {
      withCredentials: true,
    });
    return response.data.category;
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
};

export const updateCategory = async (
  id: number,
  payload: CategoryPayload
): Promise<Category> => {
  try {
    const response = await axios.put<{ category: Category }>(
      `${API}/${id}`,
      payload,
      { withCredentials: true }
    );
    return response.data.category;
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
};
