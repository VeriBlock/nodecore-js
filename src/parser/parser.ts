import { ATV, VTB } from './entities';

export class Publications {
  atv?: ATV = undefined;
  vtbs: VTB[] = [];
}

export interface Parser {
  parse(buffer: Buffer): Publications;
}
