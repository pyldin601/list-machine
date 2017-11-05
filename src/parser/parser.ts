import { toArray } from 'lodash';
import { INode, IToken, NodeType, TokenType } from './types';

const continuableExpressions = new Set([
  NodeType.ROOT_EXPRESSION,
  NodeType.LIST_EXPRESSION,
  NodeType.BRACKET_EXPRESSION,
]);

const parseListExpression = (tokens: IterableIterator<IToken>, type: NodeType): INode => {
  const body = toArray(readNode(tokens, type) as any);
  return { type, body };
};

function* readNode (tokens: IterableIterator<IToken>, type: NodeType): IterableIterator<INode> {
  const nextToken = tokens.next();

  if (nextToken.done) {
    if (type !== NodeType.ROOT_EXPRESSION) {
      throw new Error('Unexpected EOF');
    }

    return;
  }

  const token = nextToken.value;

  switch (token.type) {
    case TokenType.PUNCTUATOR:
      switch (token.value) {
        case 'LeftParen':
          yield parseListExpression(tokens, NodeType.LIST_EXPRESSION);
          break;

        case 'LeftBracket':
          yield parseListExpression(tokens, NodeType.BRACKET_EXPRESSION);
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

        case 'Apostrophe': {
          const nestedParser = readNode(tokens, NodeType.QUOTED_EXPRESSION);
          const { value } = nestedParser.next();
          yield { type: NodeType.QUOTED_EXPRESSION, value };
          break;
        }

        case 'Space':
        case 'LineFeed':
        case 'Tab':
          break;

        default:
          throw new Error(`Unexpected punctuator - ${token.value}`);
      }
      break;

    case TokenType.BOOLEAN:
      yield { raw: token.value, type: NodeType.LITERAL, value: token.value === 'true' };
      break;

    case TokenType.NUMBER:
      yield { raw: token.value, type: NodeType.LITERAL, value: parseFloat(token.value) };
      break;

    case TokenType.STRING:
      yield { raw: token.value, type: NodeType.LITERAL, value: token.value };
      break;

    case TokenType.REGEXP:
      yield { raw: token.value, type: NodeType.LITERAL, value: new RegExp(token.value) };
      break;

    case TokenType.UNDEFINED:
      yield undefined;
      break;

    case TokenType.NULL:
      yield null;
      break;

    case TokenType.ID:
      yield { raw: token.value, type: NodeType.ID, name: token.value };
      break;

    default:
      throw new Error(`Unexpected token - ${token.type}`);
  }

  if (continuableExpressions.has(type)) {
    yield* readNode(tokens, type);
  }
}

export default (tokens: IterableIterator<IToken>) => parseListExpression(tokens, NodeType.ROOT_EXPRESSION);
