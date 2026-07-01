// /articles/[slug] was the old route name for insights articles.
// /insights/[slug] is now canonical — see pages/articles/index.js for why.

export default function ArticleRedirect() {
  return null;
}

export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/insights/${params.slug}`,
      permanent: true,
    },
  };
}
