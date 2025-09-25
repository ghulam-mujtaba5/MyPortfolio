import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

import commonStyles from './AdminLayout.module.css';
import lightStyles from './AdminLayout.light.module.css';
import darkStyles from './AdminLayout.dark.module.css';
import CommandPalette from '../CommandPalette/CommandPalette';
import Modal from '../../Admin/Modal/Modal';
import Icon from '../Icon/Icon';

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'home' },
    { href: '/admin/articles', label: 'Articles', icon: 'file-text' },
    { href: '/admin/projects', label: 'Projects', icon: 'briefcase' },
    { href: '/admin/resume', label: 'Resume', icon: 'file' },
    { href: '/admin/media', label: 'Media', icon: 'image' },
    { href: '/admin/users', label: 'Users', icon: 'users' },
    { href: '/admin/analytics', label: 'Analytics', icon: 'bar-chart-2' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: 'clipboard' },
  ];

  return (
    <div className={`${commonStyles.adminContainer} ${themeStyles.container}`}>
      <Head>
        <title>{title ? `${title} | Admin` : 'Admin Dashboard'}</title>
        {/* Explicitly prevent indexing of admin pages */}
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <aside className={`${commonStyles.sidebar} ${themeStyles.sidebar}`}>
        <motion.h1 
          className={commonStyles.logo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Admin
        </motion.h1>
        <nav className={commonStyles.nav}>
          <ul>
            {navItems.map((item) => (
              <motion.li 
                key={item.href}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link 
                  href={item.href} 
                  className={`${router.pathname === item.href ? `${commonStyles.active} ${themeStyles.active}` : ''}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              </motion.li>
            ))}
            {process.env.NODE_ENV !== 'production' && (
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/temp-loading"
                  className={`${router.pathname === '/temp-loading' ? `${commonStyles.active} ${themeStyles.active}` : ''}`}
                >
                  <Icon name="loader" size={18} />
                  <span>Loading Demo (Dev)</span>
                </Link>
              </motion.li>
            )}
            <motion.li
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <button 
                onClick={() => signOut({ callbackUrl: '/admin/login' })} 
                className={`${commonStyles.logoutButton} ${themeStyles.logoutButton}`}
              >
                <Icon name="log-out" size={18} />
                <span>Logout</span>
              </button>
            </motion.li>
          </ul>
        </nav>
      </aside>
      <main className={`${commonStyles.mainContent} ${themeStyles.mainContent}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      <CommandPalette />
      {/* Quick Create Floating Button */}
      <motion.button
        type="button"
        onClick={() => setIsQuickCreateOpen(true)}
        className={`${commonStyles.quickCreateButton} ${themeStyles.quickCreateButton}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon name="plus" size={24} />
      </motion.button>

      <Modal 
        isOpen={isQuickCreateOpen} 
        onClose={() => setIsQuickCreateOpen(false)} 
        title="Quick Create"
      >
        <div className={`${commonStyles.row} ${commonStyles.gapMd} ${commonStyles.wrap}`}>
          <motion.button
            type="button"
            onClick={() => { setIsQuickCreateOpen(false); router.push('/admin/articles/new'); }}
            className={commonStyles.logoutButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="file-text" size={18} />
            New Article
          </motion.button>
          <motion.button
            type="button"
            onClick={() => { setIsQuickCreateOpen(false); router.push('/admin/projects/new'); }}
            className={commonStyles.logoutButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="briefcase" size={18} />
            New Project
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}