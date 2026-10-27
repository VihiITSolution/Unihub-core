"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/constants";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loading } from "@/components/ui";
import YouTubeRightsDeclarationForm from "@/components/tutor/YouTubeRightsDeclarationForm";
import { FALLBACK_FACULTIES, type Faculty, type Department } from "@/services/faculty.service";
import {
  youtubeRightsService,
  type YouTubeRightsDeclarationStatus,
} from "@/services/youtube-rights.service";

interface CourseMaterial {
  id: string;
  title: string;
  type: "video" | "pdf" | "link";
  file?: File;
  videoUrl?: string;
  resourceUrl?: string;
  duration?: number;
  isPreview?: boolean;
}

const isYouTubeUrl = (url: string) =>
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url.trim());

const isPublicResourceUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const readVideoDurationMinutes = (file: File): Promise<number | null> =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Number.isFinite(video.duration) && video.duration > 0 ? Math.ceil(video.duration / 60) : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    video.src = objectUrl;
  });

export default function CreateCoursePage() {
  const router = useRouter();
  const { token, isAuthenticated, hasRole } = useAuth();
  const { isChecking } = useRoleCheck({
    requiredRole: "tutor",
    requireApproval: false,
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Faculty / Department
  const [faculties, setFaculties] = useState<Faculty[]>(FALLBACK_FACULTIES);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    aboutCourse: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    duration: "0",
    durationMinutes: "0",
    facultyId: "",
    departmentId: "",
    year: "",
  });

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    title: "",
    type: "video" as "video" | "pdf" | "link",
    source: "upload" as "upload" | "youtube",
    file: null as File | null,
    videoUrl: "",
    resourceUrl: "",
    duration: "",
    isPreview: false,
  });
  const [youtubeRightsConfirmed, setYoutubeRightsConfirmed] = useState(false);
  const [youtubeDeclarationStatus, setYoutubeDeclarationStatus] =
    useState<YouTubeRightsDeclarationStatus | null>(null);
  const [youtubeDeclarationLoading, setYoutubeDeclarationLoading] = useState(true);
  const [youtubeDeclarationSubmitting, setYoutubeDeclarationSubmitting] = useState(false);
  const [youtubeSignature, setYoutubeSignature] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    fileName: string;
  } | null>(null);

  const MAX_VIDEO_UPLOAD_MB = Number(
    process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB || 5000,
  );

  // Fetch categories on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole("tutor")) {
      router.push("/");
      return;
    }

    fetchFaculties();
  }, [isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (!token) return;

    setYoutubeDeclarationLoading(true);
    youtubeRightsService
      .getStatus(token)
      .then(setYoutubeDeclarationStatus)
      .catch(() => setYoutubeDeclarationStatus(null))
      .finally(() => setYoutubeDeclarationLoading(false));
  }, [token]);

  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties?include=departments`);
      const data = await response.json();
      const list: Faculty[] = Array.isArray(data.data) ? data.data : (data.data?.faculties ?? []);
      if (data.success && list.length > 0) setFaculties(list);
    } catch {
      // initialized with FALLBACK_FACULTIES
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "facultyId") {
        updated.departmentId = "";
        const faculty = faculties.find((f) => f.id === parseInt(value));
        setDepartments(faculty?.departments ?? []);
      }
      return updated;
    });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        alert("Only JPEG and PNG images are allowed");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setThumbnailFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaterialFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type based on material type
      if (currentMaterial.type === "video") {
        if (!file.type.startsWith("video/")) {
          alert("Please select a valid video file");
          return;
        }
        if (file.size > MAX_VIDEO_UPLOAD_MB * 1024 * 1024) {
          alert(
            `Video file size must be less than ${MAX_VIDEO_UPLOAD_MB}MB (current server limit).`,
          );
          return;
        }
      }
      const detectedDuration = currentMaterial.type === "video"
        ? await readVideoDurationMinutes(file)
        : null;
      setCurrentMaterial((prev) => ({
        ...prev,
        file,
        // Keep an explicitly entered value, but fill it automatically for uploaded videos.
        duration: prev.duration || (detectedDuration ? String(detectedDuration) : ""),
      }));
    }
  };

  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentMaterial((prev) => ({ ...prev, [name]: value }));
  };

  const ensureYouTubeRightsDeclaration = async (requireVideoConfirmation = true) => {
    if (!youtubeDeclarationStatus) {
      alert("The YouTube rights declaration is unavailable. Please refresh and try again.");
      return false;
    }
    if (youtubeDeclarationStatus.hasDeclaration && !requireVideoConfirmation) return true;
    if (!youtubeRightsConfirmed) {
      alert("Please confirm the video ownership and rights declaration.");
      return false;
    }
    if (youtubeDeclarationStatus.hasDeclaration) return true;
    if (!youtubeSignature.trim()) {
      alert(`Type your full account name to sign: ${youtubeDeclarationStatus.expectedSignatoryName}`);
      return false;
    }

    setYoutubeDeclarationSubmitting(true);
    try {
      const declaration = await youtubeRightsService.sign(token!, youtubeSignature);
      setYoutubeDeclarationStatus((current) => current && ({
        ...current,
        hasDeclaration: true,
        declaration,
      }));
      setYoutubeSignature("");
      return true;
    } catch (declarationError) {
      alert(declarationError instanceof Error ? declarationError.message : "Unable to save the declaration.");
      return false;
    } finally {
      setYoutubeDeclarationSubmitting(false);
    }
  };

  const addMaterial = async () => {
    if (!currentMaterial.title) {
      alert("Please fill in a title");
      return;
    }

    if (currentMaterial.type === "link") {
      if (!isPublicResourceUrl(currentMaterial.resourceUrl)) {
        alert("Please enter a valid public http(s) support-material link.");
        return;
      }
    } else if (currentMaterial.type === "video" && currentMaterial.source === "youtube") {
      const url = currentMaterial.videoUrl.trim();
      if (!url || !isYouTubeUrl(url)) {
        alert("Please enter a valid YouTube link (youtube.com or youtu.be).");
        return;
      }
    } else if (!currentMaterial.file) {
      alert("Please fill in title and select a file");
      return;
    }

    if (currentMaterial.type === "video" &&
        !(await ensureYouTubeRightsDeclaration(currentMaterial.source === "youtube"))) return;

    const newMaterial: CourseMaterial = {
      id: Date.now().toString(),
      title: currentMaterial.title,
      type: currentMaterial.type,
      file: currentMaterial.source === "upload" ? currentMaterial.file ?? undefined : undefined,
      videoUrl:
        currentMaterial.type === "video" && currentMaterial.source === "youtube"
          ? currentMaterial.videoUrl.trim()
          : undefined,
      resourceUrl:
        currentMaterial.type === "link"
          ? currentMaterial.resourceUrl.trim()
          : undefined,
      duration: currentMaterial.duration
        ? parseInt(currentMaterial.duration)
        : undefined,
      isPreview: currentMaterial.isPreview,
    };

    setMaterials([...materials, newMaterial]);
    setCurrentMaterial({
      title: "",
      type: "video",
      source: "upload",
      file: null,
      videoUrl: "",
      resourceUrl: "",
      duration: "",
      isPreview: false,
    });
    setYoutubeRightsConfirmed(false);
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please login to create a course");
      return;
    }

    if (!thumbnailFile) {
      setError("Please upload a thumbnail image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.shortDescription);
      formDataToSend.append("shortDescription", formData.shortDescription);
      formDataToSend.append("aboutCourse", formData.aboutCourse || "");
      formDataToSend.append("price", "0");
      formDataToSend.append("level", formData.level);
      if (formData.facultyId) formDataToSend.append("facultyId", formData.facultyId);
      if (formData.departmentId) formDataToSend.append("departmentId", formData.departmentId);
      if (formData.year) formDataToSend.append("year", formData.year);
      formDataToSend.append("thumbnail", thumbnailFile);

      // Make API call with FormData
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCreatedCourseId(result.data.course.id);
        setStep(2);
      } else {
        setError(result.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Failed to create course:", error);
      setError("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CHUNK_SIZE = 512 * 1024; // 512 KB — stays well under nginx's default 1 MB body limit

  const uploadPdfWithProgress = (
    url: string,
    formData: FormData,
    authToken: string,
    onProgress: (percent: number) => void,
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          let msg = `Upload failed (${xhr.status})`;
          try { const b = JSON.parse(xhr.responseText); if (b?.message) msg = b.message; } catch {}
          reject(new Error(msg));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(formData);
    });

  const uploadVideoInChunks = async (
    courseId: string,
    material: CourseMaterial,
    materialIndex: number,
    authToken: string,
    onProgress: (percent: number) => void,
  ): Promise<void> => {
    const file = material.file!;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const fd = new FormData();
        fd.append("uploadId", uploadId);
        fd.append("chunkIndex", String(i));
        fd.append("chunk", chunk, file.name);

        try {
          const res = await fetch(`${API_BASE_URL}/courses/${courseId}/content/chunks`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: fd,
          });

          if (res.ok) { lastError = null; break; }

          const body = await res.json().catch(() => ({}));
          lastError = new Error(body?.message || `Chunk ${i + 1}/${totalChunks} failed (${res.status})`);
        } catch (e) {
          lastError = e instanceof Error ? e : new Error("Network error");
        }

        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }

      if (lastError) throw lastError;

      onProgress(Math.round(((i + 1) / totalChunks) * 95)); // reserve last 5% for assembly
    }

    // Finalize: assemble chunks server-side then upload to YouTube.
    // Send as JSON so express.json() can parse req.body (FormData needs multer which this route doesn't have).
    const completeRes = await fetch(`${API_BASE_URL}/courses/${courseId}/content/chunks/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uploadId,
        totalChunks,
        fileName: file.name,
        title: material.title,
        type: material.type,
        order: String(materialIndex),
        duration: material.duration ? String(material.duration) : undefined,
        isPreview: material.isPreview ? "true" : undefined,
      }),
    });

    if (!completeRes.ok) {
      const body = await completeRes.json().catch(() => ({}));
      throw new Error(body?.message || "Failed to finalize video upload.");
    }

    onProgress(100);
  };

  const addYouTubeLinkMaterial = async (
    courseId: string,
    material: CourseMaterial,
    materialIndex: number,
    authToken: string,
    onProgress: (percent: number) => void,
  ): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/content`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: material.title,
        type: "video",
        url: material.videoUrl,
        order: String(materialIndex),
        duration: material.duration ? String(material.duration) : undefined,
        isPreview: material.isPreview ? "true" : undefined,
        youtubeRightsConfirmed: true,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Failed to add YouTube video link.");
    }

    onProgress(100);
  };

  const addSupportLinkMaterial = async (
    courseId: string,
    material: CourseMaterial,
    materialIndex: number,
    authToken: string,
    onProgress: (percent: number) => void,
  ): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/content`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: material.title,
        type: "link",
        url: material.resourceUrl,
        order: String(materialIndex),
        isPreview: material.isPreview ? "true" : undefined,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Failed to add support-material link.");
    }
    onProgress(100);
  };

  const handleFinish = async () => {
    if (materials.length === 0) {
      const confirm = window.confirm(
        "You haven't added any materials. Do you want to add them later?",
      );
      if (confirm) router.push("/tutor/dashboard");
      return;
    }

    setLoading(true);
    setUploadProgress(null);

    try {
      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];

        setUploadProgress({
          current: i + 1,
          total: materials.length,
          percent: 0,
          fileName: material.file?.name ?? material.title,
        });

        const onProgress = (percent: number) =>
          setUploadProgress((prev) => prev ? { ...prev, percent } : null);

        if (material.type === "video" && material.file) {
          await uploadVideoInChunks(createdCourseId!, material, i, token!, onProgress);
        } else if (material.type === "video" && material.videoUrl) {
          await addYouTubeLinkMaterial(createdCourseId!, material, i, token!, onProgress);
        } else if (material.type === "link" && material.resourceUrl) {
          await addSupportLinkMaterial(createdCourseId!, material, i, token!, onProgress);
        } else {
          const materialFormData = new FormData();
          materialFormData.append("title", material.title);
          materialFormData.append("type", material.type);
          materialFormData.append("order", i.toString());
          if (material.duration) materialFormData.append("duration", material.duration.toString());
          if (material.isPreview) materialFormData.append("isPreview", "true");
          if (material.file) materialFormData.append("video", material.file);

          await uploadPdfWithProgress(
            `${API_BASE_URL}/courses/${createdCourseId}/content?type=pdf`,
            materialFormData,
            token!,
            onProgress,
          );
        }
      }

      setUploadProgress(null);
      alert("Course and materials created successfully!");
      router.push("/tutor/dashboard");
    } catch (error) {
      setUploadProgress(null);
      console.error("Failed to save materials:", error);
      alert(error instanceof Error ? error.message : "Course created but failed to save some materials");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Course
          </h1>
          <p className="text-gray-600">
            {step === 1
              ? "Step 1: Basic Information"
              : "Step 2: Add Course Materials"}
          </p>
        </div>

        <div className="mb-8 flex items-center">
          <div
            className={`flex items-center ${
              step >= 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Basic Info</span>
          </div>
          <div
            className={`flex-1 h-1 mx-4 ${
              step >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`flex items-center ${
              step >= 2 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Materials</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Complete Web Development Bootcamp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="shortDescription"
                    required
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description (shown on course listings)..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.shortDescription.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About Course{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    name="aboutCourse"
                    value={formData.aboutCourse}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed course information including lessons breakdown, learning points, difficulty level, requirements, etc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Faculty / Department / Year */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      name="facultyId"
                      value={formData.facultyId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">— Any Faculty —</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>{f.icon ? `${f.icon} ` : ""}{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      disabled={departments.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">— Any Department —</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Academic Year <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">— Any Year —</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  <span className="font-semibold">Course duration is automatic.</span>{" "}
                  It is calculated from video lessons when their duration is available. You do not need to enter a total manually.
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Thumbnail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleThumbnailChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload JPEG or PNG image. Max size: 5MB. Recommended:
                    1280x720 pixels
                  </p>
                  {thumbnailPreview && (
                    <div className="mt-4">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="max-w-md h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-between">
              <button
                type="button"
                onClick={() => router.push("/tutor/dashboard")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Next: Add Materials"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add Course Materials
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Material Type
                    </label>
                    <select
                      name="type"
                      value={currentMaterial.type}
                      onChange={handleMaterialChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="pdf">PDF Document</option>
                      <option value="link">Public Support Material</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={currentMaterial.title}
                      onChange={handleMaterialChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Introduction to React"
                    />
                  </div>
                </div>

                {currentMaterial.type === "video" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Video Source
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentMaterial((prev) => ({
                            ...prev,
                            source: "upload",
                            videoUrl: "",
                          }))
                        }
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                          currentMaterial.source === "upload"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        📤 Upload a video file
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentMaterial((prev) => ({
                            ...prev,
                            source: "youtube",
                            file: null,
                          }));
                          setYoutubeRightsConfirmed(false);
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                          currentMaterial.source === "youtube"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        🔗 Already on YouTube
                      </button>
                    </div>
                  </div>
                )}

                {(currentMaterial.type === "pdf" ||
                  (currentMaterial.type === "video" && currentMaterial.source === "upload")) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {currentMaterial.type === "video"
                        ? "Upload Video File"
                        : "Upload PDF File"}
                    </label>
                    <input
                      type="file"
                      accept={
                        currentMaterial.type === "video"
                          ? "video/*"
                          : "application/pdf"
                      }
                      onChange={handleMaterialFileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {currentMaterial.type === "video" && (
                      <p className="text-sm text-gray-500 mt-2">
                        🎥 Video is uploaded in small chunks then sent to YouTube as unlisted — no file size limit.
                      </p>
                    )}
                    {currentMaterial.type === "pdf" && (
                      <p className="text-sm text-gray-500 mt-2">
                        📄 PDF files will be stored securely on the server
                      </p>
                    )}
                    {currentMaterial.file && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Selected: {currentMaterial.file.name} (
                        {(currentMaterial.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}

                {currentMaterial.type === "video" &&
                  currentMaterial.source === "youtube" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          YouTube Video Link
                        </label>
                        <input
                          type="url"
                          name="videoUrl"
                          value={currentMaterial.videoUrl}
                          onChange={handleMaterialChange}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <YouTubeRightsDeclarationForm
                        status={youtubeDeclarationStatus}
                        isLoading={youtubeDeclarationLoading}
                        signature={youtubeSignature}
                        confirmed={youtubeRightsConfirmed}
                        onSignatureChange={setYoutubeSignature}
                        onConfirmedChange={setYoutubeRightsConfirmed}
                      />
                    </div>
                  )}

                {currentMaterial.type === "link" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Public Support Material Link
                    </label>
                    <input
                      type="url"
                      name="resourceUrl"
                      value={currentMaterial.resourceUrl}
                      onChange={handleMaterialChange}
                      placeholder="https://www.youtube.com/watch?v=... or another public resource"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      YouTube links play in UniHub. Other public links open in UniHub where embedding is allowed, with an open-link fallback.
                    </p>
                  </div>
                )}

                {currentMaterial.type === "video" && currentMaterial.source === "upload" && (
                  <YouTubeRightsDeclarationForm
                    mode="upload"
                    status={youtubeDeclarationStatus}
                    isLoading={youtubeDeclarationLoading}
                    signature={youtubeSignature}
                    confirmed={youtubeRightsConfirmed}
                    onSignatureChange={setYoutubeSignature}
                    onConfirmedChange={setYoutubeRightsConfirmed}
                  />
                )}

                {currentMaterial.type === "video" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      min="1"
                      value={currentMaterial.duration}
                      onChange={handleMaterialChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={currentMaterial.isPreview}
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        isPreview: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isPreview"
                    className="text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    🔓 Make this material FREE PREVIEW - Students can watch
                    without enrolling
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addMaterial}
                  disabled={youtubeDeclarationSubmitting}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {youtubeDeclarationSubmitting ? "Saving declaration…" : "+ Add Material"}
                </button>
              </div>
            </div>

            {materials.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Added Materials ({materials.length})
                </h3>
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="text-lg font-bold text-gray-400">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                material.type === "video"
                                  ? "bg-red-100 text-red-700"
                                  : material.type === "link"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {material.type === "video"
                                ? "📹 VIDEO"
                                : material.type === "link"
                                  ? "🔗 LINK"
                                  : "📄 PDF"}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {material.title}
                            </span>
                            {material.isPreview && (
                              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                                🔓 FREE PREVIEW
                              </span>
                            )}
                          </div>
                          {material.file && (
                            <p className="text-sm text-gray-500 mt-1">
                              File: {material.file.name} (
                              {(material.file.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
                            </p>
                          )}
                          {material.videoUrl && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              🔗 YouTube link: {material.videoUrl}
                            </p>
                          )}
                          {material.duration && (
                            <p className="text-sm text-gray-500 mt-1">
                              Duration: {material.duration} minutes
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeMaterial(material.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition ml-4 flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadProgress && (
              <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Uploading {uploadProgress.current} of {uploadProgress.total}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {uploadProgress.percent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {uploadProgress.fileName}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {uploadProgress.percent >= 95 && uploadProgress.percent < 100
                    ? "Sending to YouTube… this may take a moment."
                    : "Please keep this page open until all uploads finish."}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Basic Info
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? uploadProgress
                    ? `Uploading ${uploadProgress.current}/${uploadProgress.total}…`
                    : "Saving…"
                  : materials.length > 0
                    ? "Finish & Save All"
                    : "Skip Materials"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
