import Env from './Env';
import evaluate from './eval';
import print from './printer';

export { print };

export default (): any => {
  const env = new Env();
  return (code: string) => evaluate(code, env);
};
