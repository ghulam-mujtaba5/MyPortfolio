import withAdminAuth from "../../../lib/withAdminAuth";

// This is a mock implementation. In a real-world scenario, this would
// use a Natural Language Processing (NLP) service like OpenAI's GPT,
// Google's Natural Language API, or a library like 'natural'.
const generateMockTags = async (content) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In a real implementation, you would make an API call to an NLP service.
  // For example:
  // const response = await openai.completions.create({
  //   model: "text-davinci-003",
  //   prompt: `Extract the key tags from this article content: "${content}". Return as a comma-separated list.`,
  //   max_tokens: 20,
  // });
  // return response.choices[0].text.trim().split(',').map(t => t.trim());

  // For now, return mock tags based on simple keyword matching.
  const lowerContent = content.toLowerCase();
  const tags = new Set();

  if (lowerContent.includes("react")) tags.add("React");
  if (lowerContent.includes("next.js") || lowerContent.includes("nextjs"))
    tags.add("Next.js");
  if (lowerContent.includes("node.js") || lowerContent.includes("nodejs"))
    tags.add("Node.js");
  if (lowerContent.includes("javascript")) tags.add("JavaScript");
  if (lowerContent.includes("typescript")) tags.add("TypeScript");
  if (lowerContent.includes("api")) tags.add("API");
  if (lowerContent.includes("database") || lowerContent.includes("mongodb"))
    tags.add("Database");
  if (lowerContent.includes("deployment") || lowerContent.includes("vercel"))
    tags.add("Deployment");
  if (lowerContent.includes("testing") || lowerContent.includes("jest"))
    tags.add("Testing");
  if (
    lowerContent.includes("ai") ||
    lowerContent.includes("artificial intelligence")
  )
    tags.add("AI");
  if (lowerContent.includes("machine learning")) tags.add("Machine Learning");

  if (tags.size === 0) {
    return ["general", "tech", "development"];
  }

  return Array.from(tags);
};

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { content } = req.body;

  if (!content || content.trim().length < 50) {
    return res.status(400).json({
      success: false,
      message: "Content must be at least 50 characters long.",
    });
  }

  try {
    const tags = await generateMockTags(content);
    res.status(200).json({ success: true, tags });
  } catch (error) {
    console.error("Error generating tags:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate tags." });
  }
};

export default withAdminAuth(handler);
