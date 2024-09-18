import CopyButton from './CopyButton';

interface CodeBlockHeaderProps {
  codeString: string;
  language: string;
}

function CodeBlockHeader({ codeString, language }: CodeBlockHeaderProps) {
  return (
    <div className="min-h-6 mb-0 flex items-center justify-between pl-4 pr-3 pt-2 text-xs leading-tight text-gray-700 dark:text-gray-400">
      <div className="flex">
        <div className="inline-flex">{language}</div>
      </div>

      <div className="flex items-center ">
        <CopyButton textToCopy={codeString} />
      </div>
    </div>
  );
}

export default CodeBlockHeader;
