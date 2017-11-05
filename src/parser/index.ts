import * as compose from 'compose-function';
import proceedIndents from './indentsProcessor';
import parse from './parser';
import { readFromString } from './reader';
import { tokenize } from './tokenizer';

export const parseCode = compose(parse, proceedIndents, tokenize, readFromString);

export const tokenizeCode = compose(tokenize, readFromString);
