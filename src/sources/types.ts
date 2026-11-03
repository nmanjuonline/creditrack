/**
 * Data Source Contracts
 * Compliant with Edge-First Serverless Application Architecture
 */

import type { CardBenefits } from '../types/card';

export interface CardQueryInput {
  bankName: string;
  cardName: string;
  forceLive?: boolean;
}

export interface CardBenefitsOutput {
  benefits: CardBenefits;
  source: 'ai' | 'catalog' | 'default';
  message?: string;
  fetchedAt: string;
}

export interface DataSource<TInput, TOutput> {
  name: string;
  fetch(input: TInput): Promise<TOutput>;
  isTransientError(error: unknown): boolean;
}
