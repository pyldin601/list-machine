export default class Accumulator {
  private buffer: string;
  constructor() {
    this.init();
  }
  public add(charCode: number) {
    this.buffer += String.fromCharCode(charCode);
  }
  public getAndInit(): string {
    const value = this.buffer;
    this.init();
    return value;
  }
  public isFilled() {
    return this.buffer.length > 0;
  }
  private init() {
    this.buffer = '';
  }
}
