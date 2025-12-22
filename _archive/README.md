# Archived Files

This folder contains archived/legacy code that has been removed from the main project but preserved for reference.

## Softbuilt (Archived: December 22, 2025)

The Softbuilt subdomain/sub-site has been archived. All related files are stored here:

### Structure
```
softbuilt/
├── pages/           # Page files from pages/softbuilt/
│   └── index.js     # Main Softbuilt landing page
├── components/      # Components used by Softbuilt
│   ├── AboutMeCompany/
│   ├── NavBar_Desktop_Company/
│   ├── welcomeCompany/
│   └── Icon/
│       ├── sbicon.js
│       └── sbicon.module.css
└── public/          # Public assets for Softbuilt
    ├── faviconsb.ico
    ├── faviconsb.png
    ├── faviconsb.svg
    ├── sb.svg
    ├── sbname.svg
    └── sbVector.svg
```

### Restoration Instructions

If you need to restore Softbuilt functionality:

1. Move `softbuilt/pages/` contents back to `pages/softbuilt/`
2. Move component folders back to `components/`
3. Move public assets back to `public/`
4. Re-add the subdomain rewrite in `next.config.js`:
   ```js
   {
     source: "/:path((?!api/|admin/|_next/|static/).*)",
     destination: "/softbuilt/:path*",
     has: [{ type: "host", value: "softbuilt.ghulammujtaba.com" }],
   }
   ```
5. Update `next-sitemap-config.js` to include softbuilt paths
6. Update documentation files as needed

### Why Archived

This sub-site was archived to simplify the main portfolio project structure.
