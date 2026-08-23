const titles = [
  {
    route: "/",
    current: "Ghulam Mujtaba | Founder, Megicode & CampusAxis · Full Stack + AI",
    proposed: "Ghulam Mujtaba | Full Stack Developer & AI Specialist",
    altProposed1: "Ghulam Mujtaba | Full Stack Developer & AI Specialist",
    altProposed2: "Ghulam Mujtaba | Founder Megicode & CampusAxis | Full Stack",
  },
  {
    route: "/about",
    current: "About Ghulam Mujtaba | Full Stack Developer & AI Specialist",
    proposed: "About Ghulam Mujtaba | Full Stack Developer & AI Specialist",
  },
  {
    route: "/projects",
    current: "Projects | Ghulam Mujtaba — Full Stack & AI",
    proposed: "Projects | Ghulam Mujtaba — Full Stack & AI",
  },
  {
    route: "/services",
    current: "Full-Stack Web Development & AI Services | Ghulam Mujtaba",
    proposed: "Full-Stack Web Development & AI Services | Ghulam Mujtaba",
  },
  {
    route: "/insights",
    current: "Insights | Ghulam Mujtaba — Software, Data Science & AI",
    proposed: "Insights | Ghulam Mujtaba — Software, Data Science & AI",
  },
  {
    route: "/contact",
    current: "Contact Ghulam Mujtaba | Full Stack Developer & AI Specialist",
    proposed: "Contact Ghulam Mujtaba | Full Stack & AI Specialist",
    altProposed1: "Contact Ghulam Mujtaba | Full Stack & AI Specialist",
    altProposed2: "Contact Ghulam Mujtaba | Full Stack Developer & AI",
  },
  {
    route: "/uses",
    current: "My Developer Setup & Tech Stack | Ghulam Mujtaba",
    proposed: "My Developer Setup & Tech Stack | Ghulam Mujtaba",
  },
  {
    route: "/privacy-policy",
    current: "Privacy Policy | Ghulam Mujtaba Portfolio",
    proposed: "Privacy Policy | Ghulam Mujtaba Portfolio",
  },
];

const descs = [
  {
    route: "/",
    current: "Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode and CampusAxis, specializing in Next.js, React, Node.js, and machine learning solutions.",
    proposed: "Portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode & CampusAxis, building Next.js, React, Node.js, and AI solutions.",
    altProposed1: "Portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode & CampusAxis, building Next.js, React, Node.js, and AI solutions.",
  },
  {
    route: "/about",
    current: "Learn about Ghulam Mujtaba, a professional full stack developer, software engineer, and AI specialist. Founder of Megicode and CampusAxis.",
    proposed: "Learn about Ghulam Mujtaba, a professional full stack developer, software engineer, and AI specialist. Founder of Megicode and CampusAxis.",
  },
  {
    route: "/projects",
    current: "Showcase of advanced, modern, and professional projects by Ghulam Mujtaba. Explore software, web, mobile, AI, data science, and UI/UX work.",
    proposed: "Showcase of advanced, modern, and professional projects by Ghulam Mujtaba. Explore software, web, mobile, AI, data science, and UI/UX work.",
    altProposed1: "Explore software and AI projects by Ghulam Mujtaba, including Megicode and CampusAxis, built with Next.js, React, Node.js, and machine learning.",
  },
  {
    route: "/services",
    current: "Hire Ghulam Mujtaba, a professional Next.js full-stack developer and AI/ML specialist based in Pakistan. Offering customized software, chatbots, and APIs.",
    proposed: "Hire Ghulam Mujtaba, a professional Next.js full-stack developer and AI/ML specialist based in Pakistan. Offering customized software, chatbots, and APIs.",
  },
  {
    route: "/insights",
    current: "Insights and articles by Ghulam Mujtaba on software engineering, data science, machine learning, AI, and modern web development.",
    proposed: "Insights and articles by Ghulam Mujtaba on software engineering, data science, machine learning, AI, and modern web development.",
  },
  {
    route: "/contact",
    current: "Contact Ghulam Mujtaba for project inquiries, collaborations, or opportunities. Based in Lahore, Pakistan — available for freelance and full-time work.",
    proposed: "Contact Ghulam Mujtaba for project inquiries, collaborations, or opportunities. Based in Lahore, Pakistan — available for freelance and full-time work.",
    altProposed1: "Contact Ghulam Mujtaba, Full Stack Developer & AI Specialist (Founder of Megicode & CampusAxis). Open for freelance, consulting, and full-time roles.",
  },
  {
    route: "/uses",
    current: "What Ghulam Mujtaba uses for software engineering, full-stack web development, and AI coding. Hardware, editor configs, extensions, hosting, and dev tools.",
    proposed: "What Ghulam Mujtaba uses for software engineering, full-stack web development, and AI coding. Hardware, editor configs, extensions, hosting, and dev tools.",
  },
  {
    route: "/privacy-policy",
    current: "Privacy Policy for Ghulam Mujtaba's Portfolio website. Learn how we collect, use, and protect your information.",
    proposed: "Read the Privacy Policy for Ghulam Mujtaba's portfolio website. Learn how we handle, collect, and protect your personal data and respect your privacy.",
    altProposed1: "Privacy Policy for Ghulam Mujtaba's portfolio website. Understand how visitor data is collected, protected, and used in compliance with data privacy standards.",
    altProposed2: "Privacy Policy for Ghulam Mujtaba's portfolio and projects including Megicode and CampusAxis. Learn how personal data is collected, used, and protected.",
  },
];

const targetEntities = [
  "Ghulam Mujtaba",
  "Full Stack Developer",
  "AI Specialist",
  "Next.js",
  "React",
  "Node.js",
  "Megicode",
  "CampusAxis"
];

console.log("================ TITLES EVALUATION ================");
titles.forEach(t => {
  const cLen = t.current.length;
  const pLen = t.proposed.length;
  const cPass = cLen >= 20 && cLen <= 60;
  const pPass = pLen >= 20 && pLen <= 60;
  console.log(`Route: ${t.route}`);
  console.log(`  Current (${cLen} chars): [${cPass ? "PASS" : "FAIL"}] "${t.current}"`);
  console.log(`  Proposed (${pLen} chars): [${pPass ? "PASS" : "FAIL"}] "${t.proposed}"`);
  if (t.altProposed1) {
    console.log(`  Alt 1 (${t.altProposed1.length} chars): [${t.altProposed1.length >= 20 && t.altProposed1.length <= 60 ? "PASS" : "FAIL"}] "${t.altProposed1}"`);
  }
  if (t.altProposed2) {
    console.log(`  Alt 2 (${t.altProposed2.length} chars): [${t.altProposed2.length >= 20 && t.altProposed2.length <= 60 ? "PASS" : "FAIL"}] "${t.altProposed2}"`);
  }
});

console.log("\n============= DESCRIPTIONS EVALUATION =============");
descs.forEach(d => {
  const cLen = d.current.length;
  const pLen = d.proposed.length;
  const cPass = cLen >= 120 && cLen <= 160;
  const pPass = pLen >= 120 && pLen <= 160;
  console.log(`Route: ${d.route}`);
  console.log(`  Current (${cLen} chars): [${cPass ? "PASS" : "FAIL"}] "${d.current}"`);
  console.log(`  Proposed (${pLen} chars): [${pPass ? "PASS" : "FAIL"}] "${d.proposed}"`);
  if (d.altProposed1) {
    console.log(`  Alt 1 (${d.altProposed1.length} chars): [${d.altProposed1.length >= 120 && d.altProposed1.length <= 160 ? "PASS" : "FAIL"}] "${d.altProposed1}"`);
  }
  if (d.altProposed2) {
    console.log(`  Alt 2 (${d.altProposed2.length} chars): [${d.altProposed2.length >= 120 && d.altProposed2.length <= 160 ? "PASS" : "FAIL"}] "${d.altProposed2}"`);
  }
});

console.log("\n============= ENTITY COVERAGE ACROSS PROPOSED =============");
const combinedProposed = [
  ...titles.map(t => t.proposed),
  ...descs.map(d => d.proposed),
].join(" ");

targetEntities.forEach(ent => {
  const regex = new RegExp(ent, "gi");
  const matches = (combinedProposed.match(regex) || []).length;
  console.log(`Entity: "${ent}" -> Count across proposed meta: ${matches}`);
});
