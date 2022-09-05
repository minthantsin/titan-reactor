import settingsStore from "@stores/settings-store";
import { getAppSettingsLevaConfigField } from "common/get-app-settings-leva-config";
import {
  MacroConditionAppSetting,
  MacroConditionComparator,
} from "common/types";
import ErrorBoundary from "../../error-boundary";
import { AppSettingsDropDown } from "../app-settings-dropdown";
import { MacroConditionComparatorSelector } from "./macro-condition-comparator-selector";
import { MacroConditionModifyValue } from "./macro-condition-modify-value";
import { MacroConditionPanelProps } from "./macro-condition-panel";

export const MacroConditionPanelHost = (
  props: MacroConditionPanelProps & { condition: MacroConditionAppSetting }
) => {
  const settings = settingsStore();
  const { condition, viewOnly, updateMacroCondition } = props;
  const propConfig = {
    ...getAppSettingsLevaConfigField(settings, condition.field),
    value: condition.value,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto",
        gridGap: "var(--size-3)",
        alignItems: "center",
        justifyContent: "start",
      }}
    >
      <AppSettingsDropDown
        onChange={(evt) => {
          updateMacroCondition({
            ...condition,
            field: evt.target.value.split("."),
            comparator: MacroConditionComparator.Equals,
            value: undefined,
          });
        }}
        value={condition.field.join(".")}
        disabled={viewOnly}
      />
      <ErrorBoundary message="Error with comparators">
        <MacroConditionComparatorSelector {...props} />
      </ErrorBoundary>
      {viewOnly && (
        <p
          style={{
            background: "var(--green-0)",
            paddingBlock: "var(--size-2)",
            borderRadius: "var(--radius-2)",
            paddingInline: "var(--size-3)",
            color: "var(--green-9)",
          }}
        >
          {condition.comparator} {condition.value}
        </p>
      )}

      {!viewOnly && condition.value !== undefined && propConfig !== undefined && (
        <ErrorBoundary message="Error with modifier">
          <MacroConditionModifyValue {...props} config={propConfig} />
        </ErrorBoundary>
      )}
    </div>
  );
};
