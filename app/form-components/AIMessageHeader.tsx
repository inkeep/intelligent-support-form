import { SparklesIcon } from 'lucide-react';

const AI_BOT_NAME = 'Inkeep AI';

export function AIMessageHeader() {
  return (
    <div className="flex items-center text-gray-600 text-sm font-semibold">
      <div className="border bg-gradient-to-t from-gray-100 p-1 rounded-md  mr-2">
        <SparklesIcon className="w-4 h-4 text-gray-500" />
      </div>
      {AI_BOT_NAME}
    </div>
  );
}
