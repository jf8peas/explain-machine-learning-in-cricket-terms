---
layout: ../../layouts/MatchLayout.astro
title: "Classical vs Deep Learning Agents"
subtitle: "From Feature Factories to Gradient Descent Supervision"
innings: post-game
chapter: classical-vs-deep-learning-agents
meta: "12 min · feature factory vs training floor"
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

## The Training Floor

A deep learning agent barely touches individual columns — the network is meant to find its own interactions. What it needs supervising instead is the *training run itself*, epoch by epoch, because a network can silently go wrong in ways a tabular model's `.fit()` call simply can't: it can memorise the training set while validation loss climbs, or the loss can diverge outright from a learning rate set one order of magnitude too high.

The learning rate schedule in the code above backs off automatically:

$$\eta_{t+1} = \eta_t \times \gamma \quad \text{where } \gamma = 0.2 \text{ after 3 stagnant epochs}$$

Overfitting shows up as a widening gap rather than a single bad number — training loss still falling while validation loss turns upward is the tell, not the absolute value of either one on its own. The agent's job is to catch that turn early enough to decay the learning rate or stop, and to save the checkpoint from *before* the turn, not after.

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
