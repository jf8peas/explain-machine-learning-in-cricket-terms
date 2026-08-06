---
layout: ../../layouts/MatchLayout.astro
title: "Extra Trees"
subtitle: "Turning Up the Randomness"
innings: first-innings
chapter: extra-trees
meta: "12 min · extremely randomized trees"
lede: "Random Forest already gave every umpire on the panel a different set of replays. Extra Trees goes one step further: show them all the same replays, but stop letting any of them study a decision carefully. Hand each one a shortlist of plausible calls, chosen at random, and make them pick the best of that shortlist and move on."
commentary: "'We don't have time to check every possible line. Give me three plausible ones and I'll tell you which of those three looks worst.' — Panel Umpire, running late"
codeFile: first_innings/extra_trees.py
codeOut: "100 trees · whole dataset per tree · test accuracy 0.84 · faster to train"
code: |
  from sklearn.model_selection import train_test_split
  from sklearn.ensemble import ExtraTreesClassifier

  X_train, X_test, y_train, y_test = train_test_split(X, y)

  extra_clf = ExtraTreesClassifier(random_state=24)
  extra_clf.fit(X_train, y_train)

  extra_clf.score(X_test, y_test)
  extra_clf.predict(X_test)
stats:
  - { k: "Bootstrap", v: "Off", s: "every tree sees the whole dataset" }
  - { k: "Thresholds", v: "Random", s: "best of a random few, not all" }
  - { k: "Speed", v: "Faster", s: "skips the exhaustive threshold search" }
  - { k: "Watch The Name", v: "Trees ≠ Tree", s: "ensemble vs a single randomised tree" }
---

## One More Turn of the Dial

**Random Forest** introduced randomness in exactly one place: which rows each tree gets to see, via bootstrapping. Once a tree had its bootstrap sample, though, it went back to being a completely ordinary decision tree — exhaustively testing every candidate threshold on every feature, the same careful search from **Decision Trees**, just applied to a resampled slice of the data instead of the whole thing.

**Extra Trees** — "Extremely Randomized Trees" — turns that dial two notches further, and changes both halves of the process at once.

**First: no bootstrapping, by default.** Every tree in an Extra Trees ensemble sees the *entire* training dataset, not a resampled slice of it. There's no `~37% held out for free` the way Random Forest's OOB score relies on — the diversity in this ensemble has to come from somewhere else entirely.

**Second: thresholds stop being carefully searched for.** Instead of testing every possible cutoff on every feature — the exhaustive process **Decision Trees** described in detail — each split considers only a small number of randomly chosen candidate thresholds, and picks the best *of that random handful*, not the best of everything that could have been tried.

Picture the difference on the panel. A Random Forest umpire studies every frame of a genuinely different set of replays and picks the best possible call from what they saw. An Extra Trees umpire is handed the *same* full set of replays as everyone else on the panel, but is only offered three or four plausible calls to choose between, picked at random, and has to go with the best of that short list. Less individual rigour, on a wider shared body of evidence.

## Why Less Careful Trees Can Still Be Trusted

This should sound like a worse tree, and on its own, it is — an Extra Tree's splits are cruder than a Decision Tree's or an individual Random Forest tree's, because it never got to consider the genuinely optimal threshold, only a random sample of candidates.

What it buys back is diversity and speed. Randomising the thresholds, on top of nothing else changing between trees, still produces an ensemble where individual trees disagree with each other in usefully different ways — arguably even more different ways than bootstrapping alone produces, since now both *what* each tree sees and *how* each tree decides are varied. And because no tree is exhaustively testing every threshold at every split, the whole forest trains faster than a Random Forest of the same size, sometimes considerably so on a large dataset with many features. The trade is real and worth naming plainly: **a bit of per-tree quality, spent to buy a lot of speed and an ensemble that turns out, in practice, to hold up just as well.**

## Same Shape, Same Interface

`ExtraTreesClassifier` and `ExtraTreesRegressor` accept the same parameters as their Random Forest counterparts — `n_estimators`, `n_jobs`, `verbose`, `warm_start`, `max_samples` — and fit, score, and predict exactly the same way:

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import ExtraTreesClassifier   # or ExtraTreesRegressor

X_train, X_test, y_train, y_test = train_test_split(X, y)

extra_clf = ExtraTreesClassifier()
extra_clf.fit(X_train, y_train)
extra_clf.score(X_test, y_test)
extra_clf.predict(X_test)
```

If you swapped this in for last chapter's `RandomForestClassifier` and didn't read the import line, you might not notice the difference — which is exactly the point. The interface is identical on purpose. Everything that changed is the randomness underneath.

## Mind the Singular

One warning worth taking seriously, because it's an easy typo with a confusing consequence: `scikit-learn` also ships `ExtraTreeClassifier` and `ExtraTreeRegressor` — **singular** "Tree," not the plural "Trees" this whole chapter has been about.

`ExtraTreesClassifier` (plural) is the ensemble — the whole panel, randomised thresholds and all, voting together. `ExtraTreeClassifier` (singular) is **one single extremely randomized tree**, standing entirely alone — in fact, it's literally the same building block `ExtraTreesClassifier` uses internally for each member of its panel, just handed to you unaggregated, with no panel to smooth out its randomness against.

Import the singular version by mistake, thinking you've built an ensemble, and you'll get exactly what the name says: one tree, making rushed, randomly-thresholded calls, with no fifty other opinions averaging it back toward something reliable. All the extra randomness Random Forest's bagging and Extra Trees' random thresholds normally survive *because there are so many trees to vote it back into line* — remove the panel, and that randomness stops being a source of stability and just becomes noise.

There is essentially never a reason to reach for the singular version on its own. If you want one interpretable tree, grow a `DecisionTreeClassifier` from **Decision Trees**, which at least searched properly for its thresholds. If you want the speed and stability Extra Trees is actually good for, use the plural ensemble. The singular class exists mostly as the internal machinery the plural one is built from.

## Choosing Between the Three

Three chapters, three ways of asking the same question, and each one trades something for something else:

| | Decision Tree | Random Forest | Extra Trees |
|---|---|---|---|
| **What varies between trees** | Nothing — there's one tree | Bootstrap sample per tree | Whole dataset, but random thresholds |
| **Threshold search** | Exhaustive | Exhaustive, per tree | Random subset, best of that subset |
| **Interpretability** | One clean picture | No single picture | No single picture |
| **Stability** | Low — sensitive to small data changes | High | High, often comparable to Random Forest |
| **Training speed** | Fast (one tree) | Slower (many careful trees) | Fastest ensemble (many cheap trees) |
| **Free validation** | No | Yes — `oob_score` | Available, but bootstrap is off by default |

None of the three is a strictly better version of the others. A single tree earns its place the moment someone needs to *see* the reasoning, not just trust the score. A forest earns its place the moment stability matters more than a picture. Extra Trees earns its place the moment the dataset is large enough that Random Forest's exhaustive threshold search starts to hurt, and a little extra randomness is a small price for a much faster panel.

## Ground Rules for the Dressing-Room Wall

- **No bootstrapping by default.** Every Extra Tree sees the whole dataset — the diversity comes from randomised thresholds instead of randomised rows.
- **Thresholds are picked from a random few, not searched exhaustively.** Faster per split, cruder per tree.
- **The ensemble survives what the individual tree can't.** Weaker individual trees, pooled across a large enough panel, still converge on a reliable vote.
- **Same interface as Random Forest**, by design — `n_estimators`, `n_jobs`, `warm_start`, `max_samples`, `fit`/`score`/`predict`, all identical.
- **Watch the plural.** `ExtraTreesClassifier`/`Regressor` is the ensemble you want. `ExtraTreeClassifier`/`Regressor`, singular, is one unaggregated randomised tree — almost never what you're reaching for.
- **Three tools, three trade-offs.** A single tree for interpretability, Random Forest for stability with a free validation score, Extra Trees for stability at speed on a larger dataset.

---

Three chapters, the same underlying question asked three different ways: how many times should you ask, and how carefully should each asking be done? One careful question from one umpire is fast and readable, but wobbles. A whole panel, each shown different footage, wobbles far less. And a panel that stops being quite so careful about any one call, provided there are enough of them, wobbles hardly at all — and gets there quicker.
