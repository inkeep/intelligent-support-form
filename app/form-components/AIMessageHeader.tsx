import { SparklesIcon } from "lucide-react";

const AI_BOT_NAME = "Inkeep AI";

export function AIMessageHeader() {
	return (
		<div className="flex items-center text-sky-700 text-sm font-semibold">
			<SparklesIcon className="w-4 h-4 mr-2 text-sky-400" />
			{AI_BOT_NAME}
		</div>
	);
}
