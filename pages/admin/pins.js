// This route has been removed. Return 404 for all requests.
export async function getServerSideProps() {
  return { notFound: true };
}

export default function RemovedPinsPage() {
  return null;
}
