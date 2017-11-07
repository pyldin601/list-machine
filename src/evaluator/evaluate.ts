import * as _ from 'lodash';
import Env from '../Env';
import { IExpressionNode, IIdentifierNode, INode, NodeType } from '../parser/types';
import { getNativeForm, isNativeForm } from './nativeForms';

const evaluate = (node: INode, env: Env): any => {
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
  const operator = evaluate(_.head(node.body), env);
  const args = _.tail(node.body);

  return operator(...args);
};

export default evaluate;
