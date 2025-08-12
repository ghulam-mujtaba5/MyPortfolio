import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../../components/Admin/AdminLayout/AdminLayout';
import ProjectForm from '../../../../components/Admin/ProjectForm/ProjectForm';
import dbConnect from '../../../../lib/mongoose';
import Project from '../../../../models/Project';

export default function EditProjectPage({ project, previewSecret }) {
  const router = useRouter();

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
      <ProjectForm project={project} onSave={handleSave} onPreview={handlePreview} />
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
