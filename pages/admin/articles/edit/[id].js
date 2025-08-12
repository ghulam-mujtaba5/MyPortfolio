import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../../components/Admin/AdminLayout/AdminLayout';
import ArticleForm from '../../../../components/Admin/ArticleForm/ArticleForm';
import dbConnect from '../../../../lib/mongoose';
import Article from '../../../../models/Article';

export default function EditArticlePage({ article, previewSecret }) {
  const router = useRouter();

  const handleSave = async (data) => {
    const response = await fetch(`/api/articles/${article._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Article updated successfully!');
      router.push('/admin/articles');
    } else {
      toast.error('Failed to update article');
    }
  };

  const handlePreview = () => {
    window.open(`/api/preview?secret=${previewSecret}&type=article&id=${article._id}`, '_blank');
  };

  return (
    <AdminLayout title={`Edit: ${article.title}`}>
      <h1>Edit Article</h1>
      <ArticleForm article={article} onSave={handleSave} onPreview={handlePreview} />
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }) {
  await dbConnect();

  const article = await Article.findById(params.id);

  if (!article) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
      previewSecret: process.env.PREVIEW_SECRET || null,
    },
  };
}
