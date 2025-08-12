import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../../context/ThemeContext';

import commonStyles from './CommandPalette.module.css';
import lightStyles from './CommandPalette.light.module.css';
import darkStyles from './CommandPalette.dark.module.css';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleNavigation = (item) => {
    let path = '/admin';
    switch (item.type) {
      case 'Article':
        path += `/articles/edit/${item._id}`;
        break;
      case 'Project':
        path += `/projects/edit/${item._id}`;
        break;
      case 'User':
        path += `/users/edit/${item._id}`;
        break;
      default:
        return;
    }
    router.push(path);
    setIsOpen(false);
  };

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      return;
    }

    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleNavigation(results[activeIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
  }, [isOpen, results, activeIndex, handleNavigation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${query}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      }
    };

    const debounce = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className={`${commonStyles.overlay} ${themeStyles.overlay}`} onClick={() => setIsOpen(false)}>
      <div className={`${commonStyles.modal} ${themeStyles.modal}`} onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          placeholder="Search for articles, projects, users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${commonStyles.input} ${themeStyles.input}`}
          autoFocus
        />
        {results.length > 0 && (
          <ul className={commonStyles.resultsList}>
            {results.map((item, index) => (
              <li 
                key={item._id} 
                className={`${commonStyles.resultItem} ${index === activeIndex ? commonStyles.activeItem : ''}`}
                onClick={() => handleNavigation(item)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>{item.title || item.name}</span>
                <span className={`${commonStyles.resultType} ${themeStyles.resultType}`}>{item.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
