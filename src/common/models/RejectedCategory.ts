/**
 * A row in the `rejected_categories` table — records every (transaction,
 * category) pair the user has explicitly rejected.
 *
 * **What this table is for:** the rejection signal that the legacy
 * `transactions.label_*` denorm columns cannot carry. Those columns hold
 * one current label per transaction, so a user who rejected category A
 * and then accepted B leaves no record of the A rejection. This table
 * fills that single gap.
 *
 * Composite PRIMARY KEY `(transaction_id, category_id)` enforces "at most
 * one rejection row per pair." `ON CONFLICT DO UPDATE SET rejected_at =
 * NOW()` is the upsert idiom — a user who re-rejects the same category on
 * the same transaction just refreshes the timestamp.
 */
export interface JSONRejectedCategory {
  transaction_id: string;
  category_id: string;
  rejected_at: string | null;
}
