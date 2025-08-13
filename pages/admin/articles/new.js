import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import ArticleForm from "../../../components/Admin/ArticleForm/ArticleForm";

export default function NewArticlePage() {
  const router = useRouter();

  const handleSave = async (data) => {
    const response = await fetch("/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success("Article created successfully!");
      router.push("/admin/articles");
    } else {
      toast.error("Failed to create article");
    }
  };

  return (
    <AdminLayout title="New Article">
      <h1>Create New Article</h1>
      <ArticleForm onSave={handleSave} />
    </AdminLayout>
  );
}
