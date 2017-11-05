export enum CharCode {
  TAB = 0x9,
  NEW_LINE = 0xA,
  SPACE = 0x20,
  DOUBLE_QUOTE = 0x22,
  APOSTROPHE = 0x27,
  LEFT_PAREN = 0x28,
  RIGHT_PAREN = 0x29,
  ASTERISK = 0x2a,
  SEMICOLON = 0x3b,
  BACKSLASH = 0x5c,
}

const charCodeNames: { [code: number]: string } = {
  0x9: 'Tab',
  0xA: 'NewLine',
  0x20: 'Space',
  0x22: 'DoubleQuote',
  0x27: 'Apostrophe',
  0x28: 'LeftParen',
  0x29: 'RightParen',
  0x2a: 'Asterisk',
  0x3b: 'Semicolon',
  0x5c: 'Backslash',
};

export const getCharName = (charCode: number): string => {
  return charCode in charCodeNames ? charCodeNames[charCode] : String.fromCharCode(charCode);
};
