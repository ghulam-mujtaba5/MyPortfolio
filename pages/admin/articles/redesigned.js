import React, { useState, useEffect } from "react";
import NewArticleCard from "../../../components/Articles/NewArticleCard";
import styles from "./redesigned.module.css";

// Mock data - replace with your actual API call
const mockArticles = [
  {
    id: 1,
    title: "The Future of AI in Web Development",
    author: "Jane Doe",
    date: "2025-08-12T10:00:00Z",
    status: "Published",
    imageUrl: "/images/article-1.jpg", // Replace with actual image paths
  },
  {
    id: 2,
    title: "Mastering Modern CSS Layouts",
    author: "John Smith",
    date: "2025-08-10T14:30:00Z",
    status: "Pending Review",
    imageUrl: "/images/article-2.jpg",
  },
  {
    id: 3,
    title: "A Deep Dive into React Server Components",
    author: "Emily White",
    date: "2025-08-05T09:00:00Z",
    status: "Draft",
    imageUrl: "/images/article-3.jpg",
  },
  {
    id: 4,
    title: "UI/UX Trends to Watch in 2025",
    author: "Chris Green",
    date: "2025-08-01T11:45:00Z",
    status: "Published",
    imageUrl: "/images/article-4.jpg",
  },
];

const RedesignedArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [theme, setTheme] = useState("light"); // 'light' or 'dark'

  useEffect(() => {
    // In a real app, you would fetch articles from your API here
    // For now, we'll use the mock data
    setArticles(mockArticles);
  }, []);

  useEffect(() => {
    // Apply the theme to the body element
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Articles</h1>
        <div className={styles.headerActions}>
          <button onClick={toggleTheme} className={styles.themeToggleButton}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button className={styles.createButton}>+ Create New Article</button>
        </div>
      </header>

      <div className={styles.gridContainer}>
        {articles.map((article) => (
          <NewArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default RedesignedArticlesPage;
