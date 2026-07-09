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

// Sri Lankan university faculties — used as fallback when backend is empty
export const FALLBACK_FACULTIES: Faculty[] = [
  { id: 1, name: "Computing & IT", slug: "computing-it", isActive: true, order: 1, departments: [
    { id: 1, name: "Computer Science", slug: "computer-science", facultyId: 1, isActive: true, order: 1 },
    { id: 2, name: "Software Engineering", slug: "software-engineering", facultyId: 1, isActive: true, order: 2 },
    { id: 3, name: "Information Systems", slug: "information-systems", facultyId: 1, isActive: true, order: 3 },
    { id: 4, name: "Data Science & AI", slug: "data-science-ai", facultyId: 1, isActive: true, order: 4 },
    { id: 5, name: "Cybersecurity", slug: "cybersecurity", facultyId: 1, isActive: true, order: 5 },
    { id: 6, name: "Computer Engineering", slug: "computer-engineering", facultyId: 1, isActive: true, order: 6 },
  ]},
  { id: 2, name: "Engineering", slug: "engineering", isActive: true, order: 2, departments: [
    { id: 7, name: "Civil Engineering", slug: "civil-engineering", facultyId: 2, isActive: true, order: 1 },
    { id: 8, name: "Mechanical Engineering", slug: "mechanical-engineering", facultyId: 2, isActive: true, order: 2 },
    { id: 9, name: "Electrical & Electronic", slug: "electrical-electronic", facultyId: 2, isActive: true, order: 3 },
    { id: 10, name: "Chemical & Process", slug: "chemical-process", facultyId: 2, isActive: true, order: 4 },
    { id: 11, name: "Production Engineering", slug: "production-engineering", facultyId: 2, isActive: true, order: 5 },
    { id: 12, name: "Electronics & Telecom", slug: "electronics-telecom", facultyId: 2, isActive: true, order: 6 },
    { id: 13, name: "Environmental Engineering", slug: "environmental-engineering", facultyId: 2, isActive: true, order: 7 },
  ]},
  { id: 3, name: "Medicine & Health Sciences", slug: "medicine-health", isActive: true, order: 3, departments: [
    { id: 14, name: "Anatomy", slug: "anatomy", facultyId: 3, isActive: true, order: 1 },
    { id: 15, name: "Physiology", slug: "physiology", facultyId: 3, isActive: true, order: 2 },
    { id: 16, name: "Biochemistry", slug: "biochemistry", facultyId: 3, isActive: true, order: 3 },
    { id: 17, name: "Pharmacology", slug: "pharmacology", facultyId: 3, isActive: true, order: 4 },
    { id: 18, name: "Community Medicine", slug: "community-medicine", facultyId: 3, isActive: true, order: 5 },
    { id: 19, name: "Surgery", slug: "surgery", facultyId: 3, isActive: true, order: 6 },
    { id: 20, name: "Internal Medicine", slug: "internal-medicine", facultyId: 3, isActive: true, order: 7 },
    { id: 21, name: "Paediatrics", slug: "paediatrics", facultyId: 3, isActive: true, order: 8 },
    { id: 22, name: "Nursing", slug: "nursing", facultyId: 3, isActive: true, order: 9 },
  ]},
  { id: 4, name: "Management & Business", slug: "management-business", isActive: true, order: 4, departments: [
    { id: 23, name: "Business Administration", slug: "business-administration", facultyId: 4, isActive: true, order: 1 },
    { id: 24, name: "Accountancy", slug: "accountancy", facultyId: 4, isActive: true, order: 2 },
    { id: 25, name: "Finance", slug: "finance", facultyId: 4, isActive: true, order: 3 },
    { id: 26, name: "Marketing", slug: "marketing", facultyId: 4, isActive: true, order: 4 },
    { id: 27, name: "Human Resource Management", slug: "hrm", facultyId: 4, isActive: true, order: 5 },
    { id: 28, name: "Economics", slug: "economics", facultyId: 4, isActive: true, order: 6 },
    { id: 29, name: "Entrepreneurship", slug: "entrepreneurship", facultyId: 4, isActive: true, order: 7 },
    { id: 30, name: "Logistics & Transport", slug: "logistics-transport", facultyId: 4, isActive: true, order: 8 },
  ]},
  { id: 5, name: "Arts & Humanities", slug: "arts-humanities", isActive: true, order: 5, departments: [
    { id: 31, name: "English", slug: "english", facultyId: 5, isActive: true, order: 1 },
    { id: 32, name: "Sinhala", slug: "sinhala", facultyId: 5, isActive: true, order: 2 },
    { id: 33, name: "Tamil", slug: "tamil", facultyId: 5, isActive: true, order: 3 },
    { id: 34, name: "History", slug: "history", facultyId: 5, isActive: true, order: 4 },
    { id: 35, name: "Geography", slug: "geography", facultyId: 5, isActive: true, order: 5 },
    { id: 36, name: "Political Science", slug: "political-science", facultyId: 5, isActive: true, order: 6 },
    { id: 37, name: "Sociology", slug: "sociology", facultyId: 5, isActive: true, order: 7 },
    { id: 38, name: "Psychology", slug: "psychology", facultyId: 5, isActive: true, order: 8 },
    { id: 39, name: "Mass Communication", slug: "mass-communication", facultyId: 5, isActive: true, order: 9 },
    { id: 40, name: "Fine Arts", slug: "fine-arts", facultyId: 5, isActive: true, order: 10 },
  ]},
  { id: 6, name: "Science", slug: "science", isActive: true, order: 6, departments: [
    { id: 41, name: "Mathematics", slug: "mathematics", facultyId: 6, isActive: true, order: 1 },
    { id: 42, name: "Statistics", slug: "statistics", facultyId: 6, isActive: true, order: 2 },
    { id: 43, name: "Physics", slug: "physics", facultyId: 6, isActive: true, order: 3 },
    { id: 44, name: "Chemistry", slug: "chemistry", facultyId: 6, isActive: true, order: 4 },
    { id: 45, name: "Botany", slug: "botany", facultyId: 6, isActive: true, order: 5 },
    { id: 46, name: "Zoology", slug: "zoology", facultyId: 6, isActive: true, order: 6 },
    { id: 47, name: "Microbiology", slug: "microbiology", facultyId: 6, isActive: true, order: 7 },
    { id: 48, name: "Geology", slug: "geology", facultyId: 6, isActive: true, order: 8 },
    { id: 49, name: "Environmental Sciences", slug: "environmental-sciences", facultyId: 6, isActive: true, order: 9 },
    { id: 50, name: "Food Science & Technology", slug: "food-science", facultyId: 6, isActive: true, order: 10 },
  ]},
  { id: 7, name: "Law", slug: "law", isActive: true, order: 7, departments: [
    { id: 51, name: "Private Law", slug: "private-law", facultyId: 7, isActive: true, order: 1 },
    { id: 52, name: "Public & International Law", slug: "public-international-law", facultyId: 7, isActive: true, order: 2 },
    { id: 53, name: "Commercial Law", slug: "commercial-law", facultyId: 7, isActive: true, order: 3 },
    { id: 54, name: "Constitutional Law", slug: "constitutional-law", facultyId: 7, isActive: true, order: 4 },
  ]},
  { id: 8, name: "Education", slug: "education", isActive: true, order: 8, departments: [
    { id: 55, name: "Science Education", slug: "science-education", facultyId: 8, isActive: true, order: 1 },
    { id: 56, name: "Language Education", slug: "language-education", facultyId: 8, isActive: true, order: 2 },
    { id: 57, name: "Educational Technology", slug: "educational-technology", facultyId: 8, isActive: true, order: 3 },
    { id: 58, name: "Physical Education", slug: "physical-education", facultyId: 8, isActive: true, order: 4 },
    { id: 59, name: "Primary Education", slug: "primary-education", facultyId: 8, isActive: true, order: 5 },
  ]},
  { id: 9, name: "Agriculture", slug: "agriculture", isActive: true, order: 9, departments: [
    { id: 60, name: "Agronomy", slug: "agronomy", facultyId: 9, isActive: true, order: 1 },
    { id: 61, name: "Animal Science", slug: "animal-science", facultyId: 9, isActive: true, order: 2 },
    { id: 62, name: "Agricultural Engineering", slug: "agricultural-engineering", facultyId: 9, isActive: true, order: 3 },
    { id: 63, name: "Food Science", slug: "food-science-agr", facultyId: 9, isActive: true, order: 4 },
    { id: 64, name: "Horticulture", slug: "horticulture", facultyId: 9, isActive: true, order: 5 },
    { id: 65, name: "Agricultural Economics", slug: "agricultural-economics", facultyId: 9, isActive: true, order: 6 },
  ]},
  { id: 10, name: "Architecture", slug: "architecture", isActive: true, order: 10, departments: [
    { id: 66, name: "Architecture", slug: "architecture-dept", facultyId: 10, isActive: true, order: 1 },
    { id: 67, name: "Town & Country Planning", slug: "town-planning", facultyId: 10, isActive: true, order: 2 },
    { id: 68, name: "Urban Design", slug: "urban-design", facultyId: 10, isActive: true, order: 3 },
  ]},
  { id: 11, name: "Allied Health Sciences", slug: "allied-health", isActive: true, order: 11, departments: [
    { id: 69, name: "Medical Laboratory Science", slug: "medical-lab", facultyId: 11, isActive: true, order: 1 },
    { id: 70, name: "Physiotherapy", slug: "physiotherapy", facultyId: 11, isActive: true, order: 2 },
    { id: 71, name: "Radiography", slug: "radiography", facultyId: 11, isActive: true, order: 3 },
    { id: 72, name: "Occupational Therapy", slug: "occupational-therapy", facultyId: 11, isActive: true, order: 4 },
    { id: 73, name: "Pharmacy", slug: "pharmacy", facultyId: 11, isActive: true, order: 5 },
  ]},
  { id: 12, name: "Dental Sciences", slug: "dental", isActive: true, order: 12, departments: [
    { id: 74, name: "Oral Biology", slug: "oral-biology", facultyId: 12, isActive: true, order: 1 },
    { id: 75, name: "Restorative Dentistry", slug: "restorative-dentistry", facultyId: 12, isActive: true, order: 2 },
    { id: 76, name: "Oral Medicine & Periodontology", slug: "oral-medicine", facultyId: 12, isActive: true, order: 3 },
  ]},
  { id: 13, name: "Indigenous Medicine", slug: "indigenous-medicine", isActive: true, order: 13, departments: [
    { id: 77, name: "Ayurveda", slug: "ayurveda", facultyId: 13, isActive: true, order: 1 },
    { id: 78, name: "Unani Medicine", slug: "unani", facultyId: 13, isActive: true, order: 2 },
    { id: 79, name: "Deshiya Chikitsa", slug: "deshiya-chikitsa", facultyId: 13, isActive: true, order: 3 },
  ]},
  { id: 14, name: "A/L & Foundation", slug: "al-foundation", isActive: true, order: 14, departments: [
    { id: 80, name: "Physical Science", slug: "physical-science", facultyId: 14, isActive: true, order: 1 },
    { id: 81, name: "Biological Science", slug: "biological-science", facultyId: 14, isActive: true, order: 2 },
    { id: 82, name: "Commerce", slug: "commerce", facultyId: 14, isActive: true, order: 3 },
    { id: 83, name: "Arts Stream", slug: "arts-stream", facultyId: 14, isActive: true, order: 4 },
    { id: 84, name: "English Foundation", slug: "english-foundation", facultyId: 14, isActive: true, order: 5 },
    { id: 85, name: "Mathematics Foundation", slug: "math-foundation", facultyId: 14, isActive: true, order: 6 },
  ]},
];

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
