import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export interface Department {
  department_id: string | number;
  department_name: string;
  description?: string | null;
  status?: string;
  lead_id?: string | number | null;
  departmentLead?: string | null;
  lead_name?: string | null;
  lead_surname?: string | null;
  lead_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

  const fetchAll = useCallback(async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${API}/departments`);
    const fetchedDepartments = res.data.departments || res.data || [];
    setDepartments(fetchedDepartments);
    //console.log("fetched")
  } finally {
    setLoading(false);
  }
}, []);
export interface DepartmentPayload {
  name: string;
  department_name?: string;
  description?: string | null;
  status?: string;
  leadId?: string | number | null;
  lead_id?: string | number | null;
}

export interface UpdateDepartmentPayload {
  name?: string;
  department_name?: string;
  description?: string | null;
  status?: string;
  leadId?: string | number | null;
  lead_id?: string | number | null;
}

interface UseDepartmentsOptions {
  autoPolling?: boolean;
  pollInterval?: number;
}

export const useDepartments = (options: UseDepartmentsOptions = {}) => {
  // const { autoPolling = true, pollInterval = 10000 } = options;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track if initial fetch completed
  const initialFetchDone = useRef<boolean>(false);

  const fetchAll = useCallback(async (isBackground: boolean = false) => {
    try {
      if (!isBackground && !initialFetchDone.current) {
        setLoading(true);
      } else {
        setIsRefetching(true);
      }
      setError(null);

      const res = await axios.get(`${API}/departments`, { withCredentials: true });
      const fetchedDepartments: Department[] = res.data?.departments || res.data || [];
      setDepartments(fetchedDepartments);
      initialFetchDone.current = true;
      return fetchedDepartments;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch departments";
      console.error("Failed to fetch departments:", err);
      // Only set UI-blocking error on initial failure
      if (!initialFetchDone.current) {
        setError(message);
      }
      return [];
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, []);

  const createDepartment = async (data: DepartmentPayload | string) => {
    setActionLoading(true);
    setError(null);
    try {
      const name = typeof data === "string" ? data : (data.name || data.department_name || "");
      const description = typeof data === "object" ? (data.description || "") : "";
      const status = typeof data === "object" && data.status ? data.status : "active";
      const leadId = typeof data === "object" ? (data.leadId ?? data.lead_id ?? null) : null;

      const res = await axios.post(
        `${API}/departments`,
        {
          name: name.trim(),
          department_name: name.trim(),
          description: description ? description.trim() : null,
          status,
          leadId: leadId && String(leadId).trim() !== "" ? String(leadId).trim() : null,
        },
        { withCredentials: true }
      );

      const created = res.data?.department || res.data;

      // Optimistic addition
      if (created) {
        setDepartments((prev) => [created, ...prev]);
      }

      // Immediate background refetch to synchronize authoritative server state in real time
      fetchAll(true);

      return created;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to create department";
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const updateDepartment = async (id: number | string, data: UpdateDepartmentPayload) => {
    setActionLoading(true);
    setError(null);
    try {
      const name = data.name ?? data.department_name;
      const description = data.description;
      const status = data.status;
      const leadId = data.leadId ?? data.lead_id;

      const payload: any = {};
      if (name !== undefined) payload.name = name.trim();
      if (description !== undefined) payload.description = description !== null ? description.trim() : null;
      if (status !== undefined) payload.status = status;
      if (leadId !== undefined) {
        payload.leadId = leadId && String(leadId).trim() !== "" ? String(leadId).trim() : null;
      }

      const res = await axios.put(
        `${API}/departments/${id}`,
        payload,
        { withCredentials: true }
      );

      const updated = res.data?.department || res.data;

      // Optimistic update
      if (updated) {
        setDepartments((prev) =>
          prev.map((d) =>
            String(d.department_id) === String(id) || String((d as any).id) === String(id)
              ? { ...d, ...updated }
              : d
          )
        );
      }

      // Immediate background refetch to reflect department updates in real time
      fetchAll(true);

      return updated;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to update department";
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteDepartment = async (id: number | string) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await axios.delete(`${API}/departments/${id}`, { withCredentials: true });

      // Optimistic removal from active departments
      setDepartments((prev) =>
        prev.filter((d) => String(d.department_id) !== String(id) && String((d as any).id) !== String(id))
      );

      // Immediate background refetch to reflect department updates in real time
      fetchAll(true);

      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to delete department";
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  return {
    departments,
    loading,
    isRefetching,
    actionLoading,
    error,
    clearError: () => setError(null),
    add: createDepartment,
    createDepartment,
    update: updateDepartment,
    updateDepartment,
    remove: deleteDepartment,
    deleteDepartment,
    fetchAll,
    refetch: () => fetchAll(true),
  };
};