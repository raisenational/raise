// See: https://www.gatsbyjs.org/docs/node-apis/

import {type GatsbyNode} from 'gatsby';

export const onCreatePage: GatsbyNode['onCreatePage'] = async ({page, actions}) => {
	const {deletePage} = actions;

	if (page.path === '/admin/') {
		page.matchPath = '/admin/*';
	} else if (page.path.startsWith('/admin/')) {
		deletePage(page);
	}
};
