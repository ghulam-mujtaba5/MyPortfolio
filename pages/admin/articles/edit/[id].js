import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../../components/Admin/AdminLayout/AdminLayout";
import ArticleForm from "../../../../components/Admin/ArticleForm/ArticleForm";
import dbConnect from "../../../../lib/mongoose";
import Article from "../../../../models/Article";
import mongoose from "mongoose";
import { useState } from "react";

export default function EditArticlePage({ article, previewSecret }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (data) => {
    setErrors({});
    setIsSubmitting(true);
    const toastId = toast.loading("Updating article...");
    try {
      const response = await fetch(`/api/articles/${article._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Article updated successfully!", { id: toastId });
        router.push("/admin/articles");
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400 && Array.isArray(errorData.errors)) {
          const formatted = {};
          for (const err of errorData.errors) {
            const path = Array.isArray(err.path) ? err.path[0] : err.path;
            if (path) formatted[path] = err.message;
          }
          setErrors(formatted);
          toast.error("Please fix the errors below.", { id: toastId });
        } else {
          toast.error(errorData.message || "Failed to update article", { id: toastId });
        }
      }
    } catch (e) {
      toast.error(e.message || "Failed to update article", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    window.open(
      `/api/preview?secret=${previewSecret}&type=article&id=${article._id}`,
      "_blank",
    );
  };

  return (
    <AdminLayout title={`Edit: ${article.title}`}>
      <h1>Edit Article</h1>
      <ArticleForm
        article={article}
        onSave={handleSave}
        onPreview={handlePreview}
        serverErrors={errors}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }) {
  await dbConnect();

  let article = null;
  const idOrSlug = params.id;
  if (mongoose.isValidObjectId(idOrSlug)) {
    article = await Article.findById(idOrSlug);
  }
  if (!article) {
    article = await Article.findOne({ slug: idOrSlug });
  }

  if (!article) {
    return {
      redirect: {
        destination: "/admin/articles?error=notfound",
        permanent: false,
      },
    };
  }

  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
      previewSecret: process.env.PREVIEW_SECRET || null,
    },
  };
}
