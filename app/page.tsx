'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { localDatabase, type FoodItemDraftRecord } from '@/client-db';
import {
  createFoodItem,
  FOOD_ITEM_UNITS,
  transitionFoodItem,
  validateFoodItemDraft,
  type FoodDateType,
  type FoodItem,
  type FoodItemDecision,
  type FoodItemDraft,
  type FoodItemErrors,
  type FoodItemField,
  type FoodItemStatus,
  type FoodItemUnit,
} from '@/domain/food-item';

const emptyDraft: FoodItemDraft = {
  name: '',
  quantity: '',
  unit: '',
  dateType: '',
  date: '',
  decision: '',
  allergenNotes: '',
};

function draftLabel(status: 'empty' | 'saving' | 'saved' | 'unsaved' | 'error') {
  switch (status) {
    case 'empty':
      return 'No saved draft.';
    case 'saving':
      return 'Saving this draft on this device…';
    case 'saved':
      return 'Draft saved in this browser.';
    case 'unsaved':
      return 'Unsaved changes — saving locally.';
    case 'error':
      return 'Draft could not be saved to this browser.';
  }
}

function statusLabel(status: FoodItemStatus) {
  switch (status) {
    case 'in-stock':
      return 'In stock';
    case 'used':
      return 'Marked used';
    case 'discarded':
      return 'Marked discarded';
  }
}

function dateTypeLabel(dateType: FoodDateType) {
  return dateType === 'use-by' ? 'Use by' : 'Best before';
}

function decisionLabel(decision: FoodItemDecision) {
  return decision === 'use' ? 'My plan: use' : 'My plan: discard';
}

export default function HomePage() {
  const [draft, setDraft] = useState<FoodItemDraft>(emptyDraft);
  const draftRef = useRef<FoodItemDraft>(emptyDraft);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const revisionRef = useRef(0);
  const [draftStatus, setDraftStatus] = useState<'empty' | 'saving' | 'saved' | 'unsaved' | 'error'>('empty');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [phase, setPhase] = useState<'edit' | 'review'>('edit');
  const [errors, setErrors] = useState<FoodItemErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.all([
      localDatabase.drafts.get('active'),
      localDatabase.foodItems.orderBy('createdAt').reverse().toArray(),
    ])
      .then(([savedDraft, savedItems]) => {
        if (!active) return;
        if (savedDraft) {
          const values: FoodItemDraft = {
            name: savedDraft.name,
            quantity: savedDraft.quantity,
            unit: savedDraft.unit,
            dateType: savedDraft.dateType,
            date: savedDraft.date,
            decision: savedDraft.decision,
            allergenNotes: savedDraft.allergenNotes,
          };
          draftRef.current = values;
          setDraft(values);
          setDraftStatus('saved');
        }
        setItems(savedItems);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError('Local browser storage could not be opened. Your entries have not been saved.');
        setDraftStatus('error');
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function updateDraft<K extends FoodItemField>(field: K, value: FoodItemDraft[K]) {
    const next = { ...draftRef.current, [field]: value } as FoodItemDraft;
    draftRef.current = next;
    setDraft(next);
    setDraftStatus('unsaved');
    setErrors((current) => {
      if (!current[field]) return current;
      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
    setActionError('');
    setMessage('');

    const revision = ++revisionRef.current;
    const record: FoodItemDraftRecord = { id: 'active', ...next, updatedAt: Date.now() };
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => localDatabase.drafts.put(record))
      .then(() => {
        if (revision === revisionRef.current) setDraftStatus('saved');
      })
      .catch(() => {
        if (revision === revisionRef.current) setDraftStatus('error');
      });
  }

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateFoodItemDraft(draftRef.current);
    setErrors(result.ok ? {} : result.errors);
    setMessage('');
    if (!result.ok) {
      const firstError = Object.keys(result.errors)[0] as FoodItemField | undefined;
      if (firstError) window.requestAnimationFrame(() => document.getElementById('food-' + firstError)?.focus());
      return;
    }

    setIsWorking(true);
    setDraftStatus('saving');
    try {
      await writeQueueRef.current;
      await localDatabase.drafts.put({ id: 'active', ...draftRef.current, updatedAt: Date.now() });
      setDraftStatus('saved');
      setPhase('review');
    } catch {
      setDraftStatus('error');
      setActionError('The draft could not be saved. Check browser storage and try again.');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleSaveItem() {
    const result = validateFoodItemDraft(draftRef.current);
    if (!result.ok) {
      setErrors(result.errors);
      setPhase('edit');
      return;
    }

    setIsWorking(true);
    setActionError('');
    try {
      await writeQueueRef.current;
      await localDatabase.drafts.put({ id: 'active', ...draftRef.current, updatedAt: Date.now() });
      const item = createFoodItem(result.value);
      await localDatabase.transaction('rw', localDatabase.foodItems, localDatabase.drafts, async () => {
        await localDatabase.foodItems.add(item);
        await localDatabase.drafts.delete('active');
      });
      setItems((current) => [item, ...current]);
      const nextDraft = { ...emptyDraft };
      draftRef.current = nextDraft;
      setDraft(nextDraft);
      setDraftStatus('empty');
      setErrors({});
      setPhase('edit');
      setMessage('Item saved in this browser. It has not been synced.');
    } catch {
      setDraftStatus('error');
      setActionError('The item could not be saved. Your draft is still on this device if browser storage is working.');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleStatusChange(item: FoodItem, status: Exclude<FoodItemStatus, 'in-stock'>) {
    if (
      status === 'discarded' &&
      !window.confirm(
        'Record that you chose to discard ' + item.name + '? This does not assess food safety.',
      )
    ) {
      return;
    }
    setActionError('');
    try {
      const updated = transitionFoodItem(item, status);
      await localDatabase.foodItems.put(updated);
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      setMessage(status === 'used' ? 'Item marked as used.' : 'Item marked as discarded.');
    } catch {
      setActionError('This item could not be updated in browser storage.');
    }
  }

  async function handleDelete(item: FoodItem) {
    const confirmed = window.confirm(
      'Permanently delete ' + item.name + ' from this browser? This cannot be undone.',
    );
    if (!confirmed) return;

    setActionError('');
    try {
      await localDatabase.foodItems.delete(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setMessage('Item permanently deleted from this browser.');
    } catch {
      setActionError('This item could not be deleted from browser storage.');
    }
  }

  function errorFor(field: FoodItemField) {
    const error = errors[field];
    return error ? (
      <p id={'food-' + field + '-error'} className="mt-1 text-sm text-red-700" role="alert">
        {error}
      </p>
    ) : null;
  }

  function describedBy(field: FoodItemField, hintId?: string) {
    const ids = [hintId, errors[field] ? 'food-' + field + '-error' : undefined].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold text-emerald-800">Use Food First</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Household food list</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-700">
            Record an item, the date label printed on it, and your own intended action.
          </p>
        </header>

        <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-5" aria-labelledby="safety-title">
          <h2 id="safety-title" className="font-semibold">Dates are records, not safety advice</h2>
          <p className="mt-2 leading-6 text-slate-800">
            Use-by and best-before are kept distinct as printed. This app does not assess whether food is safe
            and never infers safety from a date. Check package instructions and allergen information; a blank
            allergen note does not mean an item is allergen-free.
          </p>
        </section>

        {loadError ? (
          <p className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-900" role="alert">
            {loadError}
          </p>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="entry-title">
          <h2 id="entry-title" className="text-xl font-semibold">
            {phase === 'edit' ? 'Add a food item' : 'Review your item'}
          </h2>
          {phase === 'edit' ? (
            <form className="mt-6 space-y-5" onSubmit={handleReview} noValidate>
              <div>
                <label className="block font-medium" htmlFor="food-name">Item name</label>
                <input
                  id="food-name"
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  autoComplete="off"
                  required
                  maxLength={100}
                  value={draft.name}
                  onChange={(event) => updateDraft('name', event.target.value)}
                  disabled={isLoading || isWorking}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy('name', 'food-name-hint')}
                />
                <p id="food-name-hint" className="mt-1 text-sm text-slate-600">Use a short name you recognize.</p>
                {errorFor('name')}
              </div>

              <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
                <div>
                  <label className="block font-medium" htmlFor="food-quantity">Quantity</label>
                  <input
                    id="food-quantity"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                    type="number"
                    required
                    min="0.001"
                    max="1000000"
                    step="0.001"
                    inputMode="decimal"
                    value={draft.quantity}
                    onChange={(event) => updateDraft('quantity', event.target.value)}
                    disabled={isLoading || isWorking}
                    aria-invalid={Boolean(errors.quantity)}
                    aria-describedby={describedBy('quantity', 'food-quantity-hint')}
                  />
                  <p id="food-quantity-hint" className="mt-1 text-sm text-slate-600">Positive amount, up to three decimal places.</p>
                  {errorFor('quantity')}
                </div>
                <div>
                  <label className="block font-medium" htmlFor="food-unit">Unit</label>
                  <select
                    id="food-unit"
                    required
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                    value={draft.unit}
                    onChange={(event) => updateDraft('unit', event.target.value as FoodItemUnit | '')}
                    disabled={isLoading || isWorking}
                    aria-invalid={Boolean(errors.unit)}
                    aria-describedby={describedBy('unit')}
                  >
                    <option value="">Choose a unit</option>
                    {FOOD_ITEM_UNITS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {errorFor('unit')}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block font-medium" htmlFor="food-date-type">Date label</label>
                  <select
                    id="food-date-type"
                    required
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                    value={draft.dateType}
                    onChange={(event) => updateDraft('dateType', event.target.value as FoodDateType | '')}
                    disabled={isLoading || isWorking}
                    aria-invalid={Boolean(errors.dateType)}
                    aria-describedby={describedBy('dateType', 'food-date-type-hint')}
                  >
                    <option value="">Choose the printed label</option>
                    <option value="use-by">Use by</option>
                    <option value="best-before">Best before</option>
                  </select>
                  <p id="food-date-type-hint" className="mt-1 text-sm text-slate-600">Select the wording printed on the package.</p>
                  {errorFor('dateType')}
                </div>
                <div>
                  <label className="block font-medium" htmlFor="food-date">Date</label>
                  <input
                    id="food-date"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                    type="date"
                    required
                    value={draft.date}
                    onChange={(event) => updateDraft('date', event.target.value)}
                    disabled={isLoading || isWorking}
                    aria-invalid={Boolean(errors.date)}
                    aria-describedby={describedBy('date', 'food-date-hint')}
                  />
                  <p id="food-date-hint" className="mt-1 text-sm text-slate-600">Past dates can be recorded too.</p>
                  {errorFor('date')}
                </div>
              </div>

              <fieldset>
                <legend className="font-medium">My intended action</legend>
                <p id="food-decision-hint" className="mt-1 text-sm text-slate-600">
                  This is your choice, not a recommendation or safety result.
                </p>
                <div className="mt-3 flex flex-wrap gap-5">
                  <label className="inline-flex items-center gap-2">
                    <input
                      id="food-decision-use"
                      type="radio"
                      name="food-decision"
                      value="use"
                      required
                      checked={draft.decision === 'use'}
                      onChange={() => updateDraft('decision', 'use')}
                      disabled={isLoading || isWorking}
                      aria-describedby={describedBy('decision', 'food-decision-hint')}
                    />
                    Plan to use
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      id="food-decision-discard"
                      type="radio"
                      name="food-decision"
                      value="discard"
                      required
                      checked={draft.decision === 'discard'}
                      onChange={() => updateDraft('decision', 'discard')}
                      disabled={isLoading || isWorking}
                      aria-describedby={describedBy('decision', 'food-decision-hint')}
                    />
                    Plan to discard
                  </label>
                </div>
                {errorFor('decision')}
              </fieldset>

              <div>
                <label className="block font-medium" htmlFor="food-allergens">Allergen note (optional)</label>
                <textarea
                  id="food-allergens"
                  className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2"
                  maxLength={250}
                  value={draft.allergenNotes}
                  onChange={(event) => updateDraft('allergenNotes', event.target.value)}
                  disabled={isLoading || isWorking}
                  aria-invalid={Boolean(errors.allergenNotes)}
                  aria-describedby={describedBy('allergenNotes', 'food-allergens-hint')}
                />
                <p id="food-allergens-hint" className="mt-1 text-sm text-slate-600">
                  Copy a note from the package if useful. This app does not verify allergens.
                </p>
                {errorFor('allergenNotes')}
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-700" role="status" aria-live="polite">
                  {isLoading ? 'Loading local data…' : draftLabel(draftStatus)}
                </p>
                <button
                  className="rounded-md bg-emerald-800 px-4 py-2.5 font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isLoading || isWorking || Boolean(loadError)}
                >
                  {isWorking ? 'Saving draft…' : 'Review item'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-sm text-slate-600">Item</dt><dd className="mt-1 font-medium">{draft.name.trim()}</dd></div>
                <div><dt className="text-sm text-slate-600">Quantity</dt><dd className="mt-1 font-medium">{draft.quantity} {draft.unit}</dd></div>
                <div><dt className="text-sm text-slate-600">Printed date label</dt><dd className="mt-1 font-medium">{draft.dateType ? dateTypeLabel(draft.dateType) : ''}</dd></div>
                <div><dt className="text-sm text-slate-600">Date</dt><dd className="mt-1 font-medium">{draft.date}</dd></div>
                <div><dt className="text-sm text-slate-600">Intended action</dt><dd className="mt-1 font-medium">{draft.decision ? decisionLabel(draft.decision) : ''}</dd></div>
                <div><dt className="text-sm text-slate-600">Allergen note</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{draft.allergenNotes.trim() || 'No note entered'}</dd></div>
              </dl>
              <p className="rounded-md bg-amber-50 p-3 text-sm leading-6 text-slate-800">
                Review the package and allergen information yourself. The date and your plan are saved as notes;
                they do not establish whether this food is safe.
              </p>
              <p className="text-sm text-slate-700" role="status" aria-live="polite">{draftLabel(draftStatus)}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-md border border-slate-300 px-4 py-2.5 font-semibold hover:bg-slate-50"
                  type="button"
                  onClick={() => setPhase('edit')}
                  disabled={isWorking}
                >
                  Back to edit
                </button>
                <button
                  className="rounded-md bg-emerald-800 px-4 py-2.5 font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={() => void handleSaveItem()}
                  disabled={isWorking || Boolean(loadError)}
                >
                  {isWorking ? 'Saving locally…' : 'Save on this device'}
                </button>
              </div>
            </div>
          )}
          {actionError ? <p className="mt-4 text-sm text-red-800" role="alert">{actionError}</p> : null}
          {message ? <p className="mt-4 text-sm text-emerald-900" role="status" aria-live="polite">{message}</p> : null}
        </section>

        <section className="mt-8" aria-labelledby="items-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="items-title" className="text-2xl font-semibold">Saved items</h2>
              <p className="mt-1 text-sm text-slate-700">Stored in this browser. Sync is not configured.</p>
            </div>
            <p className="text-sm text-slate-600" aria-label="Synchronization status">Not synced</p>
          </div>

          {isLoading ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-white p-5" role="status">Loading saved items…</p>
          ) : loadError ? (
            <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900" role="alert">
              Saved items could not be loaded from this browser.
            </p>
          ) : items.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-700">
              No saved food items yet. Your records stay on this device until you delete them or clear browser storage.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {items.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="mt-1 text-slate-700">{item.quantity} {item.unit} · {dateTypeLabel(item.dateType)}: {item.date}</p>
                      <p className="mt-1 text-sm text-slate-700">{decisionLabel(item.decision)} · {statusLabel(item.status)}</p>
                    </div>
                    <button
                      className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50"
                      type="button"
                      onClick={() => void handleDelete(item)}
                      aria-label={'Delete ' + item.name + ' from this device'}
                    >
                      Delete
                    </button>
                  </div>
                  {item.allergenNotes ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <span className="font-medium">Allergen note:</span> {item.allergenNotes}
                    </p>
                  ) : null}
                  {item.status === 'in-stock' ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        type="button"
                        onClick={() => void handleStatusChange(item, 'used')}
                        aria-label={'Mark ' + item.name + ' as used'}
                      >
                        Mark used
                      </button>
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        type="button"
                        onClick={() => void handleStatusChange(item, 'discarded')}
                        aria-label={'Mark ' + item.name + ' as discarded'}
                      >
                        Mark discarded
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-700">
          <p>Local records are not synced, encrypted, or backed up. Delete an item here or clear this browser&apos;s site data to remove local records.</p>
        </footer>
      </div>
    </main>
  );
}
