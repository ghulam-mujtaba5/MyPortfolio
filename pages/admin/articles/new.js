import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import ArticleForm from "../../../components/Admin/ArticleForm/ArticleForm";
import PublicArticleCard from "../../../components/Articles/ArticleCard";
import { useState } from "react";
import styles from "./articles-form.premium.module.css";
import InlineSpinner from "../../../components/LoadingAnimation/InlineSpinner";

export default function NewArticlePage() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState({});

  const handleSave = async (data) => {
    setErrors({});
    setIsSubmitting(true);
    const toastId = toast.loading("Creating article...");
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        toast.success("Article created successfully!", { id: toastId });
        // Navigate, but also return the created article so ArticleForm can auto-save a version
        router.push("/admin/articles");
        return result;
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
          toast.error(errorData.message || "Failed to create article", { id: toastId });
        }
      }
    } catch (e) {
      toast.error(e.message || "Failed to create article", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="New Article">
      <div className={styles.header}>
        <h1 className={styles.title}>
          Create New Article
          {isSubmitting && (
            <span className={styles.savingIndicator}>
              <InlineSpinner sizePx={16} />
              Saving…
            </span>
          )}
        </h1>
      </div>
      <div className={styles.twoCol}>
        <div className={styles.formColumn}>
          <ArticleForm
            onSave={handleSave}
            serverErrors={errors}
            isSubmitting={isSubmitting}
            onDataChange={setPreviewData}
          />
        </div>
        <div className={styles.previewColumn}>
          <h3 className={styles.previewTitle}>Live Preview</h3>
          <div className={styles.previewScale}>
            <PublicArticleCard article={previewData} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
