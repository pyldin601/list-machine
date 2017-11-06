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

export enum NodeType {
  ROOT_EXPRESSION = 'RootExpression',
  LIST_EXPRESSION = 'ListExpression',
  QUOTED_EXPRESSION = 'QuotedExpression',
  SPREST_EXPRESSION = 'SprestExpression',
  BRACKET_EXPRESSION = 'BracketExpression',
  LITERAL = 'Literal',
  ID = 'Id',
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
  SPREST = '...',
}

export interface IToken {
  type: TokenType,
  value: string,
  position: {
    line: number,
    column: number,
  };
}

export interface IExpressionNode {
  type: NodeType.ROOT_EXPRESSION | NodeType.LIST_EXPRESSION | NodeType.BRACKET_EXPRESSION;
  body: INode[];
}

export interface IIdentifierNode {
  type: NodeType.ID;
  name: string;
}

export interface ILiteralNode {
  type: NodeType.LITERAL;
  value: any;
  raw: string;
}

export interface IQuoteExpressionNode {
  type: NodeType.QUOTED_EXPRESSION;
  value: INode;
}

export interface ISprestExpressionNode {
  type: NodeType.SPREST_EXPRESSION;
  value: INode;
}

export type INode = ILiteralNode | IIdentifierNode | IExpressionNode | IQuoteExpressionNode | ISprestExpressionNode;
