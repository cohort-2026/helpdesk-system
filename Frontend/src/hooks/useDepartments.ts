import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export const useDepartments = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/departments`);
      setDepartments(res.data.departments || res.data || []);
    } finally {
      setLoading(false);
    }
  };

   const add = async (data: any) => {
    const name = typeof data === "string" ? data : data.name;
    const description = typeof data === "object" ? data.description : "";
    const res = await axios.post(`${API}/departments`, { 
      name, 
      department_name: name,
      description,
      status: "active" 
    });
    await fetchAll();
    return res.data;
  };
  const remove = async (id: number) => {
    await axios.delete(`${API}/departments/${id}`);
    setDepartments(prev => prev.filter((d: any) => d.department_id !== id && d.id !== id));
  };

  useEffect(() => { fetchAll(); }, []);
  return { departments, loading, add, remove, createDepartment: add, deleteDepartment: remove, fetchAll };
};