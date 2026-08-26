---
layout: ../../layouts/MatchLayout.astro
title: "Director and Executor"
subtitle: "Why AI Agents Don't Take Vacations (And Why You Can't Either)"
innings: post-game
chapter: director-and-executor
meta: "12 min · who owns the toss"
lede: "Hand an agent the dataset and it will happily hand you back a model — confidently, quickly, and sometimes built on a rule it invented to get there. The agent can run the drill. It cannot decide what the drill is for."
commentary: "'The kit man doesn't set the batting order.' — Head Coach"
codeFile: post_game/guardrails.py
codeOut: "split rejected: val window starts before train window ends"
code: |
  def make_split(df, cutoff_date):
      # A Director's rule, enforced in code an Executor can't route around
      train = df[df.match_date < cutoff_date]
      val = df[df.match_date >= cutoff_date]

      if val.match_date.min() <= train.match_date.max():
          raise ValueError("split rejected: val window starts before train window ends")

      return train, val
stats:
  - { k: "Owns", v: "Loss & Leakage Rules", s: "the Director (human)" }
  - { k: "Executes", v: "Sweeps & Logging", s: "the Executor (agent)" }
  - { k: "Leakage caught", v: "1 in 6 runs", s: "unguarded temporal splits" }
  - { k: "Vacation Policy", v: "None", s: "someone still owns the toss" }
---

## Nobody Actually Puts Their Feet Up

The last chapter covered the shapes an agent system can take and how its finished answer gets checked. Neither says who's actually accountable for the decisions inside it — and that gap is exactly where an agent can quietly go wrong.

"The agent builds the model, I put my feet up" is the pitch. It is also not what happens. Somebody still calls the toss — decides what question the model is answering, what a leaked feature looks like in this dataset, what a legitimate outlier is versus a data entry error, and what "good enough" means before the model ever sees a row. An agent that runs unattended doesn't remove that job. It just means nobody's doing it, which is worse than doing it slowly.

## What the Agent Is Actually Good At

None of that is a knock on what agents are genuinely excellent at: grinding through feature sweeps, running the same cross-validation fold forty times with different seeds, logging every run so nothing gets lost, trying five imputation strategies before breakfast. That's overs of legitimate, valuable graft — it's just graft *inside rules someone else set*, not the setting of the rules.

## The Team Sheet

| Task | Director (Human) | Executor (Agent) |
|---|---|---|
| **Problem formulation** | Decides what's being predicted and why it matters | Not delegated — the agent doesn't get a vote on the target column |
| **Data cleaning rules** | Sets the leakage boundary, defines a legitimate outlier | Applies the rule consistently across every column and fold |
| **Feature iteration** | Approves the feature universe (what's fair game to derive) | Generates candidates, runs the sweep, logs what each one changed |
| **Validation design** | Owns the split strategy and the metric that decides success | Executes the split, computes the metric, reports it honestly |

## How Unguided Agents Cheat

Not maliciously — an agent optimising a metric with no rules attached will take the shortest path to a good number, and the shortest path is usually a leak:

- **Temporal leakage.** Randomly shuffling rows before a train/val split, when the real deployment question is "predict the next match from the last ten," silently hands the model a peek at the future. The guarded `make_split` above exists because an unguarded version of the same function will pass every test and still be wrong.
- **Target-encoding traps.** Encoding a categorical column using the mean target *across the whole dataset*, validation rows included, quietly leaks the answer into the feature. The fix is trivial — fit the encoding on the training fold only — but nothing about "reduce validation error" tells an agent to bother.
- **Over-indexing on freak outliers.** A single once-in-a-season 200 not out drags a linear model's coefficients toward fitting that one innings instead of the other 999. An agent chasing R² will happily let it, because keeping the outlier usually *improves* the training metric it's watching.

None of these throw an error. They all report a better score. That's exactly why they need a rule sitting above the metric, not a smarter metric.

## The Brief Is the Interface

"Sets the leakage boundary" and "approves the feature universe" in the Team Sheet above are decisions, not documents — and a decision that only exists as something the Director said out loud on day one has a way of quietly eroding by day ten, once nobody remembers exactly what was agreed. The fix is the same one that already turned leakage into a guard instead of a suggestion: write the whole brief down, once, in a form the agent — and whatever checks its work afterwards — can actually check itself against.

```python
BRIEF = {
    "target": "wicket_next_over",
    "task": "classification",
    "success_metric": {"name": "f1", "min": 0.75},
    "leakage_cutoff": "match_date",
    "approved_features": ["strike_rate", "economy_rate", "phase_of_innings"],
    "forbidden_features": ["third_umpire_ruling", "postmatch_report_id"],
    "outlier_rule": "|z| > 3 on strike_rate, flagged not dropped",
}
```

Nothing here is new — the metric, the cutoff, the feature universe, and the outlier definition are the same ones already covered above. What's new is that they now live in one checkable place instead of three prose paragraphs and a Slack message. Each field closes off one of the cheats from the last section: `leakage_cutoff` closes temporal leakage, `forbidden_features` closes a known leak before an agent has to rediscover it the hard way, and `outlier_rule` closes the freak-innings problem before the sweep even starts.

**Forbidden features especially earns its own line.** Approving what's fair game is only half the job. `third_umpire_ruling` — the exact leak **Feature Selection & Hyperparameter Optimisation**'s worked example found, a column that doesn't exist until after the thing it's predicting has already happened — is precisely the kind of feature a Director who has already been burned once should rule out permanently, not leave for an agent to re-discover through `corr()` every single run.

## Ground Rules for the Handover

- **The target column and the success metric are never delegated.** They're decided before the first tool call, not discovered by the agent along the way.
- **Leakage rules live in code, not in a prompt.** A guard the agent can't argue past — like the cutoff check above — beats an instruction it can rationalise around under metric pressure.
- **Write the brief down once, not out loud.** A target, a metric with a bar, a feature allow/forbid list, and an outlier rule, in one checkable place — not scattered across a conversation nobody can re-read three runs later.
- **"Outlier" needs a definition before the sweep starts.** Otherwise the agent's definition is whatever produces the best-looking training score.
- **The agent logs everything it tried, not just what won.** A Director who only sees the final model has no way to catch a cheat that happened three attempts ago.
