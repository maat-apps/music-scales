import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@maat-apps/ui/select";
import {
  SettingsRow,
  SettingsSection,
} from "@maat-apps/ui/settings-primitives";
import { Switch } from "@maat-apps/ui/switch";
import { useAppSettings } from "../../hooks/use-app-settings";
import { useTranslation } from "../../i18n/use-translation";
import { setKeyboardPrefs, setNotation } from "../../lib/app-settings";
import { OCTAVE_COUNTS, START_OCTAVES } from "../../lib/music/keyboard";

export function NotationSection() {
  const { t } = useTranslation();
  const { notation } = useAppSettings();

  return (
    <SettingsSection title={t("sectionNotation")}>
      <SettingsRow
        title={t("polishNotation")}
        description={t("polishNotationDescription")}
        action={
          <Switch
            checked={notation === "polish"}
            aria-label={t("polishNotation")}
            onCheckedChange={(checked) =>
              setNotation(checked ? "polish" : "international")
            }
          />
        }
      />
    </SettingsSection>
  );
}

/** A small select of numbers, for the keyboard's octave settings. */
function NumberSelect<T extends number>({
  label,
  value,
  options,
  format,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  format: (value: number) => string;
  onChange: (value: T) => void;
}) {
  return (
    <Select
      value={String(value)}
      onValueChange={(selected) => {
        const option = options.find((choice) => String(choice) === selected);
        if (option !== undefined) onChange(option);
      }}
    >
      <SelectTrigger className="w-auto min-w-20 text-sm" aria-label={label}>
        <SelectValue>
          {(selected: string) => format(Number(selected))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={String(option)}>
            {format(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function KeyboardSection() {
  const { t } = useTranslation();
  const { keyboard } = useAppSettings();

  return (
    <SettingsSection title={t("sectionKeyboard")}>
      <SettingsRow
        title={t("octaves")}
        description={t("octavesDescription")}
        action={
          <NumberSelect
            label={t("octaves")}
            value={keyboard.octaves}
            options={OCTAVE_COUNTS}
            format={String}
            onChange={(octaves) => setKeyboardPrefs({ octaves })}
          />
        }
      />
      <SettingsRow
        title={t("startOctave")}
        description={t("startOctaveDescription")}
        action={
          <NumberSelect
            label={t("startOctave")}
            value={keyboard.startOctave}
            options={START_OCTAVES}
            format={(octave) => `C${octave}`}
            onChange={(startOctave) => setKeyboardPrefs({ startOctave })}
          />
        }
      />
    </SettingsSection>
  );
}
