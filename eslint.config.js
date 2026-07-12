import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

// ponytail: a11y-only lint. flat/jsx-a11y-recommended pulls in the astro
// parser + jsx-a11y rules for .astro templates. No style/correctness rules
// here on purpose — this gate exists to block accessibility regressions, not
// bikeshed formatting.
export default [
  ...astro.configs['flat/jsx-a11y-recommended'],
  {
    // Astro frontmatter (---...---) is TypeScript; give the astro parser a TS sub-parser.
    files: ['**/*.astro'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      // <ul role="list"> is a deliberate fix: Safari drops list semantics when
      // list-style:none. The redundancy is intentional, not a mistake.
      'astro/jsx-a11y/no-redundant-roles': 'off',
    },
  },
  { ignores: ['dist/', '.astro/', 'node_modules/'] },
];
