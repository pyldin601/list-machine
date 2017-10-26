import Lambda from './Lambda';
import Macro from './Macro';
import Symbol from './Symbol';

export { Lambda, Macro, Symbol };

export const isLmType = (obj: any): boolean => {
  return obj instanceof Lambda || obj instanceof Macro || obj instanceof Symbol;
};
