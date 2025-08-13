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
    { href: '/admin/media', label: 'Media' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/audit-logs', label: 'Audit Logs' },
  ];

  return (
    <div className={`${commonStyles.adminContainer} ${themeStyles.container}`}>
      <Head>
        <title>{title ? `${title} | Admin` : 'Admin Dashboard'}</title>
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
            <li>
              <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className={commonStyles.logoutButton}>
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
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 100,
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: 9999,
          padding: '0.8rem 1.1rem',
          boxShadow: '0 8px 20px rgba(79,70,229,0.35)'
        }}
      >
        + Create
      </button>

      <Modal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} title="Quick Create">
        <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap'}}>
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
