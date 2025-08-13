import { getSession } from "next-auth/react";

const MOCK_RESPONSES = {
  formal: (text) =>
    `It is with great consideration that we address the following matter: ${text}. We anticipate a positive outcome.`,
  casual: (text) => `Hey, so here's the deal: ${text}. Should be pretty cool.`,
  confident: (text) => `Listen up. ${text}. We will achieve this, period.`,
  friendly: (text) =>
    `Hi there! Just wanted to share a thought: ${text}. Hope you find it helpful!`,
  professional: (text) =>
    `Regarding the subject matter, the following points are pertinent: ${text}. All stakeholders are advised to review.`,
};

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text, tone } = req.body;

  if (!text || text.trim().length < 10) {
    return res
      .status(400)
      .json({ message: "Text must be at least 10 characters long." });
  }

  if (!tone || !MOCK_RESPONSES[tone]) {
    return res.status(400).json({ message: "A valid tone is required." });
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const adjustedText = MOCK_RESPONSES[tone](text);

  res.status(200).json({ adjustedText });
}
