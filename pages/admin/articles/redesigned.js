import { useEffect } from "react";
import { useRouter } from "next/router";

// Temporary placeholder to keep the route valid and avoid build error.
// Redirects to the main admin articles page.
export default function RedesignedArticlesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/articles");
  }, [router]);
  return null;
}
