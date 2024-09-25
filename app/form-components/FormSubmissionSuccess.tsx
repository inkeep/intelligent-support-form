import { CircleCheck } from 'lucide-react';

export function FormSubmissionSuccess() {
  return (
    <div className="flex flex-col items-center justify-center mx-1 pt-12 pb-6">
      <CircleCheck className="w-6 h-6 text-green-500 mb-5" />
      <h2 className="text-xl font-semibold mb-3 tracking-tight">Thank you!</h2>
      <p className="text-gray-600">We&apos;ll be in touch soon.</p>
    </div>
  );
}
