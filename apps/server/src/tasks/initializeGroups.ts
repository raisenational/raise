import { fixedGroups } from '@raise/shared';
import { insert } from '../helpers/db';
import { groupTable } from '../helpers/tables';

// Purpose: For creating National and NationalTech groups with consistent IDs
export default {
  id: '01GPY6CSHMD09C16H417C8SVBB',
  name: 'Initialize National and NationalTech groups',
  groups: [fixedGroups.National],
  run: async (): Promise<void> => {
    await insert(groupTable, { id: fixedGroups.National, name: 'National' });
    await insert(groupTable, { id: fixedGroups.NationalTech, name: 'NationalTech' });
  },
};
