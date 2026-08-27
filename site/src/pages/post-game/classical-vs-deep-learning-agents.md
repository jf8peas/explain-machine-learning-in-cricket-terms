---
layout: ../../layouts/MatchLayout.astro
title: "Classical vs Deep Learning Agents"
subtitle: "From Feature Factories to Gradient Descent Supervision"
innings: post-game
chapter: classical-vs-deep-learning-agents
meta: "14 min · feature factory vs training floor"
lede: "An agent sweeping a tabular model and an agent training a network are not doing variations on the same job. One spends its overs inventing columns. The other spends them watching a loss curve for signs of trouble it can't undo after the fact."
commentary: "'One squad drills fielding positions. The other watches the scoreboard tick over ball by ball. Different net, different session.' — Data Analyst"
codeFile: post_game/training_supervisor.py
codeOut: "epoch 14 · val loss ↑ 3 in a row → lr 3e-4 → 6e-5, patience reset"
code: |
  best_val, bad_epochs = float("inf"), 0

  for epoch in range(max_epochs):
      train_loss = run_epoch(model, train_loader, optimizer)
      val_loss = evaluate(model, val_loader)

      if val_loss < best_val:
          best_val, bad_epochs = val_loss, 0
          save_checkpoint(model)
      else:
          bad_epochs += 1

      if bad_epochs == 3:
          decay_learning_rate(optimizer, factor=0.2)
          bad_epochs = 0
      if bad_epochs >= patience:
          break  # stop the innings, best checkpoint already saved
stats:
  - { k: "Tabular loop", v: "Feature Factory", s: "interactions, dummies, SHAP prune" }
  - { k: "Deep loop", v: "Training Supervisor", s: "loss curves, LR schedule, memory" }
  - { k: "Deep stop signal", v: "Val loss ↑", s: "3 epochs running" }
  - { k: "Tabular stop signal", v: "ΔScore < 0.001", s: "next candidate feature" }
---

## The Feature Factory

The last chapter drew the line between what the human Director decides and what the agent Executor carries out. What the Executor actually spends its time doing, though, depends entirely on the kind of model being built.

A tabular ML agent spends almost its entire budget on the columns, not the algorithm. Given a clean-ish dataframe, the job is to manufacture candidate features, check each one earns its place, and discard the rest before they start eating signal from something better:

```python
import pandas as pd
from sklearn.inspection import permutation_importance

# Interaction terms: does strike rate matter more at high required run rates?
df["sr_x_rrr"] = df["strike_rate"] * df["required_run_rate"]

# Dummy encoding: drop_first avoids the redundant, perfectly collinear column
venue_dummies = pd.get_dummies(df["venue"], prefix="venue", drop_first=True)

# Prune by permutation importance, not by the trained coefficient's sign
result = permutation_importance(model, X_val, y_val, n_repeats=10, random_state=7)
keep = X_val.columns[result.importances_mean > 0.001]
```

`drop_first=True` isn't a style preference — keeping every dummy column makes the design matrix singular for anything solved by matrix inversion. And pruning on permutation importance rather than the raw coefficient matters because a coefficient can be large and confident on a feature that changes nothing when you actually shuffle it.

None of this happens outside the framework **Director and Executor** already set up. `approved_features` and `forbidden_features` from the BRIEF are exactly what bounds the candidate list before permutation importance ever runs — the Director doesn't approve or reject `sr_x_rrr` by name, but the raw columns it's built from are still governed by the same allow-list and deny-list. And `encoding_rule` is the reason `venue_dummies` has to be fit on the training fold only, same as any other categorical encoding. The Feature Factory is the Team Sheet's "feature iteration" row, running in code.

## The Training Floor

A deep learning agent barely touches individual columns — the network is meant to find its own interactions. What it needs supervising instead is the *training run itself*, epoch by epoch, because a network can silently go wrong in ways a tabular model's `.fit()` call simply can't: it can memorise the training set while validation loss climbs, or the loss can diverge outright from a learning rate set one order of magnitude too high.

The learning rate schedule in the code above backs off automatically:

$$\eta_{t+1} = \eta_t \times \gamma \quad \text{where } \gamma = 0.2 \text{ after 3 stagnant epochs}$$

Overfitting shows up as a widening gap rather than a single bad number — training loss still falling while validation loss turns upward is the tell, not the absolute value of either one on its own. The agent's job is to catch that turn early enough to decay the learning rate or stop, and to save the checkpoint from *before* the turn, not after.

Saving the best checkpoint isn't the same as shipping it. That decision still belongs to the same **DRS Reviewer Agent** from **Agent Architectures & Tools**, checking the same shape of evidence as anywhere else in this section:

```python
review(
    question="Should we ship the checkpoint from this training run?",
    answer="Yes — checkpoint from epoch 11, val_loss 0.087",
    evidence={
        "val_loss": 0.087,
        "lr_schedule": [1e-3, 1e-3, 1e-3, 2e-4, 2e-4, 4e-5],
        "diverged": False,
    },
)
```

A training-supervisor agent can save the best checkpoint all day — whether that checkpoint is actually good enough to ship is still somebody else's call.

## Context Window Hygiene

A training run that takes 200 epochs produces 200 lines of loss output — and a training-supervisor agent that's naive about it will paste every single one into its own context window, because that's the easiest way to "remember" what happened. It also caps how long the agent can usefully run: a context window is finite, and 200 epochs of raw stdout is exactly the kind of low-signal, high-volume text that fills it fastest.

The fix is the same one a human would reach for: don't keep the whole innings in your head, keep the scorecard.

```python
import csv

def log_epoch(path, epoch, train_loss, val_loss, lr):
    with open(path, "a", newline="") as f:
        csv.writer(f).writerow([epoch, train_loss, val_loss, lr])

# The agent's context only ever holds a summary, never the raw log:
def context_summary(path, last_n=5):
    rows = list(csv.reader(open(path)))[-last_n:]
    return f"last {last_n} epochs: " + "; ".join(
        f"e{r[0]} val={float(r[2]):.3f}" for r in rows
    )
```

Every epoch's numbers land in `experiments.csv` — or a TensorBoard summary writer, for anyone already in that ecosystem — a durable, greppable record nothing about the agent's context window can lose. What the agent actually reasons over is a short, rebuilt-each-time summary: the last few epochs, the best checkpoint so far, whether the trend is improving. The full history still exists, just not inside the one resource that's both finite and expensive to fill.

This matters more the longer the run goes. A quick ten-epoch fit can get away with pasting everything into context. A three-hundred-epoch run, a multi-day hyperparameter sweep, or a multi-agent session already carrying a captain's handoff log cannot — and the failure mode isn't dramatic, it's quiet: the agent's most recent reasoning starts crowding out the early context that explained *why* this run started in the first place.

## Two Different Nets

| | Tabular Agent | Deep Learning Agent |
|---|---|---|
| **Inputs** | A dataframe with named, meaningful columns | Raw or lightly-processed tensors — pixels, tokens, waveforms |
| **Execution environment** | CPU, seconds to minutes per run | GPU, minutes to hours per run, memory-constrained |
| **Failure mode** | A leaked or collinear feature inflates the score | Loss diverges, or memory overflows mid-epoch |
| **Stopping criteria** | Next feature's marginal gain falls below a threshold | Validation loss stops improving for N epochs (early stopping) |

## Ground Rules for Choosing the Loop

- **If the inputs are named columns, you're running a Feature Factory.** Budget the agent's time on generating and pruning candidates, not on architecture search.
- **If the inputs are raw tensors, you're running a Training Supervisor.** Budget the time on watching the loss curve and the learning rate schedule, not on hand-crafted features the network will re-derive anyway.
- **Always checkpoint on the best validation score, not the last epoch.** An agent that stops on "ran out of patience" without saving the best point along the way has thrown away the good run to keep the bad one.
- **Out-of-memory is a training-floor failure mode with no tabular equivalent.** A deep learning agent needs a batch-size backoff plan; a tabular agent almost never will.
- **Log to a file, reason over a summary.** Raw epoch-by-epoch stdout belongs in `experiments.csv` or TensorBoard, not in the agent's own context — feed it a rebuilt summary instead of letting a long run silently push out the reasoning that explained why it started.
- **Both loops still answer to the same framework.** The Feature Factory's candidate columns are bounded by the Director's approved and forbidden lists; the Training Floor's best checkpoint still needs the DRS Reviewer's evidence check before it ships.
