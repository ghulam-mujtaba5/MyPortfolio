import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../../components/Admin/AdminLayout/AdminLayout';
import ProjectForm from '../../../../components/Admin/ProjectForm/ProjectForm';
import Project1 from '../../../../components/Projects/Project1';
import dbConnect from '../../../../lib/mongoose';
import Project from '../../../../models/Project';

import { useState, useEffect } from 'react';

export default function EditProjectPage({ project, previewSecret }) {
    const router = useRouter();
  const [previewData, setPreviewData] = useState(project);

  const handleSave = async (data) => {
    const response = await fetch(`/api/projects/${project._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Project updated successfully!');
      router.push('/admin/projects');
    } else {
      toast.error('Failed to update project');
    }
  };

  const handlePreview = () => {
    window.open(`/api/preview?secret=${previewSecret}&type=project&id=${project._id}`, '_blank');
  };

  return (
    <AdminLayout title={`Edit: ${project.title}`}>
      <h1>Edit Project</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
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
          <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
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
