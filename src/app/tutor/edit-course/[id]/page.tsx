"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import { courseService } from "@/services/course.service";
import { Modal } from "@/components/ui/Modal";
import YouTubeRightsDeclarationForm from "@/components/tutor/YouTubeRightsDeclarationForm";
import { FALLBACK_FACULTIES, type Faculty, type Department } from "@/services/faculty.service";
import {
  youtubeRightsService,
  type YouTubeRightsDeclarationStatus,
} from "@/services/youtube-rights.service";

interface CourseMaterial {
  id: string;
  title: string;
  type: "video" | "pdf";
  url?: string;
  file?: File;
  videoUrl?: string;
  duration?: number | null;
  order?: number;
  isPreview?: boolean;
  youtubeVideoId?: string | null;
  youtubeRightsDeclarationId?: number | null;
  persisted?: boolean;
  pendingUpload?: boolean;
}

const isYouTubeUrl = (url: string) =>
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(
    url.trim(),
  );

const mapContentToMaterial = (content: any): CourseMaterial => ({
  id: String(content.id),
  title: content.title,
  type: content.type,
  url: content.url,
  duration: content.duration,
  order: content.order,
  isPreview: Boolean(content.isPreview),
  youtubeVideoId: content.youtubeVideoId ?? null,
  youtubeRightsDeclarationId: content.youtubeRightsDeclarationId ?? null,
  persisted: true,
  pendingUpload: false,
});

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated, hasRole } = useAuth();
  const courseId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "materials">(
    "details",
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    aboutCourse: "",
    level: "beginner",
    duration: "0",
    durationMinutes: "0",
    facultyId: "",
    departmentId: "",
    year: "",
  });

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    title: "",
    type: "video" as "video" | "pdf",
    source: "upload" as "upload" | "youtube",
    file: null as File | null,
    videoUrl: "",
    duration: "",
    order: "",
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
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<CourseMaterial | null>(null);
  const [materialActionLoading, setMaterialActionLoading] = useState(false);
  const [materialFeedback, setMaterialFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState({
    title: "",
    duration: "",
    order: "",
    isPreview: false,
    videoUrl: "",
  });
  const [editYoutubeRightsConfirmed, setEditYoutubeRightsConfirmed] = useState(false);
  const [editYoutubeSignature, setEditYoutubeSignature] = useState("");
  const MAX_VIDEO_UPLOAD_MB = Number(
    process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB || 5000,
  );
  const CHUNK_SIZE = 512 * 1024;

  const [faculties, setFaculties] = useState<Faculty[]>(FALLBACK_FACULTIES);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole("tutor")) {
      router.push("/");
      return;
    }

    if (courseId && token) {
      loadCourse();
    }
    fetchFaculties();
  }, [courseId, token, isAuthenticated, hasRole, router]);

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
      const res = await fetch(`${API_BASE_URL}/faculties?include=departments`);
      const data = await res.json();
      const list: Faculty[] = Array.isArray(data.data) ? data.data : (data.data?.faculties ?? []);
      if (data.success && list.length > 0) setFaculties(list);
    } catch { /* initialized with FALLBACK_FACULTIES */ }
  };

  const loadCourse = async () => {
    if (!token || !courseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await courseService.getCourseById(courseId);

      if (response.success && response.data) {
        const course = response.data.course || response.data;

        setFormData({
          title: course.title || "",
          shortDescription: course.shortDescription || "",
          description: course.description || "",
          aboutCourse: course.aboutCourse || "",
          level: course.level || "beginner",
          duration: course.duration != null ? course.duration.toString() : "0",
          durationMinutes: course.durationMinutes != null ? course.durationMinutes.toString() : "0",
          facultyId: course.facultyId != null ? course.facultyId.toString() : "",
          departmentId: course.departmentId != null ? course.departmentId.toString() : "",
          year: course.year != null ? course.year.toString() : "",
        });
        setCurrentThumbnail(course.thumbnail || null);
        if (course.facultyId) {
          const faculty = FALLBACK_FACULTIES.find(f => f.id === course.facultyId);
          setDepartments(faculty?.departments ?? []);
        }

        // Load course materials/content
        loadCourseMaterials();
      } else {
        setError("Course not found");
      }
    } catch (error) {
      console.error("Failed to load course:", error);
      setError("Failed to load course");
    } finally {
      setLoading(false);
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
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPEG or PNG)");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Thumbnail file size should not exceed 5MB");
        return;
      }

      setThumbnailFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const loadCourseMaterials = async () => {
    if (!token || !courseId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMaterials(
            data.data.contents.map(mapContentToMaterial),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load materials:", error);
    }
  };

  const handleMaterialChange = (field: string, value: any) => {
    setCurrentMaterial((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    if (currentMaterial.type === "pdf" && file.size > 10 * 1024 * 1024) {
      alert("PDF file size must be less than 10MB");
      return;
    }

    setCurrentMaterial((prev) => ({ ...prev, file }));
  };

  const ensureYouTubeRightsDeclaration = async (
    confirmed = youtubeRightsConfirmed,
    signature = youtubeSignature,
    clearSignature: () => void = () => setYoutubeSignature(""),
    requireVideoConfirmation = true,
  ) => {
    if (!youtubeDeclarationStatus) {
      alert("The YouTube rights declaration is unavailable. Please refresh and try again.");
      return false;
    }
    if (youtubeDeclarationStatus.hasDeclaration && !requireVideoConfirmation) return true;
    if (!confirmed) {
      alert("Please confirm the video ownership and rights declaration.");
      return false;
    }
    if (youtubeDeclarationStatus.hasDeclaration) return true;
    if (!signature.trim()) {
      alert(`Type your full account name to sign: ${youtubeDeclarationStatus.expectedSignatoryName}`);
      return false;
    }

    setYoutubeDeclarationSubmitting(true);
    try {
      const declaration = await youtubeRightsService.sign(token!, signature);
      setYoutubeDeclarationStatus((current) => current && ({
        ...current,
        hasDeclaration: true,
        declaration,
      }));
      clearSignature();
      return true;
    } catch (declarationError) {
      alert(declarationError instanceof Error ? declarationError.message : "Unable to save the declaration.");
      return false;
    } finally {
      setYoutubeDeclarationSubmitting(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!currentMaterial.title) {
      alert("Please provide a title for the material");
      return;
    }

    if (currentMaterial.type === "video" && currentMaterial.source === "youtube") {
      const url = currentMaterial.videoUrl.trim();
      if (!url || !isYouTubeUrl(url)) {
        alert("Please enter a valid YouTube link (youtube.com or youtu.be).");
        return;
      }
    } else if (!currentMaterial.file) {
      alert("Please provide a title and file for the material");
      return;
    }

    if (!currentMaterial.order) {
      alert("Please provide a display order for the material");
      return;
    }

    if (currentMaterial.type === "video" && !(await ensureYouTubeRightsDeclaration(
      youtubeRightsConfirmed, youtubeSignature, () => setYoutubeSignature(""), currentMaterial.source === "youtube",
    ))) return;

    const newMaterial: CourseMaterial = {
      id: Date.now().toString(),
      title: currentMaterial.title,
      type: currentMaterial.type,
      file: currentMaterial.source === "upload" ? currentMaterial.file ?? undefined : undefined,
      videoUrl:
        currentMaterial.type === "video" && currentMaterial.source === "youtube"
          ? currentMaterial.videoUrl.trim()
          : undefined,
      duration: currentMaterial.duration
        ? parseInt(currentMaterial.duration)
        : undefined,
      order: parseInt(currentMaterial.order),
      pendingUpload: true,
    };

    setMaterials([...materials, newMaterial]);
    setCurrentMaterial({
      title: "",
      type: "video",
      source: "upload",
      file: null,
      videoUrl: "",
      duration: "",
      order: "",
    });
    setYoutubeRightsConfirmed(false);
  };

  const openMaterialEditor = (material: CourseMaterial) => {
    setEditingMaterial(material);
    setEditMaterialForm({
      title: material.title,
      duration: material.duration != null ? String(material.duration) : "",
      order: material.order != null ? String(material.order) : "0",
      isPreview: Boolean(material.isPreview),
      videoUrl: material.type === "video" ? material.url || material.videoUrl || "" : "",
    });
    setEditYoutubeRightsConfirmed(false);
    setEditYoutubeSignature("");
    setMaterialFeedback(null);
  };

  const closeMaterialEditor = () => {
    if (materialActionLoading) return;
    setEditingMaterial(null);
    setEditYoutubeRightsConfirmed(false);
    setEditYoutubeSignature("");
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial || !token) return;

    const title = editMaterialForm.title.trim();
    const order = Number(editMaterialForm.order);
    const duration = editMaterialForm.duration.trim()
      ? Number(editMaterialForm.duration)
      : null;

    if (!title) {
      setMaterialFeedback({ type: "error", message: "Material title is required." });
      return;
    }
    if (!Number.isInteger(order) || order < 0) {
      setMaterialFeedback({
        type: "error",
        message: "Display order must be zero or a positive whole number.",
      });
      return;
    }
    if (duration !== null && (!Number.isInteger(duration) || duration <= 0)) {
      setMaterialFeedback({
        type: "error",
        message: "Duration must be a positive whole number of minutes.",
      });
      return;
    }

    const nextVideoUrl = editMaterialForm.videoUrl.trim();
    const currentVideoUrl = (editingMaterial.url || editingMaterial.videoUrl || "").trim();
    const videoUrlChanged =
      editingMaterial.type === "video" && nextVideoUrl !== currentVideoUrl;

    if (videoUrlChanged) {
      if (!nextVideoUrl || !isYouTubeUrl(nextVideoUrl)) {
        setMaterialFeedback({
          type: "error",
          message: "Please enter a valid YouTube link before saving.",
        });
        return;
      }
      if (
        !(await ensureYouTubeRightsDeclaration(
          editYoutubeRightsConfirmed,
          editYoutubeSignature,
          () => setEditYoutubeSignature(""),
        ))
      ) {
        return;
      }
    }

    setMaterialActionLoading(true);
    setMaterialFeedback(null);
    try {
      if (!editingMaterial.persisted) {
        setMaterials((current) =>
          current.map((material) =>
            material.id === editingMaterial.id
              ? {
                  ...material,
                  title,
                  duration,
                  order,
                  isPreview: editMaterialForm.isPreview,
                  videoUrl: videoUrlChanged ? nextVideoUrl : material.videoUrl,
                }
              : material,
          ),
        );
      } else {
        const response = await fetch(
          `${API_BASE_URL}/content/${editingMaterial.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              duration,
              order,
              isPreview: editMaterialForm.isPreview,
              ...(videoUrlChanged
                ? { url: nextVideoUrl, youtubeRightsConfirmed: true }
                : {}),
            }),
          },
        );
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.message || "Unable to update the material.");
        }
        const updated = mapContentToMaterial(body.data.content);
        setMaterials((current) =>
          current.map((material) =>
            material.id === editingMaterial.id ? updated : material,
          ),
        );
      }

      setEditingMaterial(null);
      setMaterialFeedback({
        type: "success",
        message: `“${title}” was updated successfully.`,
      });
    } catch (updateError) {
      setMaterialFeedback({
        type: "error",
        message:
          updateError instanceof Error
            ? updateError.message
            : "Unable to update the material.",
      });
    } finally {
      setMaterialActionLoading(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!materialToDelete || !token) return;

    setMaterialActionLoading(true);
    setMaterialFeedback(null);
    try {
      if (materialToDelete.persisted) {
        const response = await fetch(
          `${API_BASE_URL}/content/${materialToDelete.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.message || "Unable to delete the material.");
        }
      }

      setMaterials((current) =>
        current.filter((material) => material.id !== materialToDelete.id),
      );
      setMaterialFeedback({
        type: "success",
        message: `“${materialToDelete.title}” was deleted successfully.`,
      });
      setMaterialToDelete(null);
    } catch (deleteError) {
      setMaterialFeedback({
        type: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete the material.",
      });
    } finally {
      setMaterialActionLoading(false);
    }
  };

  const uploadVideoInChunks = async (
    material: CourseMaterial,
    materialIndex: number,
    onProgress: (percent: number) => void,
  ) => {
    const file = material.file;
    if (!file || !courseId || !token) {
      throw new Error("Video upload could not be started. Please sign in and try again.");
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
      const start = chunkIndex * CHUNK_SIZE;
      const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const formData = new FormData();
        formData.append("uploadId", uploadId);
        formData.append("chunkIndex", String(chunkIndex));
        formData.append("chunk", chunk, file.name);

        try {
          const response = await fetch(
            `${API_BASE_URL}/courses/${courseId}/content/chunks`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );

          if (response.ok) {
            lastError = null;
            break;
          }

          const body = await response.json().catch(() => ({}));
          lastError = new Error(
            body?.message || `Video chunk ${chunkIndex + 1}/${totalChunks} failed (${response.status}).`,
          );
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Network error while uploading video.");
        }

        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        }
      }

      if (lastError) throw lastError;
      // Reserve the final 5% for the server to assemble and send the video to YouTube.
      onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 95));
    }

    const completeResponse = await fetch(
      `${API_BASE_URL}/courses/${courseId}/content/chunks/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId,
          totalChunks,
          fileName: file.name,
          title: material.title,
          type: material.type,
          order: String(material.order ?? materialIndex),
          duration: material.duration ? String(material.duration) : undefined,
          isPreview: material.isPreview ? "true" : undefined,
        }),
      },
    );

    if (!completeResponse.ok) {
      const body = await completeResponse.json().catch(() => ({}));
      throw new Error(body?.message || "Failed to send the video to YouTube.");
    }

    onProgress(100);
  };

  const handleSaveMaterials = async () => {
    if (!token || !courseId) return;

    const pendingMaterials = materials.filter((material) => material.pendingUpload);
    setSubmitting(true);
    setUploadProgress(null);
    try {
      for (const [materialIndex, material] of pendingMaterials.entries()) {
        setUploadProgress({
          current: materialIndex + 1,
          total: pendingMaterials.length,
          percent: 0,
          fileName: material.file?.name ?? material.title,
        });
        const onProgress = (percent: number) =>
          setUploadProgress((current) =>
            current ? { ...current, percent } : null,
          );

        if (material.type === "video" && material.file) {
          await uploadVideoInChunks(material, materialIndex, onProgress);
          continue;
        }

        if (material.videoUrl) {
          const linkResponse = await fetch(
            `${API_BASE_URL}/courses/${courseId}/content`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: material.title,
                type: "video",
                url: material.videoUrl,
                order: material.order ?? materialIndex,
                duration: material.duration,
                isPreview: Boolean(material.isPreview),
                youtubeRightsConfirmed: true,
              }),
            },
          );

          if (!linkResponse.ok) {
            const body = await linkResponse.json().catch(() => ({}));
            throw new Error(
              body?.message || `Failed to add YouTube link "${material.title}"`,
            );
          }
          onProgress(100);
          continue;
        }

        if (!material.file) continue;

        const materialFormData = new FormData();
        materialFormData.append("title", material.title);
        materialFormData.append("type", material.type);
        materialFormData.append(
          "order",
          String(material.order ?? materialIndex),
        );

        materialFormData.append("isPreview", String(Boolean(material.isPreview)));

        if (material.duration) {
          materialFormData.append("duration", material.duration.toString());
        }

        materialFormData.append("video", material.file);

        const uploadResponse = await fetch(
          `${API_BASE_URL}/courses/${courseId}/content?type=${encodeURIComponent(material.type)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: materialFormData,
          },
        );

        if (!uploadResponse.ok) {
          let errorMessage = `Failed to upload material "${material.title}"`;
          try {
            const errorData = await uploadResponse.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
          } catch {
            if (uploadResponse.status === 413) {
              errorMessage = `Upload too large. Keep video files under ${MAX_VIDEO_UPLOAD_MB}MB.`;
            }
          }
          throw new Error(errorMessage);
        }
        onProgress(100);
      }

      setMaterials((current) =>
        current.map((material) => ({ ...material, pendingUpload: false })),
      );
      alert("Materials saved successfully!");
      await loadCourseMaterials();
    } catch (error) {
      console.error("Failed to save materials:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save some materials";
      alert(message);
    } finally {
      setUploadProgress(null);
      setSubmitting(false);
    }
  };

  const pendingMaterialCount = materials.filter(
    (material) => material.pendingUpload,
  ).length;
  const hasUnsavedMaterials = pendingMaterialCount > 0;
  const editingVideoSourceChanged = Boolean(
    editingMaterial?.type === "video" &&
      editMaterialForm.videoUrl.trim() !==
        (editingMaterial.url || editingMaterial.videoUrl || "").trim(),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !courseId) return;

    const hours = Number(formData.duration);
    const minutes = Number(formData.durationMinutes);
    if (!Number.isInteger(hours) || hours < 0 || !Number.isInteger(minutes) || minutes < 0 || minutes > 59 || (hours === 0 && minutes === 0)) {
      setError("Enter a duration of at least one minute. Minutes must be between 0 and 59.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("shortDescription", formData.shortDescription);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("aboutCourse", formData.aboutCourse);
      formDataToSend.append("price", "0");
      formDataToSend.append("level", formData.level);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("durationMinutes", formData.durationMinutes);
      formDataToSend.append("facultyId", formData.facultyId || "");
      formDataToSend.append("departmentId", formData.departmentId || "");
      formDataToSend.append("year", formData.year || "");

      // Add thumbnail file if selected
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      // Use fetch directly for multipart/form-data
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        alert("Course updated successfully!");
        router.push("/tutor/dashboard");
      } else {
        setError(result.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Failed to update course:", error);
      setError("Failed to update course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-xl">Loading course...</div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="container-custom py-8 max-w-4xl">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Course</h1>
        <p className="text-gray-600">
          Update your course details and materials
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === "details"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Course Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === "materials"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Course Materials
          {materials.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {materials.length}
            </span>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Details Tab */}
        {activeTab === "details" && (
          <>
            {/* Basic Information */}
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
                    maxLength={500}
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A brief summary for the course card (max 500 characters)"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {formData.shortDescription.length}/500
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About Course
                  </label>
                  <textarea
                    name="aboutCourse"
                    value={formData.aboutCourse}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed information, syllabus, learning points, etc."
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
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Duration
              </h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total course duration <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="courseDurationHours" className="block text-sm text-gray-600 mb-1">Hours</label>
                    <input
                      id="courseDurationHours"
                      type="number"
                      name="duration"
                      required
                      min="0"
                      step="1"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="courseDurationMinutes" className="block text-sm text-gray-600 mb-1">Minutes</label>
                    <input
                      id="courseDurationMinutes"
                      type="number"
                      name="durationMinutes"
                      required
                      min="0"
                      max="59"
                      step="1"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Thumbnail
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Thumbnail{" "}
                  {!currentThumbnail && <span className="text-red-500">*</span>}
                </label>

                {/* Current thumbnail display */}
                {(currentThumbnail || thumbnailPreview) && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {thumbnailPreview
                        ? "New thumbnail preview:"
                        : "Current thumbnail:"}
                    </p>
                    <img
                      src={
                        thumbnailPreview ||
                        (currentThumbnail?.startsWith("http")
                          ? currentThumbnail
                          : `${BACKEND_URL}${currentThumbnail}`)
                      }
                      alt="Course thumbnail"
                      className="max-w-md h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleThumbnailChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload JPEG or PNG image. Max size: 5MB. Recommended: 1280x720
                  pixels
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-wrap gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => router.push("/tutor/dashboard")}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Course"
                )}
              </button>
            </div>
          </>
        )}

        {/* Course Materials Tab */}
        {activeTab === "materials" && (
          <div className="space-y-6">
            {materialFeedback && (
              <div
                role="status"
                className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                  materialFeedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {materialFeedback.message}
              </div>
            )}

            {/* Existing Materials */}
            {materials.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Existing Materials
                </h2>
                <div className="space-y-4">
                  {materials.map((material, index) => (
                    <div
                      key={material.id || index}
                      className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {material.type === "video" ? (
                            <svg
                              className="w-10 h-10 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-10 h-10 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {material.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500 capitalize">
                              {material.type}
                            </span>
                            {material.duration && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">
                                  {material.duration} min
                                </span>
                              </>
                            )}
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              Order: {material.order}
                            </span>
                            {material.isPreview && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  Free preview
                                </span>
                              </>
                            )}
                            {material.videoUrl && !material.url && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm font-semibold text-amber-600">
                                  🔗 YouTube link (not yet saved)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => openMaterialEditor(material)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                          title="Edit material details"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMaterialFeedback(null);
                            setMaterialToDelete(material);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete material"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Material */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Material
              </h2>

              <div className="space-y-6">
                {/* Material Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material Title *
                  </label>
                  <input
                    type="text"
                    value={currentMaterial.title}
                    onChange={(e) =>
                      handleMaterialChange("title", e.target.value)
                    }
                    placeholder="e.g., Introduction to React Hooks"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material Type *
                  </label>
                  <select
                    value={currentMaterial.type}
                    onChange={(e) =>
                      handleMaterialChange(
                        "type",
                        e.target.value as "video" | "pdf",
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF Document</option>
                  </select>
                </div>

                {/* Video Source Toggle */}
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

                {/* File Upload */}
                {(currentMaterial.type === "pdf" ||
                  currentMaterial.source === "upload") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload File *
                    </label>
                    <input
                      type="file"
                      accept={
                        currentMaterial.type === "video"
                          ? "video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv"
                          : "application/pdf"
                      }
                      onChange={handleMaterialFileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {currentMaterial.type === "video"
                        ? `Accepted formats: MP4, MOV, AVI, WMV. Max size: ${MAX_VIDEO_UPLOAD_MB}MB`
                        : "Accepted format: PDF. Max size: 10MB"}
                    </p>
                  </div>
                )}

                {/* YouTube Link */}
                {currentMaterial.type === "video" &&
                  currentMaterial.source === "youtube" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          YouTube Video Link *
                        </label>
                        <input
                          type="url"
                          value={currentMaterial.videoUrl}
                          onChange={(e) =>
                            handleMaterialChange("videoUrl", e.target.value)
                          }
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

                {/* Duration (for videos) */}
                {currentMaterial.type === "video" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentMaterial.duration || ""}
                      onChange={(e) =>
                        handleMaterialChange("duration", e.target.value)
                      }
                      placeholder="e.g., 15"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    value={currentMaterial.order || ""}
                    onChange={(e) =>
                      handleMaterialChange("order", e.target.value)
                    }
                    placeholder="e.g., 1"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Materials will be displayed in this order in the course
                  </p>
                </div>

                {/* Add Material Button */}
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  disabled={youtubeDeclarationSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {youtubeDeclarationSubmitting ? "Saving declaration…" : "Add to Materials List"}
                </button>
              </div>
            </div>

            {uploadProgress && (
              <div className="rounded-xl border-2 border-blue-200 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Uploading {uploadProgress.current} of {uploadProgress.total}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {uploadProgress.percent}%
                  </span>
                </div>
                <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
                <p className="truncate text-xs text-gray-500">{uploadProgress.fileName}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {uploadProgress.percent >= 95 && uploadProgress.percent < 100
                    ? "Sending to YouTube. This may take a moment."
                    : "Keep this page open until the upload finishes."}
                </p>
              </div>
            )}

            {/* Save Materials Button */}
            <div className="flex flex-wrap gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleSaveMaterials}
                disabled={!hasUnsavedMaterials || submitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? uploadProgress
                    ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                    : "Preparing upload..."
                  : "Save Materials"}
              </button>
            </div>
            <p
              className={`text-right text-sm ${
                pendingMaterialCount > 0
                  ? "font-medium text-amber-700"
                  : "text-gray-500"
              }`}
            >
              {pendingMaterialCount > 0
                ? `${pendingMaterialCount} material${pendingMaterialCount === 1 ? "" : "s"} ready to upload.`
                : "Add a file or YouTube link to the materials list to enable saving."}
            </p>
          </div>
        )}
      </form>

      <Modal
        isOpen={Boolean(editingMaterial)}
        onClose={closeMaterialEditor}
        title="Edit Material Details"
        size="lg"
      >
        {editingMaterial && (
          <div className="space-y-5">
            {materialFeedback?.type === "error" && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {materialFeedback.message}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold capitalize text-gray-700">
                {editingMaterial.type}
              </span>
              <span>
                Edit the lesson information shown to students.
              </span>
            </div>

            <div>
              <label
                htmlFor="editMaterialTitle"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Material Title *
              </label>
              <input
                id="editMaterialTitle"
                type="text"
                maxLength={255}
                value={editMaterialForm.title}
                onChange={(event) =>
                  setEditMaterialForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {editingMaterial.type === "video" && (
                <div>
                  <label
                    htmlFor="editMaterialDuration"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Duration (minutes)
                  </label>
                  <input
                    id="editMaterialDuration"
                    type="number"
                    min="1"
                    step="1"
                    value={editMaterialForm.duration}
                    onChange={(event) =>
                      setEditMaterialForm((current) => ({
                        ...current,
                        duration: event.target.value,
                      }))
                    }
                    placeholder="e.g., 15"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="editMaterialOrder"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Display Order *
                </label>
                <input
                  id="editMaterialOrder"
                  type="number"
                  min="0"
                  step="1"
                  value={editMaterialForm.order}
                  onChange={(event) =>
                    setEditMaterialForm((current) => ({
                      ...current,
                      order: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={editMaterialForm.isPreview}
                onChange={(event) =>
                  setEditMaterialForm((current) => ({
                    ...current,
                    isPreview: event.target.checked,
                  }))
                }
                className="mt-0.5 h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Allow free preview
                </span>
                <span className="mt-1 block text-sm text-gray-600">
                  Anyone can open this material without enrolling in the course.
                </span>
              </span>
            </label>

            {editingMaterial.type === "video" ? (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="editMaterialVideoUrl"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    YouTube Video URL
                  </label>
                  <input
                    id="editMaterialVideoUrl"
                    type="url"
                    value={editMaterialForm.videoUrl}
                    onChange={(event) => {
                      setEditMaterialForm((current) => ({
                        ...current,
                        videoUrl: event.target.value,
                      }));
                      setEditYoutubeRightsConfirmed(false);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Change this only to replace the video source. A replacement
                    must be a valid YouTube video covered by your rights declaration.
                  </p>
                </div>

                {editingVideoSourceChanged && (
                  <YouTubeRightsDeclarationForm
                    idPrefix="editYoutubeRights"
                    status={youtubeDeclarationStatus}
                    isLoading={youtubeDeclarationLoading}
                    signature={editYoutubeSignature}
                    confirmed={editYoutubeRightsConfirmed}
                    onSignatureChange={setEditYoutubeSignature}
                    onConfirmedChange={setEditYoutubeRightsConfirmed}
                  />
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">PDF file replacement</p>
                <p className="mt-1 leading-6">
                  To replace the PDF file, delete this material and add the new
                  file below. Its title, order, and preview access can be edited here.
                </p>
                {editingMaterial.url && (
                  <a
                    href={editingMaterial.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-semibold underline"
                  >
                    Open current PDF
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
              <button
                type="button"
                onClick={closeMaterialEditor}
                disabled={materialActionLoading}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateMaterial}
                disabled={materialActionLoading || youtubeDeclarationSubmitting}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {materialActionLoading || youtubeDeclarationSubmitting
                  ? "Saving…"
                  : "Save Material"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(materialToDelete)}
        onClose={() => {
          if (!materialActionLoading) setMaterialToDelete(null);
        }}
        title="Delete Material?"
        size="sm"
      >
        {materialToDelete && (
          <div className="space-y-5">
            {materialFeedback?.type === "error" && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {materialFeedback.message}
              </div>
            )}
            <p className="leading-6 text-gray-700">
              Delete <strong>“{materialToDelete.title}”</strong> from this course?
              Students will no longer be able to access it. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
                disabled={materialActionLoading}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMaterial}
                disabled={materialActionLoading}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {materialActionLoading ? "Deleting…" : "Delete Material"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
