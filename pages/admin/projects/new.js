import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import ProjectForm from '../../../components/Admin/ProjectForm/ProjectForm';

import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const handleSave = async (data) => {
    setErrors({}); // Clear previous errors
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Project created successfully!');
      router.push('/admin/projects');
    } else {
      const errorData = await response.json();
      if (response.status === 400 && errorData.errors) {
        const formattedErrors = {};
        for (const err of errorData.errors) {
          formattedErrors[err.path[0]] = err.message;
        }
        setErrors(formattedErrors);
        toast.error('Please fix the errors below.');
      } else {
        setErrors({ form: errorData.message || 'An unknown error occurred.' });
        toast.error(errorData.message || 'Failed to create project');
      }
    }
  };

  return (
    <AdminLayout title="New Project">
      <h1>Create New Project</h1>
      <ProjectForm onSave={handleSave} serverErrors={errors} />
    </AdminLayout>
  );
}
