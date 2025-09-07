export default function PortfolioSearchRedirect() {
  return null;
}

export async function getServerSideProps(context) {
  const { q } = context.query;
  const qs = typeof q === "string" && q.trim() ? `?q=${encodeURIComponent(q)}` : "";
  return {
    redirect: {
      destination: `/search${qs}`,
      permanent: false,
    },
  };
}
