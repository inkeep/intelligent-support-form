import { ChevronRight } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-2 text-gray-600 flex text-sm px-6">
      <div className="flex justify-between items-center w-full">
        <div className="flex-1 font-semibold mx-2 flex-shrink-0 whitespace-nowrap text-gray-500">Demo mode</div>
        <div className="flex-auto lg:flex-2 mx-2 truncate text-center">Form submissions will not be collected.</div>
        <div className="flex-1 mx-2 flex-shrink-0 flex items-center justify-end whitespace-nowrap">
          <a
            href="mailto:hi@inkeep.com?subject=Inkeep%20support%20copilot%20demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center font-semibold text-sky-500 hover:text-sky-700 "
          >
            Get in touch
            <ChevronRight className="w-4 h-4 opacity-80 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
}
