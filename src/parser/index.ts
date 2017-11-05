import * as compose from 'compose-function';
import parse from './parser';
import { readFromString } from './reader';
import { tokenize } from './tokenizer';

export const parseCode = compose(parse, tokenize, readFromString);

export const tokenizeCode = compose(tokenize, readFromString);
