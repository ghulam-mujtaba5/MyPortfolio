// pages/admin/index.js

// This page now simply redirects to the main dashboard.
export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: "/admin/dashboard",
      permanent: true, // Use a permanent redirect
    },
  };
}

// This component will not be rendered.
const AdminRootPage = () => null;

export default AdminRootPage;
