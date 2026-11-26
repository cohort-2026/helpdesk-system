import { useCallback, useEffect, useState } from "react";
import * as categoryService from "../services/categoryService";
import type { Category, CategoryPayload } from "../services/categoryService";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await categoryService.fetchCategories();
      setCategories(fetched);
      return fetched;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch categories.";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CategoryPayload) => {
    setError(null);
    try {
      const created = await categoryService.createCategory(payload);
      setCategories((current) => [...current, created]);
      return created;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create category.";
      setError(message);
      throw new Error(message, { cause: err });
    }
  }, []);

  const update = useCallback(async (id: number, payload: CategoryPayload) => {
    setError(null);
    try {
      const updated = await categoryService.updateCategory(id, payload);
      setCategories((current) =>
        current.map((category) =>
          category.category_id === id ? updated : category
        )
      );
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update category.";
      setError(message);
      throw new Error(message, { cause: err });
    }
  }, []);

  useEffect(() => {
    let active = true;
    categoryService
      .fetchCategories()
      .then((fetched) => {
        if (active) {
          setCategories(fetched);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch categories."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading, error, fetchAll, create, update };
};
