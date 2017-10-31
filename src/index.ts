import Env from './Env';
import evaluate from './eval';

export default (): any => {
  const env = new Env();
  return (code: string) => evaluate(code, env);
};
