import * as readLine from 'readline';
import makeEvaluator from './';
import toPrimitive from "./printer";

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stderr,
  terminal: true,
});

const evaluate = makeEvaluator();

const readCode = (): Promise<string> => new Promise((resolve => {
  rl.question('> ', input => resolve(input));
}));

const evalCode = async (code: string): Promise<any> => {
  return evaluate(code);
};

const printResult = async (result: any): Promise<any> => {
  return process.stdout.write(String(toPrimitive(result)));
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

startIteration().then(() => 'Bye');
