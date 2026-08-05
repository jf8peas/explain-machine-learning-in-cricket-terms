---
layout: ../../layouts/MatchLayout.astro
title: "Random Forest: Ask the Whole Panel"
innings: first-innings
chapter: random-forest
meta: "16 min · bootstrapping, bagging & the wisdom of the panel"
lede: "One umpire's read of a review can wobble. Show a panel of umpires slightly different footage each and ask for a show of hands, and the wobble mostly cancels out. A random forest is that panel — dozens of trees, each grown from a different slice of the same season, voting."
commentary: "'Any one of us could be wrong about this delivery. All of us being wrong, in the same direction, at the same time — that's a lot rarer.' — Panel Umpire"
codeFile: first_innings/random_forest.py
codeOut: "100 trees · oob_score 0.83 · test accuracy 0.85"
code: |
  from sklearn.ensemble import RandomForestClassifier

  forest = RandomForestClassifier(bootstrap=True, oob_score=True, random_state=24)
  forest.fit(X, y)   # no train_test_split needed — the OOB rows are the test set

  forest.oob_score_
  forest.oob_decision_function_
stats:
  - { k: "n_estimators", v: "100", s: "trees on the panel (default)" }
  - { k: "Sample Seen", v: "~63%", s: "unique rows per tree, on average" }
  - { k: "Out-of-Bag", v: "~37%", s: "free validation, per tree" }
  - { k: "Verdict", v: "Majority Vote", s: "or the average, for regression" }
---

## One Wobbly Umpire Is Not Enough

**Decision Trees** ended on a warning worth repeating exactly: a single tree is extremely sensitive to small changes in its training data. Swap a handful of matches and the whole tree can restructure itself — a different root question, different splits, a different verdict for a delivery that hasn't changed at all. That's not a minor quirk to tune away. It's a structural property of asking one umpire to review everything alone.

**Random Forest**'s fix doesn't try to build a steadier single tree. It stops trusting any one tree's opinion at all. Grow dozens of trees, show each one a slightly different slice of the same season, and let them vote. Individually, every tree on the panel is exactly as twitchy as the one from last chapter. Collectively, their wobbles mostly point in different directions and cancel out.

Random Forest belongs to the wider family of **ensemble methods** — combining several individual models to get a steadier, more robust result than any one of them manages alone. Ensembles show up all over machine learning, in forms that have nothing to do with trees. Random Forest is the one member of that family built exclusively from decision trees.

## Bootstrapping: A Different Set of Replays for Every Umpire

Each tree in the forest doesn't train on the full dataset. It trains on a **bootstrap sample**: a random draw from the training data, the same size as the original, taken **with replacement**. With replacement means some rows get drawn more than once for a given tree, and — this is the part that matters — some rows don't get drawn at all.

That's not a rounding error. Draw `n` rows with replacement from a set of `n`, and the probability any specific row is never picked converges toward `1/e`, about **37%**. Every tree in the forest, on average, never sees roughly a third of the training data. Each umpire on the panel really has been shown a genuinely different set of replays.

This resampling procedure has its own name — **bootstrap aggregating**, almost always shortened to **bagging** — and it's the `bootstrap` parameter, on by default:

```python
RandomForestClassifier(bootstrap=True)   # the default — diversity by design
```

Turn it off and every tree trains on the identical full dataset. The forest stops being a panel with differing views and becomes a hundred copies of the same umpire, which defeats the entire premise.

## Out-of-Bag: The Free Test Set Hiding in Plain Sight

That 37% each tree never saw isn't wasted — it's a validation set that cost nothing to set aside, because bootstrapping set it aside automatically. Score each tree only on the rows it never trained on, average across the whole forest, and you get an honest read on generalisation without spending a single row on a separate `train_test_split`.

```python
from sklearn.ensemble import RandomForestClassifier

forest = RandomForestClassifier(bootstrap=True, oob_score=True, random_state=24)
forest.fit(X, y)   # notice: no train_test_split at all
forest.oob_score_
```

That missing `train_test_split` is worth pausing on, because it breaks a pattern every other chapter in this innings has drilled in. It isn't an exception to the rule that you must hold out data before trusting a score — it's the same rule, satisfied a different way. Each tree's out-of-bag rows *are* held-out data; there are just as many different held-out sets as there are trees, generated automatically as a side effect of bagging.

Two attributes read the OOB predictions back directly, one per estimator type:

```python
random_forest_reg.oob_prediction_        # RandomForestRegressor — predicted values
random_forest_clf.oob_decision_function_ # RandomForestClassifier — predicted probabilities
```

## Growing the Forest

A handful of parameters control the shape of the panel itself, on top of everything a single tree already accepts.

- **`n_estimators`** — how many trees. The default is `100`. More trees generally means a steadier vote, but the improvement shrinks the further past a few hundred you go — the same diminishing-returns shape **K-Means Clustering**'s elbow curve made visual, just applied to forest size instead of cluster count. Past the elbow, you're mostly just spending compute to confirm what the panel already agreed on.
- **`n_jobs`** — how many trees get grown in parallel. `-1` uses every available processor, the equivalent of running every net lane at once instead of one bowler at a time.
- **`verbose`** — how much logging detail gets printed while the forest grows. Higher integers print more; `scikit-learn` doesn't document exactly what each level shows, but `0`, the default, stays silent.
- **`warm_start`** — keep the trees already grown and add more on top, rather than starting from zero. Genuinely useful when hunting for the right `n_estimators` as part of a grid search: grow 50 trees, check the score, grow 50 more on top of them, rather than regrowing 100 from scratch each time.
- **`max_samples`** — how many observations each individual tree's bootstrap draw pulls from the training set. Requires `bootstrap=True` — there's no bootstrap sample size to control if there's no bootstrap sample.

## Reading the Verdict

Away from the OOB shortcut, a random forest fits, scores, and predicts exactly like the single tree it's built from:

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier   # or RandomForestRegressor

X_train, X_test, y_train, y_test = train_test_split(X, y)

forest = RandomForestClassifier()
forest.fit(X_train, y_train)
forest.score(X_test, y_test)
forest.predict(X_test)
```

Same interface as **Decision Trees**' `DecisionTreeClassifier`, deliberately. Everything you already know about `fit`, `score`, and `predict` transfers without a second thought — only what's happening underneath has changed.

## What You Gain, What You Give Up

The gain is exactly what this chapter set out to fix: a random forest is dramatically more stable than any single tree, and typically more accurate too, because the panel's vote smooths out the idiosyncrasies any one member picked up from its particular bootstrap sample.

The cost is the one thing a lone decision tree did better than almost anything else in this innings: **you can no longer draw the whole model on one page.** `plot_tree` and `export_text`, from last chapter, describe a single tree beautifully and describe one tree out of a hundred, which isn't the same thing as describing the forest. There is no single flowchart you can hand a non-technical stakeholder anymore — you traded a picture for a panel, and the panel doesn't fit on a slide.

## Ground Rules for the Dressing-Room Wall

- **A forest is many trees voting, not one tree being more careful.** Individually, each tree is just as unstable as the one from last chapter.
- **Bootstrapping gives every tree a different bootstrap sample** — drawn with replacement, same size as the original, leaving roughly 37% of rows unseen by any given tree.
- **Out-of-bag scoring is a free validation set.** `oob_score=True` grades every tree on the rows it never trained on — no `train_test_split` required.
- **`n_estimators` has diminishing returns.** More trees help, up to a point, then mostly just cost compute.
- **Same interface as a single tree.** `fit`, `score`, `predict` — nothing new to learn there, only what's growing underneath.
- **You gain stability and lose the picture.** A hundred-tree forest can't be drawn on one page the way a single tree could.

---

Bootstrapping was the first turn of the randomness dial — giving every tree a different sample to learn from, while still letting each one search carefully for its best possible split. The next chapter turns that same dial one notch further.
