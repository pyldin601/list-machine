import { isPrimitive } from 'util';
import { NodeType, Punctuator } from '../parser/types';

const valueOf = (node: any): any => {
  if ('type' in node) {
    switch (node.type) {
      case NodeType.ID:
        return node.name;

      case NodeType.SPREST_EXPRESSION:
        return `${Punctuator.SPREST}${valueOf(node.value)}`;

      case NodeType.ROOT_EXPRESSION:
        return node.body.map(valueOf).join('\n');

      case NodeType.BRACKET_EXPRESSION:
        return `[${node.body.map(valueOf).join(' ')}]`;

      case NodeType.LIST_EXPRESSION:
        return `(${node.body.map(valueOf).join(' ')})`;

      case NodeType.LITERAL:
        return node.value;

      case NodeType.QUOTED_EXPRESSION:
        return `'${valueOf(node.value)}`;
    }
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

  if (Array.isArray(node)) {
    return `#[${node.map(valueOf).join(', ')}]`;
  }

  return `#{${Object.keys(node).map(key => `${key}: ${node[key]}`).join(', ')}}`;
};

export default valueOf;
