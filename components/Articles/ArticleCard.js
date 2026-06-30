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

  const href = `/insights/${article.slug}`;
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
      onClick={goToDetail}
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
