import {
  Transaction,
  SplitTransaction,
  InvestmentTransaction,
  TransferDictionary,
} from "client";
import type { TransactionsPageType } from "client/components";

/** Cross-row state every predicate consults — captured once on
 *  `TypePredicates` construction so per-row predicates stay one-liners. */
export interface FilterContext {
  transfers: TransferDictionary;
}

/** User has explicitly acted on this row's category — `confidence` 1
 *  (confirmed) or 0 (rejected). Engine-suggested rows sit in (0, 1). */
const isUserLabelConfirmed = (e: Transaction | SplitTransaction): boolean => {
  const c = e.label.category_confidence;
  return !!(e.label.category_id && (c === 1 || c === 0));
};

/** Engine-suggested category not yet acted on. Drives the Accept-All
 *  count too — same predicate, single source of truth. */
export const isSuggestedLabel = (
  e: Transaction | SplitTransaction | InvestmentTransaction,
): boolean => {
  const c = e.label.category_confidence;
  return !!(e.label.category_id && c && c > 0 && c < 1);
};

/** Splits inherit their parent's `transaction_id`, so transfer-pair
 *  lookups need to know whether the row is a real pair half. */
const isWholeTransaction = (
  e: Transaction | SplitTransaction,
): e is Transaction => e instanceof Transaction;

/** Row whose `transaction_id` belongs to a CONFIRMED pair — covers both
 *  pair halves AND splits of one, mirroring `getBudgetData`'s exclusion
 *  (a split is a sibling of the half, not a half itself; named `isIn…`
 *  to capture "the row is part of the transfer"). */
export const isInConfirmedTransfer = (
  e: Transaction | SplitTransaction,
  ctx: FilterContext,
): boolean => ctx.transfers.byTransactionId.hasConfirmed(e.transaction_id);

/** Whole Transaction that IS a half of a SUGGESTED pair. */
const isSuggestedTransferHalf = (
  e: Transaction | SplitTransaction,
  ctx: FilterContext,
): boolean =>
  isWholeTransaction(e) && ctx.transfers.byTransactionId.hasSuggested(e.transaction_id);

/** Whole Transaction that IS a half of any pair (suggested or confirmed). */
const isTransferHalf = (
  e: Transaction | SplitTransaction,
  ctx: FilterContext,
): boolean =>
  isWholeTransaction(e) && ctx.transfers.byTransactionId.has(e.transaction_id);

type AnyRow = Transaction | SplitTransaction | InvestmentTransaction;

export type Predicate = (e: AnyRow) => boolean;

const isInvestment = (e: AnyRow): e is InvestmentTransaction =>
  e instanceof InvestmentTransaction;

/** Per-type predicates for the TransactionsPage type-filter dropdown.
 *
 *  Confirmed-transfer rows carry no budget meaning (`getBudgetData`
 *  excludes them and their splits from totals), so they're filtered
 *  out of `deposits`/`expenses`/`unsorted`/`suggested`. Suggested
 *  transfers still count toward budget until confirmed, so they stay.
 *  `transfers` is the lone render-classification filter — shows any
 *  pair half, suggested or confirmed.
 *
 *  Investment rows have no category labels and don't participate in
 *  transfer pairs — they match only the sign filters. */
export class TypePredicates {
  private context: FilterContext;

  constructor(context: FilterContext) {
    this.context = context;
  }

  deposits: Predicate = (e) =>
    isInvestment(e) ? e.amount < 0 : !isInConfirmedTransfer(e, this.context) && e.amount < 0;
  expenses: Predicate = (e) =>
    isInvestment(e) ? e.amount > 0 : !isInConfirmedTransfer(e, this.context) && e.amount > 0;
  unsorted: Predicate = (e) =>
    !isInvestment(e) && !isInConfirmedTransfer(e, this.context) && !isUserLabelConfirmed(e);
  suggested: Predicate = (e) =>
    !isInvestment(e) &&
    !isInConfirmedTransfer(e, this.context) &&
    (isSuggestedLabel(e) || isSuggestedTransferHalf(e, this.context));
  transfers: Predicate = (e) => !isInvestment(e) && isTransferHalf(e, this.context);

  /** OR the named types. Empty list = match everything. */
  any =
    (types: TransactionsPageType[]): Predicate =>
    (e) => {
      if (!types.length) return true;
      return types.some((t) => this[t](e));
    };
}
