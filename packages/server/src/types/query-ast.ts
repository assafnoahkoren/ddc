/**
 * Simplified Query AST for building database-agnostic queries against logical schemas.
 * Start simple, extend as needed.
 */

/**
 * Basic comparison operators
 */
export enum QueryOperator {
  EQUALS = 'eq',
  CONTAINS = 'contains',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
}

/**
 * Logical operators for combining conditions
 */
export enum LogicalOperator {
  AND = 'and',
  OR = 'or',
}

/**
 * Comparison filter - compares a field against a value
 */
export interface ComparisonFilter {
  type: 'comparison';
  field: string;
  operator: QueryOperator;
  value: unknown;
}

/**
 * Logical filter - combines multiple conditions
 */
export interface LogicalFilter {
  type: 'logical';
  operator: LogicalOperator;
  conditions: FilterCondition[];
}

/**
 * Union type for filter conditions
 */
export type FilterCondition = ComparisonFilter | LogicalFilter;

/**
 * Simplified Query AST
 */
export interface QueryAST {
  logicalSchemaId: string;
  select?: string[]; // field names
  where?: FilterCondition;
  limit?: number;
}

/**
 * Helper functions to create filters
 */
export const Filters = {
  eq: (field: string, value: unknown): ComparisonFilter => ({
    type: 'comparison',
    field,
    operator: QueryOperator.EQUALS,
    value,
  }),

  contains: (field: string, value: string): ComparisonFilter => ({
    type: 'comparison',
    field,
    operator: QueryOperator.CONTAINS,
    value,
  }),

  gt: (field: string, value: unknown): ComparisonFilter => ({
    type: 'comparison',
    field,
    operator: QueryOperator.GREATER_THAN,
    value,
  }),

  lt: (field: string, value: unknown): ComparisonFilter => ({
    type: 'comparison',
    field,
    operator: QueryOperator.LESS_THAN,
    value,
  }),

  and: (...conditions: FilterCondition[]): LogicalFilter => ({
    type: 'logical',
    operator: LogicalOperator.AND,
    conditions,
  }),

  or: (...conditions: FilterCondition[]): LogicalFilter => ({
    type: 'logical',
    operator: LogicalOperator.OR,
    conditions,
  }),
};
