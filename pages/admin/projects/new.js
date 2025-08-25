import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import ProjectForm from "../../../components/Admin/ProjectForm/ProjectForm";
import Project1 from "../../../components/Projects/Project1";
import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "./projects.common.module.css";
import lightStyles from "./projects.light.module.css";
import darkStyles from "./projects.dark.module.css";

export default function NewProjectPage() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  const handleSave = async (data) => {
    setErrors({});
    setIsSubmitting(true);
    const toastId = toast.loading("Creating project...");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Project created successfully!", { id: toastId });
        router.push("/admin/projects");
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400 && errorData.errors) {
          const formattedErrors = {};
          for (const err of errorData.errors) {
            const path = Array.isArray(err.path) ? err.path[0] : err.path;
            if (path) formattedErrors[path] = err.message;
          }
          setErrors(formattedErrors);
          toast.error("Please fix the errors below.", { id: toastId });
        } else {
          setErrors({ form: errorData.message || "An unknown error occurred." });
          toast.error(errorData.message || "Failed to create project", { id: toastId });
        }
      }
    } catch (e) {
      toast.error(e.message || "Failed to create project", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="New Project">
      <h1>Create New Project</h1>
      <div className={commonStyles.twoCol}>
        <div>
          <ProjectForm
            onSave={handleSave}
            serverErrors={errors}
            isSubmitting={isSubmitting}
            onDataChange={setPreviewData}
          />
        </div>
        <div>
          <h3 className={themeStyles.previewTitle}>Live Preview</h3>
          <div className={commonStyles.previewScale}>
            <Project1 projectOverride={previewData} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
