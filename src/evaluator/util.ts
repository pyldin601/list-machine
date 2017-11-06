import { INode, NodeType } from '../parser/types';

export const isExpression = (node: INode) => {
  node.type === NodeType.ROOT_EXPRESSION || node.type === No
};