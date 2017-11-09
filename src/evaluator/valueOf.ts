import { Identifier, Lambda, List, Macro } from '../types';

const valueOf = (node: Lambda | Macro | List<any> | Identifier | any): any => {
  if (node instanceof Lambda) {
    return `(lambda ${valueOf(node.args)} ${node.body.map(valueOf).join(' ')})`;
  }

  if (node instanceof Macro) {
    return `(macro ${valueOf(node.args)} ${node.body.map(valueOf).join(' ')})`;
  }

  if (node instanceof List) {
    return node.isEmpty() ? 'Nil' : `(${node.map(valueOf).join(' ')})`;
  }

  if (node instanceof Identifier) {
    return node.name;
  }

  if (Array.isArray(node)) {
    return `[${node.map(valueOf).join(' ')}]`;
  }

  return node;
};

export default valueOf;
