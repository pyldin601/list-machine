import * as _ from 'lodash';
import { compositeNodeTypes, terminalNodeTypes } from '../common/constants';
import Token, { Punctuator, TokenType } from '../types/Token';
import { IExpressionNode, INode, NodeType,  } from './types';



const parseExpression = (tokens: IterableIterator<Token>, type: IExpressionNode['type']): INode => {
  const body = _.toArray(generateNodes(tokens, type) as any);
  return { type, body };
};

function* generateNodes(tokens: IterableIterator<Token>, type: NodeType): IterableIterator<INode> {
  do {
    const nextValue = tokens.next();

    if (nextValue.done) {
      if (terminalNodeTypes.has(type)) {
        return;
      }

      throw new Error('Unexpected end of tokens');
    }

    const token = nextValue.value;

    switch (token.type) {
      case TokenType.PUNCTUATOR:
        switch (token.value) {
          case Punctuator.LEFT_PAREN:
            yield parseExpression(tokens, NodeType.LIST_EXPRESSION);
            break;

          case Punctuator.LEFT_BRACKET:
            yield parseExpression(tokens, NodeType.BRACKET_EXPRESSION);
            break;

          case Punctuator.RIGHT_PAREN:
            if (type !== NodeType.LIST_EXPRESSION) {
              throw new Error(`Unexpected punctuator value - ${token.value}`);
            }
            return;

          case Punctuator.RIGHT_BRACKET:
            if (type !== NodeType.BRACKET_EXPRESSION) {
              throw new Error(`Unexpected punctuator value - ${token.value}`);
            }
            return;

          case Punctuator.APOSTROPHE: {
            const nestedParser = generateNodes(tokens, NodeType.QUOTED_EXPRESSION);
            const { value } = nestedParser.next();
            yield { type: NodeType.QUOTED_EXPRESSION, value };
            break;
          }

          case Punctuator.SPREST:
            const nestedParser = generateNodes(tokens, NodeType.SPREST_EXPRESSION);
            const { value } = nestedParser.next();
            yield { type: NodeType.SPREST_EXPRESSION, value };
            break;

          // Should be skipped
          case Punctuator.SPACE:
          case Punctuator.LINE_FEED:
          case Punctuator.TAB:
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
        yield { type: NodeType.ID, name: token.value };
        break;

      default:
        throw new Error(`Unexpected token - ${token.type}`);
    }
  } while (compositeNodeTypes.has(type));
}

export default (tokens: IterableIterator<Token>) => parseExpression(tokens, NodeType.ROOT_EXPRESSION);
