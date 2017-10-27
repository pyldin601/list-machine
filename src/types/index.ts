import Lambda from './Lambda';
import LMSymbol from './LMSymbol';
import Macro from './Macro';

export { Lambda, Macro, LMSymbol };

export const isLMType = (obj: any): boolean => {
  return obj instanceof Lambda || obj instanceof Macro || obj instanceof LMSymbol;
};

export const isLMSymbol = (obj: any): boolean => obj instanceof LMSymbol;
