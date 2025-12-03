// Map of internal noReasonCode → concise human-readable rationale

export const REASONS = {
  heuristic_pre_no_micro_ui: 'cosmetic UI-only change detected by heuristics',
  heuristic_pre_no_regression_restore: 'regression or restore to expected behavior detected by heuristics',
  heuristic_pre_no_bug_weak_signals: 'bug fix without clear feature config API impact',
  llm_downgrade_micro_ui: 'LLM suggested changes but micro UI-only under conservative policy',
  llm_downgrade_regression_restore: 'LLM suggested changes but restore to expected behavior under conservative policy',
  llm_downgrade_coverage_match: 'end behavior appears already documented in the docs',
  llm_downgrade_invalid_targets: 'targets invalid or unresolvable to known docs pages',
  conservative_guard_no_strong_signals: 'bug fix without strong docs signals under conservative policy',
  llm_downgrade_bug_without_strong_signals: 'bug fix without strong config API schema migration signals under conservative policy',
};

