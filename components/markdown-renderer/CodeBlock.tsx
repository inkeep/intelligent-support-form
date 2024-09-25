'use client';

import { Highlight, type PrismTheme, themes } from 'prism-react-renderer';

const defaultLight = themes.oneLight;

interface CodeBlockProps {
  codeString: string;
  language: string;
  highlighterTheme?: PrismTheme;
}

function CodeBlock({ codeString, language, highlighterTheme = defaultLight }: CodeBlockProps) {
  return (
    <Highlight theme={highlighterTheme} code={codeString} language={language}>
      {({ className: highlighterClassName, style, tokens, getLineProps, getTokenProps }) => (
        <div
          className={`${highlighterClassName}`}
          style={{
            ...style,
            fontSize: '0.78rem',
            overflowX: 'auto',
            padding: '1rem',
            whiteSpace: 'pre',
            margin: '0px 0px 0.5em',
            background: 'transparent',
          }}
        >
          <code className="font-mono">
            {tokens.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={i} {...getLineProps({ line })}>
                {line.map((codeToken, key) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <span key={key} {...getTokenProps({ token: codeToken })} />
                ))}
              </div>
            ))}
          </code>
        </div>
      )}
    </Highlight>
  );
}
export default CodeBlock;
