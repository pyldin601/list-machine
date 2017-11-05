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

export type NodeType =
  'RootExpression' |
  'ListExpression' |
  'BracketExpression' |
  'Literal' |
  'Id';

export interface IToken {
  type: TokenType,
  value: string,
  position: {
    line: number,
    column: number,
  };
}

export interface IExpressionNode {
  type: NodeType;
  body: INode[];
}

export interface IIdentifierNode {
  type: 'Id';
  name: string;
}

export interface ILiteralNode {
  type: 'Literal';
  value: any;
  raw: string;
}

export type INode = ILiteralNode | IIdentifierNode | IExpressionNode;
