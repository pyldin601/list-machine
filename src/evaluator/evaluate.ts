import * as _ from 'lodash';
import { isObject } from 'util';
import { IExpressionNode, IIdentifierNode, INode, NodeType } from '../parser/types';
import { Lambda, Macro } from "../types";
import Env from './Env';
import { getNativeForm, isNativeForm } from './nativeForms';
import valueOf from './valueOf';

const evaluate = (node: INode, env: Env): any => {
  if (isObject(node) && 'type' in node) {
    return evaluateNode(node, env);
  }
  return node;
};

const evaluateNode = (node: INode, env: Env): any => {
  switch (node.type) {
    case NodeType.LITERAL:
      return node.value;
    case NodeType.ROOT_EXPRESSION:
      return evalEach(node, env);
    case NodeType.ID:
      return evalIdentifier(node, env);
    case NodeType.QUOTED_EXPRESSION:
      return node.value;
    case NodeType.BRACKET_EXPRESSION:
      throw new Error('Incorrect usage of brackets');
    case NodeType.LIST_EXPRESSION:
      return evalList(node, env);
  }
};

const evalEach = (node: IExpressionNode, env: Env) =>
  node.body.reduce((acc, node) => evaluate(node, env), undefined);

const evalIdentifier = (node: IIdentifierNode, env: Env): any => {
  if (env.isBound(node.name)) {
    return env.get(node.name);
  }
  if (isNativeForm(node.name)) {
    return getNativeForm(node.name)(env);
  }
  throw new Error(`Identifier "${node.name}" not bound`);
};

const evalList = (node: IExpressionNode, env: Env) => {
  const listOperator = evaluate(_.head(node.body), env);
  const args = _.tail(node.body);

  if (listOperator instanceof Macro) {
    return listOperator.evaluate(args, env);
  }

  if (listOperator instanceof Lambda) {
    return listOperator.evaluate(args, env);
  }

  if (typeof listOperator !== 'function') {
    throw new Error(`Expression ${valueOf(node)} is not callable`);
  }

  return listOperator(...args);
};

export default evaluate;
