import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import base from "./ArticleCard.module.css";
import light from "./ArticleCard.light.module.css";
import dark from "./ArticleCard.dark.module.css";

const ArticleCard = ({ article, highlight }) => {
  const { theme } = useTheme();
  const t = theme === "dark" ? dark : light;

  const href = `/articles/${article.slug}`;
  const img = article.coverImage || "/project-2.png";
  const date = article.createdAt ? new Date(article.createdAt) : null;

  return (
    <article className={`${base.card} ${t.card}`}>
      <Link href={href} className={base.imageWrap}>
        <div className={base.imageInner}>
          <Image
            src={img}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 420px"
            className={base.image}
          />
        </div>
      </Link>

      <div className={`${base.content} ${t.content}`}>
        <div className={base.meta}>
          {date && (
            <time dateTime={date.toISOString()}>
              {date.toLocaleDateString()}
            </time>
          )}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className={base.tags}>
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className={`${base.tag} ${t.tag}`}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <h3 className={`${base.title} ${t.title}`}>
          <Link href={href}>{article.title}</Link>
        </h3>
        {article.excerpt && (
          <p className={`${base.excerpt} ${t.excerpt}`}>{article.excerpt}</p>
        )}
        <div className={base.actions}>
          <Link href={href} className={`${base.readMore} ${t.readMore}`}>
            Read Article{" "}
            <span className={base.arrow} aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
