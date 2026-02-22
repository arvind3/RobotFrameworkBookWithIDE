import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  bookSidebar: [
    '01-introduction',
    '02-installation-concepts',
    '03-robot-framework-basics',
    '04-multi-file-architecture',
    '05-advanced-keywords',
    '06-python-integration',
    '07-best-practices',
    '08-enterprise-patterns',
    '09-real-world-case-study',
    '10-final-capstone-project',
    {
      type: 'category',
      label: 'Tooling',
      items: ['tooling-github-cli-and-mcp'],
    },
  ],
};

export default sidebars;
