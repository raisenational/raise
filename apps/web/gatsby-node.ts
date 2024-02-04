// See: https://www.gatsbyjs.org/docs/node-apis/

import { GatsbyNode } from 'gatsby';

// eslint-disable-next-line import/prefer-default-export
export const onCreatePage: GatsbyNode['onCreatePage'] = async ({ page, actions }) => {
  const { deletePage } = actions;

  if (page.path === '/admin/') {
    // eslint-disable-next-line no-param-reassign
    page.matchPath = '/admin/*';
  } else if (page.path.startsWith('/admin/')) {
    deletePage(page);
  }
  if (page.path === '/signUp/') {
    // eslint-disable-next-line no-param-reassign
    page.matchPath = '/signUp/*';
  } else if (page.path.startsWith('/signUp/')) {
    deletePage(page);
  }
  if (page.path === '/unsubscribe/') {
    // eslint-disable-next-line no-param-reassign
    page.matchPath = '/unsubscribe/*';
  } else if (page.path.startsWith('/unsubscribe/')) {
    deletePage(page);
  }
};
