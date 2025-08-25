import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { signOut } from 'next-auth/react';

import commonStyles from './AdminLayout.module.css';
import lightStyles from './AdminLayout.light.module.css';
import darkStyles from './AdminLayout.dark.module.css';
import CommandPalette from '../CommandPalette/CommandPalette';
import Modal from '../../Admin/Modal/Modal';

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/articles', label: 'Articles' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/resume', label: 'Resume' },
    { href: '/admin/media', label: 'Media' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/audit-logs', label: 'Audit Logs' },
  ];

  return (
    <div className={`${commonStyles.adminContainer} ${themeStyles.container}`}>
      <Head>
        <title>{title ? `${title} | Admin` : 'Admin Dashboard'}</title>
        {/* Explicitly prevent indexing of admin pages */}
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <aside className={`${commonStyles.sidebar} ${themeStyles.sidebar}`}>
        <h1 className={commonStyles.logo}>Admin</h1>
        <nav className={commonStyles.nav}>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`${router.pathname === item.href ? `${commonStyles.active} ${themeStyles.active}` : ''}`}>
                  {item.label}
                </Link>
              </li>
            ))}
            {process.env.NODE_ENV !== 'production' && (
              <li>
                <Link
                  href="/temp-loading"
                  className={`${router.pathname === '/temp-loading' ? `${commonStyles.active} ${themeStyles.active}` : ''}`}
                >
                  Loading Demo (Dev)
                </Link>
              </li>
            )}
            <li>
              <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className={`${commonStyles.logoutButton} ${themeStyles.logoutButton}`}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className={`${commonStyles.mainContent} ${themeStyles.mainContent}`}>
        {children}
      </main>
      <CommandPalette />
      {/* Quick Create Floating Button */}
      <button
        type="button"
        onClick={() => setIsQuickCreateOpen(true)}
        className={`${commonStyles.quickCreateButton} ${themeStyles.quickCreateButton}`}
      >
        + Create
      </button>

      <Modal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} title="Quick Create">
        <div className={`${commonStyles.row} ${commonStyles.gapMd} ${commonStyles.wrap}`}>
          <button
            type="button"
            onClick={() => { setIsQuickCreateOpen(false); router.push('/admin/articles/new'); }}
            className={commonStyles.logoutButton}
          >
            New Article
          </button>
          <button
            type="button"
            onClick={() => { setIsQuickCreateOpen(false); router.push('/admin/projects/new'); }}
            className={commonStyles.logoutButton}
          >
            New Project
          </button>
        </div>
      </Modal>
    </div>
  );
}
