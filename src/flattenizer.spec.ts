import parse from './lexeme';

test('Test #1', () => {
  const lexemes = parse(`
    def (x)
      foo
      bar
        baz
    
    bass
  `);

  console.log(lexemes);
});
