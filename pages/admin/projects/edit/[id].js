import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../../components/Admin/AdminLayout/AdminLayout";
import ProjectForm from "../../../../components/Admin/ProjectForm/ProjectForm";
import Project1 from "../../../../components/Projects/Project1";
import dbConnect from "../../../../lib/mongoose";
import Project from "../../../../models/Project";

import { useState, useEffect } from "react";

export default function EditProjectPage({ project, previewSecret }) {
  const router = useRouter();
  const [previewData, setPreviewData] = useState(project);

  const handleSave = async (data) => {
    const response = await fetch(`/api/projects/${project._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success("Project updated successfully!");
      router.push("/admin/projects");
    } else {
      toast.error("Failed to update project");
    }
  };

  const handlePreview = () => {
    window.open(
      `/api/preview?secret=${previewSecret}&type=project&id=${project._id}`,
      "_blank",
    );
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      const res = await fetch(`/api/projects/${project._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete project");
      toast.success("Project deleted");
      router.push("/admin/projects");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout title={`Edit: ${project.title}`}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>Edit Project</h1>
        <button
          onClick={handleDelete}
          style={{
            border: "1px solid #ef4444",
            color: "#ef4444",
            padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          Delete
        </button>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}
      >
        <div>
          <ProjectForm
            project={project}
            onSave={handleSave}
            onPreview={handlePreview}
            onDataChange={setPreviewData}
          />
        </div>
        <div>
          <h3>Live Preview</h3>
          <div style={{ transform: "scale(0.9)", transformOrigin: "top left" }}>
            <Project1 projectOverride={previewData} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }) {
  await dbConnect();

  const project = await Project.findById(params.id);

  if (!project) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project: JSON.parse(JSON.stringify(project)),
      previewSecret: process.env.PREVIEW_SECRET || null,
    },
  };
}
