import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import base from "./ArticleCard.module.css";
import light from "./ArticleCard.light.module.css";
import dark from "./ArticleCard.dark.module.css";

const ArticleCard = ({ article, highlight, index = 0 }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const t = theme === "dark" ? dark : light;

  const href = `/articles/${article.slug}`;
  const img = article.coverImage || "/project-2.png";
  const imgFit = article.coverImageFit || "cover";
  const date = article.createdAt ? new Date(article.createdAt) : null;

  const goToDetail = () => router.push(href);
  const onKeyToDetail = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetail();
    }
  };

  return (
    <article
      className={`${base.card} ${t.card}`}
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={onKeyToDetail}
      aria-label={`Open article ${article.title}`}
    >
      <Link
        href={href}
        className={base.imageWrap}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className={base.imageInner}>
          <Image
            src={img}
            alt={article.title}
            fill
            priority={index < 2}
            sizes="(max-width: 768px) 100vw, 420px"
            className={base.image}
            style={{ objectFit: imgFit }}
          />
        </div>
      </Link>

      <div className={`${base.content} ${t.content}`}>
        <div className={base.meta}>
          {date && (
            <time dateTime={date.toISOString()}>
              {date.toISOString().slice(0, 10)}
            </time>
          )}
          {Array.isArray(article.categories) && article.categories.length > 0 && (
            <div className={base.categories}>
              {article.categories.map((c) => {
                const label = String(c || "");
                const normalized = label.toLowerCase();
                let catClass = base.catOthers;
                if (normalized.includes("academic") || normalized.includes("learning")) catClass = base.catAcademics;
                else if (normalized.includes("project") || normalized.includes("career")) catClass = base.catProjects;
                else if (normalized.includes("engineer") || normalized.includes("development")) catClass = base.catEngineering;
                else if (normalized.includes("tech") || normalized.includes("trend")) catClass = base.catTech;
                return (
                  <span key={label} className={`${base.category} ${catClass}`}>{label}</span>
                );
              })}
            </div>
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
          <Link href={href} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className={`${base.excerpt} ${t.excerpt}`}>{article.excerpt}</p>
        )}
        <div className={base.actions}>
          <Link
            href={href}
            className={`${base.readMore} ${t.readMore}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            Read Article
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
