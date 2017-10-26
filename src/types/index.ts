import Lambda from './Lambda';
import Macro from './Macro';

export { Lambda, Macro };

export const isLmType = (obj: any): boolean => {
  return obj instanceof Lambda || obj instanceof Macro;
};
