import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import commonStyles from './NavBarCommon.module.css';
import lightStyles from './NavBarMobileLight.module.css';
import darkStyles from './NavBarMobileDark.module.css';



const NavBar = ({ sections }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme(); // Ensure toggleTheme is destructured from the context
    const router = useRouter();

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((prev) => !prev);
    }, []);

    const handleScrollOrRoute = useCallback((sectionOrRoute) => {
        if (sectionOrRoute.startsWith('/')) {
            // If the sectionOrRoute starts with '/', treat it as a route
            router.push(sectionOrRoute);
        } else {
            // Otherwise, treat it as a section ID
            const section = document.getElementById(sectionOrRoute);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
                setIsMenuOpen(false); // Close the menu after clicking on a menu item
            }
        }
    }, [router]);

    const themeStyles = theme === 'light' ? lightStyles : darkStyles;

    return (
        <nav className={`${commonStyles.navBar} ${themeStyles.navBar}`} aria-label="Main Navigation">
            <div className={commonStyles.topBar}>
                <button
                    className={`${commonStyles.menuToggle} ${themeStyles.menuToggle} ${isMenuOpen ? commonStyles.open : ''}`}
                    onClick={toggleMenu}
                    aria-expanded={isMenuOpen}
                    aria-controls="menu-list"
                    aria-label="Toggle menu"
                >
                    <div className={`${commonStyles.menuIcon} ${themeStyles.menuIcon} ${isMenuOpen ? commonStyles.open : ''}`}></div>
                    <div className={`${commonStyles.menuIcon} ${themeStyles.menuIcon} ${isMenuOpen ? commonStyles.open : ''}`}></div>
                    <div className={`${commonStyles.menuIcon} ${themeStyles.menuIcon} ${isMenuOpen ? commonStyles.open : ''}`}></div>
                </button>
            </div>
            <div
                id="menu-list"
                className={`${commonStyles.menuContainer} ${themeStyles.menuContainer} ${isMenuOpen ? commonStyles.open : ''}`}
                role="menu"
            >
                <ul className={`${commonStyles.menuList} ${themeStyles.menuList}`}>
                    {sections?.length > 0 ? (
                        sections.map((section) => (
                            <li
                                key={section.id || section.route}
                                className={`${commonStyles.menuItem} ${themeStyles.menuItem}`}
                                onClick={() => handleScrollOrRoute(section.id || section.route)}
                                role="menuitem"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleScrollOrRoute(section.id || section.route);
                                }}
                            >
                                {section.label}
                            </li>
                        ))
                    ) : (
                        <li className={`${commonStyles.menuItem} ${themeStyles.menuItem}`} role="menuitem">
                            No sections found
                        </li>
                    )}
                </ul>
                <div className={commonStyles.themeToggleContainer}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={theme === 'dark'}
                    tabIndex={0}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    onClick={toggleTheme}
                    className={commonStyles.premiumSwitch}
                  >
                    <span className={commonStyles.premiumSwitchTrack}>
                      <span className={commonStyles.premiumSwitchThumb} data-checked={theme === 'dark'}>
                        <span className={commonStyles.premiumSwitchIcon} aria-hidden="true">
                          {theme === 'dark' ? (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <circle cx="9" cy="9" r="7" fill="#374151"/>
                              <path d="M13 6.5A5 5 0 0 1 6.5 13 5 5 0 1 0 13 6.5Z" fill="#cfd8dc"/>
                              <circle cx="13" cy="5" r="1.2" fill="#ffd700"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <circle cx="9" cy="9" r="7" fill="#e3edf7"/>
                              <g stroke="#607d8b" strokeWidth="1.5" strokeLinecap="round">
                                <line x1="9" y1="2" x2="9" y2="4"/>
                                <line x1="9" y1="14" x2="9" y2="16"/>
                                <line x1="2" y1="9" x2="4" y2="9"/>
                                <line x1="14" y1="9" x2="16" y2="9"/>
                                <line x1="4.5" y1="4.5" x2="5.8" y2="5.8"/>
                                <line x1="12.2" y1="12.2" x2="13.5" y2="13.5"/>
                                <line x1="4.5" y1="13.5" x2="5.8" y2="12.2"/>
                                <line x1="12.2" y1="5.8" x2="13.5" y2="4.5"/>
                              </g>
                              <circle cx="9" cy="9" r="2.2" fill="#ffd700" fillOpacity="0.7"/>
                            </svg>
                          )}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>
            </div>
        </nav>
    );
};

export default React.memo(NavBar);
