export interface IToken {
  type: string,
  value: string,
  position: {
    line: number,
    column: number,
  },
}
