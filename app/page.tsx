import { AI } from "./ai/IntelligentFormAIConfig";
import IntelligentForm from "./form-components/IntelligentForm";

export const maxDuration = 300;

export default function Home() {
  return (
    <AI>
      <IntelligentForm />
    </AI>
  );
}
