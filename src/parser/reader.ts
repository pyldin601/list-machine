export function* readFromString(code: string): IterableIterator<number> {
  const codeLength = code.length;
  for (let i = 0; i < codeLength; i += 1) {
    yield code.charCodeAt(i);
  }
}
