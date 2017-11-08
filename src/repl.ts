import * as readLine from 'readline';
import { Env, evaluate, valueOf } from './';
import lmCore from './lmcore';

const env = new Env();

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stderr,
  terminal: true,
});

const readCode = (): Promise<string> => new Promise((resolve => {
  rl.question('> ', input => resolve(input));
}));

const evalCode = async (code: string): Promise<any> => {
  return evaluate(code, env);
};

const printResult = async (result: any): Promise<any> => {
  return process.stdout.write(String(valueOf(result)));
};

const printNewLine = async (result: any): Promise<any> => {
  return process.stdout.write('\n');
};

const printError = async (error: Error): Promise<any> => {
  return process.stderr.write(`${error.message}\n${error.stack}`);
};

const startIteration = (): Promise<void> => (
  Promise.resolve()
    .then(readCode)
    .then(evalCode)
    .then(printResult)
    .catch(printError)
    .then(printNewLine)
    .then(startIteration)
);

evaluate(lmCore, env);

startIteration().then(() => 'Bye');
