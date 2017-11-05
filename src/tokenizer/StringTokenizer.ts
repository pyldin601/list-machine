import AbstractTokenizer, { ITokenizeResult } from './AbstractTokenizer';

export default class StringTokenizer extends AbstractTokenizer {
  constructor(source: string, offset: number) {
    super(source, offset, 'String');
  }

  public accepts(char: string): boolean {
    return char === '"';
  }

  public tokenize(): ITokenizeResult {
    while (!this.endOfSource()) {
      const char = this.getCurrentChar();

      this.gotoNextChar();

      switch (char) {
        case '"':
          return this.createResult();

        case '\\':
          this.parseEscapeChar();
          break;

        default:
          this.appendTokenValue(char);
      }
    }

    this.throw('Unclosed string literal');
  }

  private parseEscapeChar(): void {
    if (this.endOfSource()) {
      this.throw('Unterminated escape');
    }

    this.appendTokenValue(this.getCurrentChar());

    this.gotoNextChar();
  }
}
