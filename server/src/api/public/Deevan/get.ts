import { middyfy } from '../../../helpers/wrapper';
import { donationTable, fundraiserTable } from '../../../helpers/tables';
import { query, get, scan } from '../../../helpers/db';
import { $Status } from '../../../schemas';

export const main = middyfy(null, $Status, false, async (event) => {
  // const [fundraiser, donations] = await Promise.all([
  //   get(fundraiserTable, { id: event.pathParameters.fundraiserId }),
  //   query(donationTable, { fundraiserId: event.pathParameters.fundraiserId }),
  // ]);
  const fundraisers = await scan(fundraiserTable);

  return (
    {
      message: `hello, there are ${fundraisers.length} fundraisers on the platform`,
    }
  );
});
