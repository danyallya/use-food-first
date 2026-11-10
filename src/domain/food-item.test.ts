import { describe, expect, it } from 'vitest';
import {
  createFoodItem,
  transitionFoodItem,
  validateFoodItemDraft,
  type FoodItemDraft,
} from './food-item';

const validDraft: FoodItemDraft = {
  name: '  Lentils  ',
  quantity: '1.25',
  unit: 'pack',
  dateType: 'best-before',
  date: '2028-02-29',
  decision: 'use',
  allergenNotes: '  Check the package label  ',
};

describe('food item validation', () => {
  it('normalizes a valid item and preserves its date type and personal decision', () => {
    expect(validateFoodItemDraft(validDraft)).toEqual({
      ok: true,
      value: {
        name: 'Lentils',
        quantity: 1.25,
        unit: 'pack',
        dateType: 'best-before',
        date: '2028-02-29',
        decision: 'use',
        allergenNotes: 'Check the package label',
      },
    });
  });

  it('requires a name, positive bounded quantity, unit, date type, date and decision', () => {
    const result = validateFoodItemDraft({
      name: ' ',
      quantity: '0',
      unit: '',
      dateType: '',
      date: '',
      decision: '',
      allergenNotes: '',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toMatchObject({
      name: expect.any(String),
      quantity: expect.any(String),
      unit: expect.any(String),
      dateType: expect.any(String),
      date: expect.any(String),
      decision: expect.any(String),
    });
  });

  it('accepts quantity boundaries and rejects excess precision, exponent notation and overflow', () => {
    for (const quantity of ['0.001', '1', '1000000']) {
      expect(validateFoodItemDraft({ ...validDraft, quantity }).ok).toBe(true);
    }
    for (const quantity of ['0', '-1', '1000000.001', '1.0001', '1e3', '1,5']) {
      expect(validateFoodItemDraft({ ...validDraft, quantity }).ok).toBe(false);
    }
  });

  it('validates real calendar dates and accepts old dates without judging food safety', () => {
    expect(validateFoodItemDraft({ ...validDraft, date: '2024-02-29' }).ok).toBe(true);
    expect(validateFoodItemDraft({ ...validDraft, date: '2000-10-27' }).ok).toBe(true);
    expect(validateFoodItemDraft({ ...validDraft, date: '9999-12-31' }).ok).toBe(true);
    expect(validateFoodItemDraft({ ...validDraft, date: '0000-01-01' }).ok).toBe(false);
    expect(validateFoodItemDraft({ ...validDraft, date: '2023-02-29' }).ok).toBe(false);
    expect(validateFoodItemDraft({ ...validDraft, date: '2026-04-31' }).ok).toBe(false);
    expect(validateFoodItemDraft({ ...validDraft, date: '2026-2-01' }).ok).toBe(false);
  });

  it('keeps use-by and best-before as distinct required values', () => {
    expect(validateFoodItemDraft({ ...validDraft, dateType: 'use-by' }).ok).toBe(true);
    expect(validateFoodItemDraft({ ...validDraft, dateType: '' }).ok).toBe(false);
    expect(
      validateFoodItemDraft({ ...validDraft, dateType: 'expiry' } as unknown as FoodItemDraft).ok,
    ).toBe(false);
  });

  it('rejects units and intended actions outside the supported choices', () => {
    expect(
      validateFoodItemDraft({ ...validDraft, unit: 'crate' } as unknown as FoodItemDraft).ok,
    ).toBe(false);
    expect(
      validateFoodItemDraft({ ...validDraft, decision: 'donate' } as unknown as FoodItemDraft).ok,
    ).toBe(false);
  });

  it('bounds allergen notes and accepts an empty note without claiming allergen safety', () => {
    expect(validateFoodItemDraft({ ...validDraft, allergenNotes: '' }).ok).toBe(true);
    expect(validateFoodItemDraft({ ...validDraft, allergenNotes: 'x'.repeat(251) }).ok).toBe(false);
    expect(validateFoodItemDraft({ ...validDraft, allergenNotes: 'contains\u0000control' }).ok).toBe(false);
  });
});

describe('food item lifecycle and serialization', () => {
  it('creates a local record with deterministic timestamps and in-stock status', () => {
    const result = validateFoodItemDraft(validDraft);
    if (!result.ok) throw new Error('Test fixture must be valid.');
    expect(
      createFoodItem(result.value, {
        id: 'item-1',
        now: new Date('2026-10-28T09:30:00.000Z'),
      }),
    ).toEqual({
      ...result.value,
      id: 'item-1',
      status: 'in-stock',
      createdAt: '2026-10-28T09:30:00.000Z',
      updatedAt: '2026-10-28T09:30:00.000Z',
    });
  });

  it('allows an in-stock item to be completed once as used or discarded', () => {
    const result = validateFoodItemDraft(validDraft);
    if (!result.ok) throw new Error('Test fixture must be valid.');
    const createdAt = new Date('2026-10-28T09:30:00Z');
    const item = createFoodItem(result.value, { id: 'item-1', now: createdAt });
    expect(transitionFoodItem(item, 'used', createdAt).status).toBe('used');
    expect(transitionFoodItem(item, 'used', new Date('2026-10-29T10:00:00Z'))).toMatchObject({
      status: 'used',
      updatedAt: '2026-10-29T10:00:00.000Z',
    });
    expect(transitionFoodItem(item, 'discarded', createdAt).status).toBe('discarded');
    expect(() => transitionFoodItem(item, 'used', new Date('2026-10-28T09:29:59Z'))).toThrow();
    expect(() => transitionFoodItem({ ...item, status: 'used' }, 'discarded')).toThrow();
  });

  it('round-trips through JSON without losing domain fields', () => {
    const result = validateFoodItemDraft(validDraft);
    if (!result.ok) throw new Error('Test fixture must be valid.');
    const item = createFoodItem(result.value, { id: 'item-1', now: new Date('2026-10-28T09:30:00Z') });
    expect(JSON.parse(JSON.stringify(item))).toEqual(item);
  });
});
