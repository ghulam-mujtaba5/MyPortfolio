import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './AdminLayout.premium.module.css';
import CommandPalette from '../CommandPalette/CommandPalette';
import Modal from '../../Admin/Modal/Modal';

// SVG Icons for Navigation
const Icons = {
  dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  articles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  projects: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  resume: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  media: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  analytics: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  auditLogs: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  chevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  tools: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-3-3 3-3z"/></svg>,
  sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  pin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 3l6 6"/><path d="M6 6l6 6"/><path d="M14 4l6 6"/><path d="M8 8l-4 4"/><path d="M16 16l4-4"/></svg>,
  externalLink: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  home: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  x: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// Breadcrumb label map
const BREADCRUMB_LABELS = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  articles: 'Articles',
  projects: 'Projects',
  resume: 'Resume',
  media: 'Media Library',
  users: 'Users',
  analytics: 'Analytics',
  'audit-logs': 'Audit Logs',
  search: 'Search',
  pins: 'Pins',
  new: 'Create New',
  edit: 'Edit',
  preview: 'Preview',
};

const STORAGE_KEYS = {
  sidebarCollapsed: 'admin:sidebarCollapsed:v1',
  navSections: 'admin:navSectionsExpanded:v1',
};

export default function AdminLayoutPremium({ children, title }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => router.pathname === path || router.pathname.startsWith(path + '/');

  // Generate breadcrumbs from current path
  const breadcrumbs = useMemo(() => {
    const segments = router.asPath.split('?')[0].split('/').filter(Boolean);
    const crumbs = [];
    let path = '';
    for (let i = 0; i < segments.length; i++) {
      path += '/' + segments[i];
      const label = BREADCRUMB_LABELS[segments[i]] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1).replace(/-/g, ' ');
      crumbs.push({ label, href: path, isLast: i === segments.length - 1 });
    }
    return crumbs;
  }, [router.asPath]);

  const openCommandPalette = useCallback((presetQuery) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('admin:cmdk', {
        detail: {
          open: true,
          query: typeof presetQuery === 'string' ? presetQuery : undefined,
        },
      }),
    );
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Restore persisted sidebar state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawCollapsed = window.localStorage.getItem(STORAGE_KEYS.sidebarCollapsed);
      if (rawCollapsed != null) setIsCollapsed(rawCollapsed === 'true');
    } catch {}

    try {
      const rawSections = window.localStorage.getItem(STORAGE_KEYS.navSections);
      if (rawSections) {
        const parsed = JSON.parse(rawSections);
        if (parsed && typeof parsed === 'object') setExpandedSections(parsed);
      }
    } catch {}
  }, []);

  // Persist sidebar state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.navSections, JSON.stringify(expandedSections));
    } catch {}
  }, [expandedSections]);

  const nav = useMemo(() => {
    return {
      primary: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: Icons.dashboard },
      ],
      sections: [
        {
          id: 'content',
          label: 'Content',
          icon: Icons.articles,
          children: [
            { href: '/admin/articles', label: 'Articles' },
            { href: '/admin/projects', label: 'Projects' },
            { href: '/admin/resume', label: 'Resume' },
          ],
        },
        {
          id: 'assets',
          label: 'Assets',
          icon: Icons.media,
          children: [
            { href: '/admin/media', label: 'Media Library' },
          ],
        },
        {
          id: 'tools',
          label: 'Tools',
          icon: Icons.tools,
          children: [
            { href: '/admin/search', label: 'Search' },
            { href: '/admin/pins', label: 'Pins' },
          ],
        },
        {
          id: 'insights',
          label: 'Insights',
          icon: Icons.analytics,
          children: [
            { href: '/admin/analytics', label: 'Analytics' },
            { href: '/admin/audit-logs', label: 'Audit Logs' },
          ],
        },
        {
          id: 'admin',
          label: 'Admin',
          icon: Icons.settings,
          children: [
            { href: '/admin/users', label: 'Users' },
          ],
        },
      ],
    };
  }, []);

  // Auto-expand the section that contains the active route (without fighting user toggles too much)
  useEffect(() => {
    const activeSection = nav.sections.find((s) =>
      Array.isArray(s.children) && s.children.some((c) => isActive(c.href)),
    );
    if (!activeSection) return;
    setExpandedSections((prev) => ({ ...prev, [activeSection.id]: true }));
  }, [router.pathname, nav.sections]);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className={styles.adminContainer}>
      <Head>
        <title>{title ? `${title} | Admin` : 'Admin Dashboard'}</title>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <Link href="/admin/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Icons.grid />
            </div>
            <span>Admin</span>
          </Link>
          <div className={styles.sidebarHeaderActions}>
            <motion.button
              className={styles.collapseBtn}
              onClick={() => setIsCollapsed(!isCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icons.chevronLeft />
            </motion.button>
            <button
              className={styles.mobileCloseBtn}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <Icons.x />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul>
            {nav.primary.map((item) => (
              <motion.li key={item.href} whileHover={{ x: 4 }}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={styles.navItemIcon}>
                    <item.icon />
                  </span>
                  <span className={styles.navItemLabel}>{item.label}</span>
                </Link>
              </motion.li>
            ))}

            <li className={styles.navDivider} />

            {nav.sections.map((section) => {
              const hasActiveChild = section.children.some((c) => isActive(c.href));
              const isExpanded = !!expandedSections[section.id];
              return (
                <li key={section.id} className={styles.navSection}>
                  <button
                    type="button"
                    className={`${styles.navSectionHeader} ${hasActiveChild ? styles.hasActive : ''}`}
                    onClick={() => setExpandedSections((prev) => ({ ...prev, [section.id]: !isExpanded }))}
                    aria-expanded={isExpanded}
                    title={isCollapsed ? section.label : undefined}
                  >
                    <span className={styles.navSectionIcon}>
                      <section.icon />
                    </span>
                    <span className={styles.navSectionLabel}>{section.label}</span>
                    <span className={`${styles.navSectionChevron} ${isExpanded ? styles.expanded : ''}`}>
                      <Icons.chevronDown />
                    </span>
                  </button>

                  <div className={`${styles.navSectionChildren} ${isExpanded ? styles.expanded : ''}`}>
                    {section.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`${styles.navChildItem} ${isActive(child.href) ? styles.active : ''}`}
                        title={isCollapsed ? child.label : undefined}
                      >
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          {/* Theme Toggle */}
          <div className={styles.themeToggle}>
            <span className={styles.themeToggleLabel}>
              {theme === 'dark' ? <Icons.moon /> : <Icons.sun />}
            </span>
            <button
              className={`${styles.themeToggleSwitch} ${theme === 'dark' ? styles.dark : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            />
          </div>

          {/* User Info */}
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{userInitial}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })} 
            className={styles.logoutButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icons.logout />
            <span>Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Icons.menu />
            </button>

            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className={styles.breadcrumbItem}>
                  {i > 0 && <Icons.chevronRight />}
                  {crumb.isLast ? (
                    <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className={styles.breadcrumbLink}>
                      {i === 0 ? <Icons.home /> : null}
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          <div className={styles.topBarCenter}>
            <div
              className={styles.searchBar}
              role="button"
              tabIndex={0}
              onClick={() => openCommandPalette('')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openCommandPalette('');
                }
              }}
              aria-label="Open command palette"
              title="Search / Commands (Ctrl+K)"
            >
              <Icons.search />
              <input
                type="text"
                readOnly
                value=""
                placeholder="Search or run a command..."
              />
              <kbd className={styles.searchKbd}>Ctrl K</kbd>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewSiteBtn}
              title="View live site"
            >
              <Icons.externalLink />
              <span>View Site</span>
            </a>

            <button
              type="button"
              className={styles.topBarBtn}
              aria-label="Notifications"
              title="Notifications"
              onClick={() => {}}
            >
              <Icons.bell />
              <span className={styles.topBarBtnBadge} aria-hidden="true">3</span>
            </button>

            <div className={styles.topBarDivider} />

            <button
              type="button"
              className={styles.topBarBtn}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Icons.sun /> : <Icons.moon />}
            </button>

            <div className={styles.topBarUserPill} title={userName}>
              <div className={styles.topBarAvatar}>{userInitial}</div>
              <span className={styles.topBarUserName}>{userName}</span>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Command Palette */}
      <CommandPalette />

      {/* Quick Create FAB */}
      <motion.button
        type="button"
        onClick={() => setIsQuickCreateOpen(true)}
        className={styles.quickCreateButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
      >
        <Icons.plus />
      </motion.button>

      {/* Quick Create Modal */}
      <Modal 
        isOpen={isQuickCreateOpen} 
        onClose={() => setIsQuickCreateOpen(false)} 
        title="Quick Create"
      >
        <div className={styles.quickCreateModal}>
          <motion.div
            className={styles.quickCreateOption}
            onClick={() => { setIsQuickCreateOpen(false); router.push('/admin/articles/new'); }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.quickCreateOptionIcon}>
              <Icons.articles />
            </div>
            <span className={styles.quickCreateOptionLabel}>New Article</span>
          </motion.div>
          <motion.div
            className={styles.quickCreateOption}
            onClick={() => { setIsQuickCreateOpen(false); router.push('/admin/projects/new'); }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.quickCreateOptionIcon}>
              <Icons.projects />
            </div>
            <span className={styles.quickCreateOptionLabel}>New Project</span>
          </motion.div>
          <motion.div
            className={styles.quickCreateOption}
            onClick={() => { setIsQuickCreateOpen(false); router.push('/admin/media'); }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.quickCreateOptionIcon}>
              <Icons.media />
            </div>
            <span className={styles.quickCreateOptionLabel}>Upload Media</span>
          </motion.div>
        </div>
      </Modal>
    </div>
  );
}
