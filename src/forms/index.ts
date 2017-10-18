import Function from './Function';
import Macro from './Macro';
import Native from './Native';
import Symbol from './Symbol';

export interface IForm {
  toString(): string;
}

export {
  Function,
  Macro,
  Native,
  Symbol,
};
