export const FOOD_ITEM_UNITS = ['item', 'pack', 'g', 'kg', 'ml', 'l', 'portion'] as const;
export const FOOD_DATE_TYPES = ['use-by', 'best-before'] as const;
export const FOOD_ITEM_DECISIONS = ['use', 'discard'] as const;
export const FOOD_ITEM_STATUSES = ['in-stock', 'used', 'discarded'] as const;

export type FoodItemUnit = (typeof FOOD_ITEM_UNITS)[number];
export type FoodDateType = (typeof FOOD_DATE_TYPES)[number];
export type FoodItemDecision = (typeof FOOD_ITEM_DECISIONS)[number];
export type FoodItemStatus = (typeof FOOD_ITEM_STATUSES)[number];

export type FoodItemDraft = {
  name: string;
  quantity: string;
  unit: FoodItemUnit | '';
  dateType: FoodDateType | '';
  date: string;
  decision: FoodItemDecision | '';
  allergenNotes: string;
};

export type FoodItemInput = {
  name: string;
  quantity: number;
  unit: FoodItemUnit;
  dateType: FoodDateType;
  date: string;
  decision: FoodItemDecision;
  allergenNotes: string;
};

export type FoodItem = FoodItemInput & {
  id: string;
  status: FoodItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type FoodItemField = keyof FoodItemDraft;
export type FoodItemErrors = Partial<Record<FoodItemField, string>>;

export type FoodItemValidation =
  | { ok: true; value: FoodItemInput }
  | { ok: false; errors: FoodItemErrors };

const validDateTypes: readonly string[] = FOOD_DATE_TYPES;
const validUnits: readonly string[] = FOOD_ITEM_UNITS;
const validDecisions: readonly string[] = FOOD_ITEM_DECISIONS;
const validStatuses: readonly string[] = FOOD_ITEM_STATUSES;

function isDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  const parsed = new Date(0);
  parsed.setUTCHours(0, 0, 0, 0);
  parsed.setUTCFullYear(year, month - 1, day);
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function validateFoodItemDraft(draft: FoodItemDraft): FoodItemValidation {
  const errors: FoodItemErrors = {};
  const name = draft.name.trim();
  const quantityText = draft.quantity.trim();
  const quantity = Number(quantityText);
  const allergenNotes = draft.allergenNotes.trim();

  if (!name) errors.name = 'Enter an item name.';
  else if (name.length > 100) errors.name = 'Use 100 characters or fewer.';
  else if (/[\u0000-\u001f\u007f]/.test(name)) errors.name = 'Remove control characters from the name.';

  if (!/^(?:\d+)(?:\.\d{1,3})?$/.test(quantityText) || !Number.isFinite(quantity)) {
    errors.quantity = 'Enter a positive quantity with up to three decimal places.';
  } else if (quantity <= 0 || quantity > 1_000_000) {
    errors.quantity = 'Quantity must be greater than 0 and no more than 1,000,000.';
  }

  if (!validUnits.includes(draft.unit)) errors.unit = 'Choose a unit.';
  if (!validDateTypes.includes(draft.dateType)) errors.dateType = 'Choose use-by or best-before.';
  if (!isDateOnly(draft.date)) errors.date = 'Enter a real calendar date.';
  if (!validDecisions.includes(draft.decision)) errors.decision = 'Choose your intended action.';
  if (allergenNotes.length > 250) errors.allergenNotes = 'Use 250 characters or fewer.';
  else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(allergenNotes)) {
    errors.allergenNotes = 'Remove control characters from the note.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      quantity,
      unit: draft.unit as FoodItemUnit,
      dateType: draft.dateType as FoodDateType,
      date: draft.date,
      decision: draft.decision as FoodItemDecision,
      allergenNotes,
    },
  };
}

export function createFoodItem(
  input: FoodItemInput,
  options: { id?: string; now?: Date } = {},
): FoodItem {
  const now = options.now ?? new Date();
  if (!Number.isFinite(now.getTime())) throw new Error('A valid creation time is required.');
  const id = options.id ?? globalThis.crypto.randomUUID();
  if (!id.trim()) throw new Error('A non-empty record ID is required.');

  const createdAt = now.toISOString();
  return {
    ...input,
    id,
    status: 'in-stock',
    createdAt,
    updatedAt: createdAt,
  };
}

export function transitionFoodItem(
  item: FoodItem,
  status: Exclude<FoodItemStatus, 'in-stock'>,
  now = new Date(),
): FoodItem {
  if (!validStatuses.includes(status) || item.status !== 'in-stock') {
    throw new Error('Only in-stock items can be marked used or discarded.');
  }
  if (!Number.isFinite(now.getTime())) throw new Error('A valid update time is required.');
  const createdAt = Date.parse(item.createdAt);
  if (!Number.isFinite(createdAt) || now.getTime() < createdAt) {
    throw new Error('A status update cannot predate item creation.');
  }

  return { ...item, status, updatedAt: now.toISOString() };
}
