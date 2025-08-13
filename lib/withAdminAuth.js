import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const withAdminAuth = (WrappedComponent, { requiredRole = "editor" } = {}) => {
  const Wrapper = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return; // Do nothing while loading
      if (!session) {
        router.push("/admin/login"); // Redirect to login if not authenticated
        return;
      }

      // If a specific role is required, check for it
      if (requiredRole === "admin" && session.user.role !== "admin") {
        router.push("/admin"); // Redirect to dashboard if not an admin
      }
    }, [session, status, router]);

    // If session is loading or user is not yet authenticated, show a loading state
    if (
      status === "loading" ||
      !session ||
      (requiredRole === "admin" && session.user.role !== "admin")
    ) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>Loading...</p>
        </div>
      );
    }

    // If authenticated and authorized, render the component
    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAdminAuth;
