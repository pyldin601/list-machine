import AbstractTokenizer, { ITokenizeResult } from './AbstractTokenizer';

export default class CommentTokenizer extends AbstractTokenizer {
  constructor(source: string, offset: number) {
    super(source, offset, 'Comment');
  }

  public accepts(char: string): boolean {
    return char === ';';
  }

  public tokenize(): ITokenizeResult {
    while (!this.endOfSource()) {
      const char = this.getCurrentChar();

      this.gotoNextChar();

      switch (char) {
        case '\n':
          return this.createResult();

        default:
          this.appendTokenValue(char);
      }
    }

    return this.createResult();
  }
}
