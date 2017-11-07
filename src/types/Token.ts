export enum TokenType {
  BOOLEAN = 'Boolean',
  NUMBER = 'Number',
  UNDEFINED = 'Undefined',
  NULL = 'Null',
  ID = 'Id',
  PUNCTUATOR = 'Punctuator',
  STRING = 'String',
  COMMENT = 'Comment',
  REGEXP = 'RegExp',
}

export enum Punctuator {
  LEFT_PAREN = 'LeftParen',
  RIGHT_PAREN = 'RightParen',
  LEFT_BRACKET = 'LeftBracket',
  RIGHT_BRACKET = 'RightBracket',
  LINE_FEED = 'LineFeed',
  SPACE = 'Space',
  APOSTROPHE = 'Apostrophe',
  TAB = 'Tab',
  SPREST = 'Sprest',
}

export default class Token {
  constructor(readonly type: TokenType, readonly value: string) { }
}
