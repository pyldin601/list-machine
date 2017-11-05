export interface IToken {
  type: string;
  value: string;
}

export interface ITokenizeResult {
  offset: number,
  nextOffset: number,
  token: IToken,
}

export default class AbstractTokenizer {
  protected source: string;
  protected offset: number;
  protected nextOffset: number;
  protected type: string;
  protected value: string;

  constructor(source: string, offset: number, type: string) {
    this.source = source;
    this.offset = offset;
    this.nextOffset = offset;
    this.type = type;
    this.value = '';
  }

  public accepts(char: string): boolean {
    throw new Error('Method should be implemented');
  }

  public tokenize(): ITokenizeResult {
    throw new Error('Method should be implemented');
  }

  protected endOfSource(): boolean {
    return this.offset >= this.source.length;
  }

  protected gotoNextChar(): void {
    this.nextOffset += 1;
  }

  protected getCurrentChar(): string {
    return this.source[this.nextOffset];
  }

  protected appendTokenValue(char: string): void {
    this.value += char;
  }

  protected createToken(): IToken {
    return {
      type: this.type,
      value: this.value,
    };
  }

  protected createResult(): ITokenizeResult {
    return {
      nextOffset: this.nextOffset,
      offset: this.offset,
      token: this.createToken(),
    };
  }

  protected throw(message: string) {
    throw new Error(`${message} as offset ${this.offset}`);
  }
}
