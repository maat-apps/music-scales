import { AppSection } from "./settings-app-section";
import { LanguageSection } from "./settings-language-section";
import { KeyboardSection, NotationSection } from "./settings-music-sections";
import { SecuritySection } from "./settings-security-section";

export function SettingsPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
      <NotationSection />
      <KeyboardSection />
      <LanguageSection />
      <SecuritySection />
      <AppSection />
    </div>
  );
}
