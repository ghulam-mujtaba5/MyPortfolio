import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import commonStyles from './NavBarCommon.module.css';
import lightStyles from './NavBarMobileLight.module.css';
import darkStyles from './NavBarMobileDark.module.css';

import Toggle from 'react-toggle';
import 'react-toggle/style.css'; // Import the toggle switch styles

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
                                key={section.id}
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
                    <Toggle
                        defaultChecked={theme === 'dark'}
                        icons={{ checked: '🌙', unchecked: '☀️' }}
                        onChange={toggleTheme} // Call the toggleTheme function
                        className={commonStyles.themeToggle}
                    />
                </div>
            </div>
        </nav>
    );
};

export default React.memo(NavBar);
