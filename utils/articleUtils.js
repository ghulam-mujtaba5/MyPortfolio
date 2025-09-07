/**
 * Utility functions for article content processing
 */

/**
 * Generate table of contents from HTML content
 * @param {string} htmlContent - The HTML content to parse
 * @returns {Array} - Array of heading objects with id, text, and level
 */
export const generateTableOfContents = (htmlContent) => {
  if (!htmlContent) return [];
  
  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const toc = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      
      if (text) {
        // Generate a slug-like ID from the heading text
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // Add ID to the heading if it doesn't have one
        if (!heading.id) {
          heading.id = `${id}-${index}`;
        }
        
        toc.push({
          id: heading.id,
          text,
          level,
          element: heading
        });
      }
    });
    
    return toc;
  } catch (error) {
    console.error('Error generating table of contents:', error);
    return [];
  }
};

/**
 * Smooth scroll to element with offset for fixed headers
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Offset from top (default: 80px for header)
 */
export const scrollToElement = (elementId, offset = 80) => {
  try {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  } catch (error) {
    console.error('Error scrolling to element:', error);
  }
};

/**
 * Extract reading statistics from content
 * @param {string} htmlContent - The HTML content to analyze
 * @returns {Object} - Object with word count, estimated reading time, etc.
 */
export const getReadingStats = (htmlContent) => {
  if (!htmlContent) return { wordCount: 0, readingTime: 0 };
  
  try {
    // Create a temporary DOM element to parse HTML and extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove code blocks and other non-readable content
    const codeBlocks = tempDiv.querySelectorAll('pre, code');
    codeBlocks.forEach(block => block.remove());
    
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return {
      wordCount,
      readingTime: Math.max(1, readingTime), // Minimum 1 minute
      charactersCount: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length
    };
  } catch (error) {
    console.error('Error calculating reading stats:', error);
    return { wordCount: 0, readingTime: 1 };
  }
};

/**
 * Add copy-to-clipboard functionality to code blocks
 * @param {HTMLElement} container - The container element with code blocks
 */
export const addCodeBlockCopyButtons = (container) => {
  if (!container) return;
  
  try {
    const codeBlocks = container.querySelectorAll('pre');
    
    codeBlocks.forEach((pre, index) => {
      // Skip if button already exists
      if (pre.querySelector('.copy-button')) return;
      
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
        </svg>
      `;
      button.title = 'Copy code';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Style the button
      Object.assign(button.style, {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        padding: '8px',
        cursor: 'pointer',
        color: '#ffffff',
        transition: 'all 0.2s ease',
        zIndex: '10'
      });
      
      // Add hover effect
      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 255, 255, 0.2)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(255, 255, 255, 0.1)';
      });
      
      // Add copy functionality
      button.addEventListener('click', async () => {
        try {
          const code = pre.querySelector('code')?.textContent || pre.textContent;
          
          if (navigator.clipboard && code) {
            await navigator.clipboard.writeText(code);
            
            // Visual feedback
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
              </svg>
            `;
            button.style.color = '#10b981';
            
            setTimeout(() => {
              button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
                </svg>
              `;
              button.style.color = '#ffffff';
            }, 2000);
          }
        } catch (error) {
          console.error('Failed to copy code:', error);
        }
      });
      
      // Make the pre element relative for absolute positioning
      pre.style.position = 'relative';
      pre.appendChild(button);
    });
  } catch (error) {
    console.error('Error adding copy buttons to code blocks:', error);
  }
};

/**
 * Add anchor links to headings
 * @param {HTMLElement} container - The container element with headings
 */
export const addHeadingAnchors = (container) => {
  if (!container) return;
  
  try {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach((heading, index) => {
      if (!heading.id) {
        const text = heading.textContent.trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        heading.id = `${id}-${index}`;
      }
      
      // Skip if anchor already exists
      if (heading.querySelector('.heading-anchor')) return;
      
      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = `#${heading.id}`;
      anchor.innerHTML = '#';
      anchor.title = 'Link to this heading';
      anchor.setAttribute('aria-label', `Link to heading: ${heading.textContent}`);
      
      // Style the anchor
      Object.assign(anchor.style, {
        marginLeft: '8px',
        opacity: '0',
        color: '#4573df',
        textDecoration: 'none',
        fontSize: '0.8em',
        transition: 'opacity 0.2s ease',
        userSelect: 'none'
      });
      
      // Show anchor on heading hover
      heading.addEventListener('mouseenter', () => {
        anchor.style.opacity = '1';
      });
      
      heading.addEventListener('mouseleave', () => {
        anchor.style.opacity = '0';
      });
      
      // Handle anchor click
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToElement(heading.id);
        
        // Update URL without triggering navigation
        if (window.history && window.history.pushState) {
          window.history.pushState(null, null, `#${heading.id}`);
        }
      });
      
      heading.appendChild(anchor);
    });
  } catch (error) {
    console.error('Error adding heading anchors:', error);
  }
};