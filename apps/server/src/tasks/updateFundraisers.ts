import { fixedGroups } from '@raise/shared';
import { scan, update } from '../helpers/db';
import { fundraiserTable } from '../helpers/tables';
import { Fundraiser } from '../schemas';

async function archiveUpdate(fundraiser: Fundraiser) {
  await update(
    fundraiserTable,
    { id: fundraiser.id },
    { archived: true }
  );
}

export default {
  id: '01H8FRD7X3431J6FH5STKS0HB3',
  name: 'Update fundraisers with archived Property',
  groups: [fixedGroups.National],
  run: async (): Promise<void> => {
    const fundraisers = await scan(fundraiserTable);
    await Promise.all(fundraisers.map(archiveUpdate));
  },
};
