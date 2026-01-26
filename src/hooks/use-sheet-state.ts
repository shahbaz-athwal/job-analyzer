"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

const SHEET_TYPES = ["create-job", "apply"] as const;
type SheetType = (typeof SHEET_TYPES)[number];

export function useSheetState() {
  const [sheet, setSheet] = useQueryState(
    "sheet",
    parseAsStringLiteral(SHEET_TYPES).withOptions({ history: "push" })
  );

  const openSheet = (type: SheetType) => setSheet(type);
  const closeSheet = () => setSheet(null);
  const isOpen = (type: SheetType) => sheet === type;

  return {
    sheet,
    openSheet,
    closeSheet,
    isOpen,
    setSheet,
  };
}
