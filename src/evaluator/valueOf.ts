import { isPrimitive } from 'util';
import { CharCode } from '../parser/charCodes';
import { INode, NodeType, Punctuator } from '../parser/types';

const valueOf = (node: INode): any => {
  switch (node.type) {
    case NodeType.ID:
      return node.name;

    case NodeType.SPREST_EXPRESSION:
      return `${Punctuator.SPREST}${valueOf(node.value)}`;

    case NodeType.ROOT_EXPRESSION:
      return node.body.map(valueOf).join(String.fromCharCode(CharCode.LINE_FEED));

    case NodeType.BRACKET_EXPRESSION:
      return `[${node.body.map(valueOf).join(String.fromCharCode(CharCode.SPACE))}]`;

    case NodeType.LIST_EXPRESSION:
      return `(${node.body.map(valueOf).join(String.fromCharCode(CharCode.SPACE))})`;

    case NodeType.LITERAL:
      return node.value;

    case NodeType.QUOTED_EXPRESSION:
      return `'${valueOf(node.value)}`;
  }

  if (node === null) {
    return 'null';
  }

  if (node === undefined) {
    return 'undefined';
  }

  if (isPrimitive(node)) {
    return node;
  }

  return `#{${node}}`;
};

export default valueOf;
