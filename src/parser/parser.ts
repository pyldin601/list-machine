import { toArray } from 'lodash';
import { INode, IToken } from "./types";

const parseExpression = (tokens: IterableIterator<IToken>, type: INode['type']): INode => {
  const body = toArray(parseToken(tokens, type) as any);

  return { type, body };
};

function* parseToken (tokens: IterableIterator<IToken>, type: INode['type']): IterableIterator<INode> {
  const nextToken = tokens.next();

  if (nextToken.done) {
    if (type !== 'RootExpression') {
      throw new Error('Unexpected EOF');
    }

    return;
  }

  const token = nextToken.value;

  switch (token.type) {
    case 'Punctuator':
      switch (token.value) {
        case 'LeftParen':
          yield parseExpression(tokens, 'ListExpression');
          break;

        case 'LeftBracket':
          yield parseExpression(tokens, 'BracketExpression');
          break;

        case 'RightParen':
          if (type !== 'ListExpression') {
            throw new Error(`Unexpected punctuator value - ${token.value}`);
          }
          return;

        case 'RightBracket':
          if (type !== 'BracketExpression') {
            throw new Error(`Unexpected punctuator value - ${token.value}`);
          }
          return;

        case 'Space':
        case 'LineFeed':
        case 'Tab':
          break;

        default:
          throw new Error(`Unexpected punctuator - ${token.value}`);
      }
      break;

    case 'Boolean':
      yield {
        raw: token.value,
        type: 'Literal',
        value: token.value === 'true',
      };
      break;

    case 'Number':
      yield {
        raw: token.value,
        type: 'Literal',
        value: parseFloat(token.value),
      };
      break;

    case 'String':
      yield {
        raw: token.value,
        type: 'Literal',
        value: token.value,
      };
      break;

    case 'RegExp':
      yield {
        raw: token.value,
        type: 'Literal',
        value: new RegExp(token.value),
      };
      break;

    case 'Id':
      yield {
        name: token.value,
        raw: token.value,
        type: 'Id',
      };
      break;

    default:
      throw new Error(`Unexpected token - ${token.type}`);
  }

  yield * parseToken(tokens, type);
}

export default (tokens: IterableIterator<IToken>) => parseExpression(tokens, 'RootExpression');
