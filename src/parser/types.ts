export type TokenType =
  'Boolean' |
  'Number' |
  'Undefined' |
  'Null' |
  'Id' |
  'Punctuator' |
  'String' |
  'Comment' |
  'RegExp';

export interface IToken {
  type: TokenType,
  value: string,
  position: {
    line: number,
    column: number,
  },
}
