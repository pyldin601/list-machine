import * as compose from 'compose-function';
import proceedIndents from './indentsProcessor';
import parseTokenStream from './parser';
import { readFromString } from './reader';
import tokenizeCharStream from './tokenizer';

export const parse = compose(parseTokenStream, proceedIndents, tokenizeCharStream, readFromString);
export const tokenize = compose(tokenizeCharStream, readFromString);
export const evaluate = (): void => undefined;
