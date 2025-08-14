import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../../components/Admin/AdminLayout/AdminLayout";
import ProjectForm from "../../../../components/Admin/ProjectForm/ProjectForm";
import Project1 from "../../../../components/Projects/Project1";
import dbConnect from "../../../../lib/mongoose";
import Project from "../../../../models/Project";
import mongoose from "mongoose";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../../context/ThemeContext";
import Modal from "../../../../components/Admin/Modal/Modal";
import commonStyles from "../projects.common.module.css";
import lightStyles from "../projects.light.module.css";
import darkStyles from "../projects.dark.module.css";
import utilities from "../../../../styles/utilities.module.css";

export default function EditProjectPage({ project, previewSecret }) {
  const router = useRouter();
  const [previewData, setPreviewData] = useState(project);
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const [showDelete, setShowDelete] = useState(false);
  const confirmRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleSave = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating project...");
    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Project updated successfully!", { id: toastId });
        router.push("/admin/projects");
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Map server-side validation errors to form fields for inline display
        if (Array.isArray(errorData.errors)) {
          const mapped = {};
          for (const err of errorData.errors) {
            const key = Array.isArray(err.path) ? err.path.join(".") : String(err.path || "");
            if (key) mapped[key] = err.message || "Invalid value";
          }
          setServerErrors(mapped);
        } else {
          setServerErrors({});
        }
        const firstMsg = Array.isArray(errorData.errors) && errorData.errors[0]?.message;
        toast.error(firstMsg || errorData.message || "Failed to update project", { id: toastId });
      }
    } catch (e) {
      toast.error(e.message || "Failed to update project", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    window.open(
      `/api/preview?secret=${previewSecret}&type=project&id=${project._id}`,
      "_blank",
    );
  };

  const doDelete = async () => {
    try {
      const res = await fetch(`/api/projects/${project._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete project");
      toast.success("Project deleted");
      router.push("/admin/projects");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <AdminLayout title={`Edit: ${project.title}`}>
      <div className={commonStyles.headerRow}>
        <h1>Edit Project</h1>
        <button
          onClick={() => setShowDelete(true)}
          className={`${utilities.btn} ${utilities.btnDanger}`}
        >
          Delete
        </button>
      </div>
      <div className={commonStyles.twoCol}>
        <div>
          <ProjectForm
            project={project}
            onSave={handleSave}
            onPreview={handlePreview}
            onDataChange={setPreviewData}
            isSubmitting={isSubmitting}
            serverErrors={serverErrors}
          />
        </div>
        <div>
          <h3 className={themeStyles.previewTitle}>Live Preview</h3>
          <div className={commonStyles.previewScale}>
            <Project1 projectOverride={previewData} />
          </div>
        </div>
      </div>
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Project"
        initialFocusRef={confirmRef}
        onConfirm={doDelete}
        confirmText="Delete"
        cancelText="Cancel"
      >
        <p id="delete-project-desc">
          This action will permanently delete this project and cannot be undone.
        </p>
      </Modal>
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }) {
  await dbConnect();

  let project = null;
  const idOrSlug = params.id;
  if (mongoose.isValidObjectId(idOrSlug)) {
    project = await Project.findById(idOrSlug);
  }
  if (!project) {
    project = await Project.findOne({ slug: idOrSlug });
  }

  if (!project) {
    return {
      redirect: {
        destination: "/admin/projects?error=notfound",
        permanent: false,
      },
    };
  }

  return {
    props: {
      project: JSON.parse(JSON.stringify(project)),
      previewSecret: process.env.PREVIEW_SECRET || null,
    },
  };
}
