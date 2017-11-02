import evaluate, { initializeEnv } from './eval';
import print from './printer';

export { print };

export default (): any => {
  const env = initializeEnv();
  return (code: string) => evaluate(code, env);
};
