// This route has been removed. Redirect to /admin.
export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/admin",
      permanent: false,
    },
  };
}

export default function RemovedPinsPage() {
  return null;
}
