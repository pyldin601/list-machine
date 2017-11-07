import { isObject, isPrimitive } from 'util';
import { INode, NodeType } from '../parser/types';
import { Lambda, Macro } from '../types';

const valueOfNode = (node: INode): any => {
  switch (node.type) {
    case NodeType.ID:
      return node.name;

    case NodeType.SPREST_EXPRESSION:
      return `...${valueOf(node.value)}`;

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

    default:
      return '???';
  }
};

const valueOf = (node: any): any => {
  if (node instanceof Lambda) {
    return `(lambda ${valueOf(node.args)} ${valueOf(node.body)})`;
  }

  if (node instanceof Macro) {
    return `(macro ${valueOf(node.args)} ${valueOf(node.body)})`;
  }

  if (isObject(node) && 'type' in node) {
    return valueOfNode(node);
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

  if (isObject(node) && 'toString' in node) {
    return String(node);
  }

  return `#{${Object.keys(node).map(key => `${key}: ${node[key]}`).join(', ')}}`;
};

export default valueOf;
