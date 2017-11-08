export default class Accumulator {
  private buffer: string;
  constructor() {
    this.init();
  }
  public add(charCode: number) {
    this.buffer += String.fromCharCode(charCode);
  }
  public equals(value: string): boolean {
    return this.buffer === value;
  }
  public getAndInit(): string {
    const value = this.buffer;
    this.init();
    return value;
  }
  public clean(): void {
    this.buffer = '';
  }
  public isFilled() {
    return this.buffer.length > 0;
  }
  private init() {
    this.buffer = '';
  }
}
