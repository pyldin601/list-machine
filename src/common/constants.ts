import { INode, NodeType } from '../parser/types';

export const compositeNodeTypes = new Set([
  NodeType.ROOT_EXPRESSION,
  NodeType.LIST_EXPRESSION,
  NodeType.BRACKET_EXPRESSION,
]);

export const terminalNodeTypes = new Set([
  NodeType.ROOT_EXPRESSION,
]);

export const isCompositeNode = (node: INode) => compositeNodeTypes.has(node.type);

export const isTerminalNode = (node: INode) => terminalNodeTypes.has(node.type);
