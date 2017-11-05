import { INode, IToken } from "./types";

const parseExpression = (tokens: IterableIterator<IToken>, type: INode['type']): INode => {
  const body: INode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'Punctuator':
        switch (token.value) {
          case 'LeftParen':
            body.push(parseExpression(tokens, 'ListExpression'));
            break;

          case 'LeftBracket':
            body.push(parseExpression(tokens, 'BracketExpression'));
            break;

          case 'RightParen':
            if (type !== 'ListExpression') {
              throw new Error('Unexpected token');
            }
            return { body, type };

          case 'RightBracket':
            if (type !== 'BracketExpression') {
              throw new Error('Unexpected token');
            }
            return { body, type };

          case 'Space':
          case 'LineFeed':
          case 'Tab':
            break;

          default:
            throw new Error(`Unexpected punctuator - ${token.value}`);
        }
        break;

      case 'Boolean':
        body.push({
          raw: token.value,
          type: 'Literal',
          value: token.value === 'true',
        });
        break;

      case 'Number':
        body.push({
          raw: token.value,
          type: 'Literal',
          value: parseFloat(token.value),
        });
        break;

      case 'String':
        body.push({
          raw: token.value,
          type: 'Literal',
          value: token.value,
        });
        break;

      case 'RegExp':
        body.push({
          raw: token.value,
          type: 'Literal',
          value: new RegExp(token.value),
        });
        break;

      case 'Id':
        body.push({
          name: token.value,
          raw: token.value,
          type: 'Id',
        });
        break;

      default:
        throw new Error(`Unexpected token - ${token.type}`);
    }
  }

  if (type !== 'RootExpression') {
    throw new Error('Unexpected token');
  }

  return { type, body };
};

export default (tokens: IterableIterator<IToken>) => parseExpression(tokens, 'RootExpression');
