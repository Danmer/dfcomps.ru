import * as fs from 'fs';

export function getMapLevelshot(mapname: string): string {
  return fs.existsSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/images/maps/${mapname}.jpg`)
    ? `https://dfcomps.ru/uploads/images/maps/${mapname}.jpg`
    : `https://dfcomps.ru/uploads/images/maps/no-levelshot.jpg`;
}
