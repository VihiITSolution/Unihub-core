import { apiClient } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/constants";

export interface Department {
  id: number;
  name: string;
  slug: string;
  facultyId: number;
  isActive: boolean;
  order: number;
}

export interface Faculty {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  order: number;
  departments?: Department[];
}

type ApiRes<T> = { success: boolean; data?: T; message?: string; error?: string };

export const facultyService = {
  // ── Public ────────────────────────────────────────────────────────────────

  async getAll(includeDepartments = false): Promise<Faculty[]> {
    try {
      const query = includeDepartments ? "?include=departments&active=true" : "?active=true";
      const res = await fetch(`${API_BASE_URL}/faculties${query}`);
      const json: ApiRes<{ faculties: Faculty[] } | Faculty[]> = await res.json();
      if (json.success && json.data) {
        const raw = Array.isArray(json.data) ? json.data : (json.data as any).faculties || [];
        return raw;
      }
      return [];
    } catch {
      return [];
    }
  },

  async getDepartments(facultyId: number): Promise<Department[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/faculties/${facultyId}/departments`);
      const json: ApiRes<{ departments: Department[] } | Department[]> = await res.json();
      if (json.success && json.data) {
        return Array.isArray(json.data) ? json.data : (json.data as any).departments || [];
      }
      return [];
    } catch {
      return [];
    }
  },

  // ── Admin: Faculties ──────────────────────────────────────────────────────

  async createFaculty(data: { name: string; icon?: string; order?: number }): Promise<ApiRes<Faculty>> {
    try {
      return await apiClient.post<ApiRes<Faculty>>("/faculties", data);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateFaculty(id: number, data: Partial<{ name: string; icon: string; isActive: boolean; order: number }>): Promise<ApiRes<Faculty>> {
    try {
      return await apiClient.put<ApiRes<Faculty>>(`/faculties/${id}`, data);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteFaculty(id: number): Promise<ApiRes<null>> {
    try {
      return await apiClient.delete<ApiRes<null>>(`/faculties/${id}`);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ── Admin: Departments ────────────────────────────────────────────────────

  async createDepartment(facultyId: number, data: { name: string; order?: number }): Promise<ApiRes<Department>> {
    try {
      return await apiClient.post<ApiRes<Department>>(`/faculties/${facultyId}/departments`, data);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateDepartment(id: number, data: Partial<{ name: string; isActive: boolean; order: number }>): Promise<ApiRes<Department>> {
    try {
      return await apiClient.put<ApiRes<Department>>(`/departments/${id}`, data);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteDepartment(id: number): Promise<ApiRes<null>> {
    try {
      return await apiClient.delete<ApiRes<null>>(`/departments/${id}`);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ── Admin: Bulk seed ──────────────────────────────────────────────────────

  async seedDefaults(): Promise<ApiRes<{ created: number }>> {
    try {
      return await apiClient.post<ApiRes<{ created: number }>>("/faculties/seed", {});
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

export default facultyService;
