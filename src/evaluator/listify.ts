import { IExpressionNode, INode, NodeType } from '../parser/types';
import { Identifier, List } from '../types';

const listifyNode = (node: INode): any => {
  switch (node.type) {
    case NodeType.ID:
      return new Identifier(node.name);
    case NodeType.LITERAL:
      return node.value;
    case NodeType.LIST_EXPRESSION:
      return List.of(...node.body.map(listifyNode));
    case NodeType.BRACKET_EXPRESSION:
      return node.body.map(listifyNode);
    case NodeType.QUOTED_EXPRESSION:
      return List.of(new Identifier('quote'), listifyNode(node.value));
    case NodeType.SPREST_EXPRESSION:
      return List.of(new Identifier('sprest'), listifyNode(node.value));
  }
};

const listify = (rootExpression: IExpressionNode): List<any> => {
  return List.of(...rootExpression.body.map(listifyNode));
};

export default listify;
