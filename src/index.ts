import parseLexemes from './lexeme';
import parseLists from './list';

export default (program: string): void => {
  const lexemes = parseLexemes(program);
  const lists = parseLists(lexemes);
  // const result = evaluate(lists);
};
