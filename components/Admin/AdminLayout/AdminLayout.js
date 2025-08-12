import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../../context/ThemeContext';
import { signOut } from 'next-auth/react';

import commonStyles from './AdminLayout.module.css';
import lightStyles from './AdminLayout.light.module.css';
import darkStyles from './AdminLayout.dark.module.css';
import CommandPalette from '../CommandPalette/CommandPalette';

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/articles', label: 'Articles' },
    { href: '/admin/projects', label: 'Projects' },
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
    </div>
  );
}
