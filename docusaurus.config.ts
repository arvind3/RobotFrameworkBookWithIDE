import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Robot Framework Book With IDE',
  tagline: 'Interactive Robot Framework learning with runnable browser examples',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: 'https://arvind3.github.io',
  baseUrl: '/RobotFrameworkBookWithIDE/',
  organizationName: 'arvind3',
  projectName: 'RobotFrameworkBookWithIDE',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/arvind3/RobotFrameworkBookWithIDE/edit/main/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: '/docs',
        language: ['en'],
        hashed: true,
        explicitSearchResultPath: true,
      },
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Robot Framework IDE Book',
      logo: {
        alt: 'Robot Framework IDE Book logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/docs/book-overview',
          label: 'Chapters',
          position: 'left',
        },
        {
          to: '/docs/01-introduction',
          label: 'Start Here',
          position: 'left',
        },
        {
          to: '/docs/tooling/github-cli-and-mcp',
          label: 'Tooling',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'left',
        },
        {
          href: 'https://github.com/arvind3/RobotFrameworkBookWithIDE',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Book',
          items: [
            {
              label: 'Book Overview',
              to: '/docs/book-overview',
            },
            {
              label: 'Start Reading',
              to: '/docs/01-introduction',
            },
            {
              label: 'Final Capstone',
              to: '/docs/10-final-capstone-project',
            },
          ],
        },
        {
          title: 'Tooling',
          items: [
            {
              label: 'GitHub CLI + MCP',
              to: '/docs/tooling/github-cli-and-mcp',
            },
          ],
        },
        {
          title: 'Repository',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/arvind3/RobotFrameworkBookWithIDE',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Robot Framework IDE Book`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'yaml', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
