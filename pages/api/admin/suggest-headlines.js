import withAdminAuth from "../../../lib/withAdminAuth";

const handler = async (req, res) => {
  // Deprecated: This AI endpoint has been removed from the application.
  return res
    .status(410)
    .json({ success: false, message: "This endpoint has been removed." });
};

export default withAdminAuth(handler);
