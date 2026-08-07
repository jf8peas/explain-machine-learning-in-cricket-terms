---
layout: ../../layouts/MatchLayout.astro
title: "Feature Selection & Hyperparameter Optimisation"
subtitle: "Trial Matches"
innings: scoring-model-evaluation
chapter: trial-matches
meta: "9 min · feature selection & grid search"
lede: "Forty names on the whiteboard and eleven places in the side. Feature selection and hyperparameter optimisation are the unglamorous work of finding the best combination — which players make the sheet, and what conditions you set for them — and then, finally, opening the vault to see whether you got it right."
commentary: "'Everyone has an opinion on the XI. Only one of us has to write eleven names down and sign it.' — Chairman of Selectors"
codeFile: scoring/grid_search.py
codeOut: "90 fits · best: n_neighbors=7, metric='manhattan' · cv f1 0.847 · test f1 0.831"
code: |
  from sklearn.model_selection import GridSearchCV

  grid_params = {"n_neighbors": range(1, 10),
                 "metric": ["minkowski", "manhattan"]}

  knn_grid = GridSearchCV(knn, grid_params, scoring="f1", cv=5)
  knn_grid.fit(X_train, y_train)
  print(knn_grid.best_params_, knn_grid.best_score_)
stats:
  - { k: "The Squad Sheet", v: "Feature Selection", s: "who makes the side" }
  - { k: "The Scouting Report", v: "Correlation", s: "corr() against the target" }
  - { k: "Trial Matches", v: "Grid Search", s: "every combination, tested" }
  - { k: "What Counts", v: "scoring=", s: "defines 'best' for the search" }
  - { k: "The Vault", v: "One Final Score", s: "best_estimator_.score()" }
---

The whiteboard in the selection room has forty names on it and eleven places underneath. Somewhere between those two numbers is a decision that will be second-guessed by every person in the country who owns a television.

And the decision is not one decision. It is two, tangled together. *Who is in the side?* And *what conditions do you set for them* — the batting order, the field restrictions, the bowling plans. Change the personnel and the ideal conditions change. Change the conditions and a different player suddenly looks like the right pick.

This is optimisation. Not a formula — a **search**. You have a space of possible sides, you have a way of scoring one (Innings 3.3 gave you that), and you have a warm-up fixture to score them on (3.1 gave you that). What remains is the disciplined, faintly tedious business of working through the possibilities without lying to yourself.

Two axes. Let's take them in order.

## Axis One: Feature Selection — Trimming the Roster

There is a persistent instinct, especially early on, that more features must be better. Forty columns of data is forty pieces of evidence, and surely evidence helps.

It does not, reliably. Consider what happens when you name a forty-man squad and insist all of them take the field.

**Irrelevant features are noise in whites.** A column with no genuine relationship to the target still has variance, and a sufficiently flexible model will find patterns in it. Those patterns are the bowling machine's worn patch of turf from 3.2 — real in the training data, meaningless everywhere else. Every passenger you carry is another opportunity for the model to overfit.

**Redundant features are two identical left-arm seamers.** Both good bowlers. Both bowl the same length at the same pace to the same field. Picking both doesn't double your options; it wastes a slot and confuses the captain about who to throw the ball to. In model terms this is multicollinearity, and it makes coefficients unstable and unreadable — the credit for a wicket gets split arbitrarily between two bowlers who did the same thing.

**Every feature has a cost off the field, too.** Something has to collect it, clean it, and keep collecting it every day the model runs in production. A column that adds 0.002 to your F1 and breaks twice a year is not a good signing.

### Three ways to work out who deserves a place

**Domain expertise — the coach who has watched them all.** The most undervalued method by a distance. Someone who understands the actual problem can tell you in thirty seconds that `customer_id` is meaningless, that `last_contact_duration` is measured *after* the call you're trying to predict the outcome of, and that two of your columns are the same quantity in different units. No algorithm will tell you that as fast, and some will never tell you at all.

**Correlation with the target — the scouting report.** A numerical read on which columns move with the thing you're predicting:

```python
correlations = banking_df.corr()
correlations["subscribed"].sort_values(ascending=False)
```

Read it as a batting average against this particular opposition. High absolute value — positive or negative — means the column carries information about the target. Something near zero means, on this evidence, the column is along for the ride.

**Experimentation — the trial match.** Pick a set, train, score on validation. Pick a different set, do it again. Crude, but it is the only method that measures the thing you actually care about, which is model performance rather than a proxy for it.

### Three warnings before you start dropping columns

**Correlation only sees straight lines.** `corr()` computes a *linear* relationship. A feature with a beautiful curved or conditional relationship to the target can score near zero and still be one of your best players. The batter who averages 12 in the subcontinent and 58 in England has an unremarkable career average and is absolutely worth picking — for one of the two tours.

**A weak feature can be strong in combination.** Individual correlation is measured in isolation, and cricket is not played in isolation. A nightwatchman's numbers are dreadful in a vacuum and valuable in context. Judge combinations by trialling them, not by summing their individual scores.

**And the one that should make you nervous: a suspiciously high correlation is a leak, not a gift.** A feature correlating 0.97 with your target has almost certainly seen the future. Go back to the sign sheet warning in 3.3 and check where that column came from before you celebrate.

### A Worked Example: The Review That Already Happened

Say you're building a model to help a captain decide whether to send an LBW shout upstairs — predict, in the ten seconds after the on-field umpire's decision, whether a review would overturn it. You run `corr()` against your target and one column towers over the rest: `third_umpire_ruling`, sitting at 0.99.

**Why it's a leak.** `third_umpire_ruling` isn't a fact about the delivery — it's the *outcome of the review itself*. It doesn't get written down until after the review has already happened.

**The failure in production.** The one moment this model actually has to earn its keep — right after the on-field decision, before anyone has reviewed anything — `third_umpire_ruling` is blank. Nobody has reviewed the ball yet; there is nothing to put in that column. A model that leaned on it in training has learned to read a verdict that, at the exact moment it's asked to predict, hasn't been handed down.

**The test that catches this every time:** for any suspiciously strong feature, ask *"would I actually have this exact piece of information at the exact moment I need to make the call?"* If the honest answer is no, it isn't a feature. It's the answer key, wearing a disguise.

```
                        THE SQUAD SHEET

   feature                corr      verdict
   ─────────────────────────────────────────────────────────
   duration               0.97   ← recorded AFTER the call. Leak.
   poutcome_success       0.32      picks itself
   contact_cellular       0.14      useful in combination
   euribor3m             -0.31      picks itself
   day_of_week            0.01      carry the drinks
   customer_id            0.00      not a cricketer
```

## Axis Two: Hyperparameter Optimisation — Dialling In the Conditions

You know from **The Coach's Settings** what a hyperparameter is: the dials you set before play, as opposed to the muscle memory the model develops during it. What that chapter deliberately left open was the hard part.

**Hyperparameter optimisation** — or tuning — is the process of searching those dial settings for the combination that maximises performance. Not the settings that feel right. Not the defaults, which were chosen by library authors who have never seen your data. The ones that measurably win.

The obstacle is that you cannot reason your way to them. There is no derivation that produces the correct `k` for your particular problem. Hyperparameters interact — the best tree depth changes depending on how much regularisation you applied (properly defined two chapters from now, in **Gradient Descent**) — so you cannot even tune them one at a time and expect the individual winners to combine into an overall winner.

So you do what selectors have always done. You try combinations, and you keep notes.

## Grid Search: Trial Matches for Every Combination

Grid search is the exhaustive version. Write down the values worth considering for each dial, and the search trials **every possible combination** of them.

```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import GridSearchCV

grid_params = {
    "n_neighbors": range(1, 10),
    "metric": ["minkowski", "manhattan"],
}

knn = KNeighborsClassifier()
knn_grid = GridSearchCV(knn, grid_params, scoring="f1", cv=5)
knn_grid.fit(X_train, y_train)
```

Nine values of `k`, two distance metrics: eighteen candidate sides. With `cv=5`, each one is trained and evaluated five times on different folds of the training data. **Ninety fits**, run by a single call, and every result recorded.

Note what it is scoring *on*: folds of `X_train`. The vault stays shut throughout. A grid search that touches your test data has not found you the best model, it has found you the most flattering number.

### What are you searching *for*?

Now the parameter that decides whether any of this was worth doing.

**The Scorer's Box** established that a metric is a choice — that precision, recall, and F1 answer different questions, and that accuracy on imbalanced data is a confidence trick. All of that was, until this moment, a matter of what you *report*.

`scoring=` is where it stops being about reporting and starts steering the search. Eighteen candidate sides are about to be ranked, and this one string decides what "best" means. Leave it at the default:

```python
knn_grid = GridSearchCV(knn, grid_params, cv=5)   # scoring defaults to accuracy
```

and the grid search will work through every combination you gave it, diligently and at length, hunting for the settings that best reproduce the lazy umpire from 3.3 — hands in pockets, 94.5%, never once raising a finger. It will find him. It will report that it did a wonderful job. And it will be telling the truth about the wrong thing.

The optimiser has no opinion about your problem. It maximises exactly what you asked it to maximise, which is a wonderful property right up until the moment you ask for the wrong thing.

```python
scoring="f1"          # balanced view on imbalanced classes — the sensible default
scoring="recall"      # when a miss is expensive: drop no chances
scoring="precision"   # when a false alarm is expensive: don't burn reviews
scoring="neg_root_mean_squared_error"   # regression, catastrophic misses matter
```

Decide this before you press go, and decide it from what the errors actually cost — not from what produces the nicest-looking number. A search optimising the wrong metric doesn't fail loudly. It succeeds, thoroughly, at something you didn't want.

### Reading the results

Three attributes, and the distinction between them matters:

```python
knn_grid.best_params_      # {'metric': 'manhattan', 'n_neighbors': 7}
knn_grid.best_score_       # 0.847
knn_grid.best_estimator_   # the winning model, already refitted on all of X_train
```

`best_params_` is the team sheet — the settings that won. `best_score_` is what that side averaged **in the warm-up fixtures**. And `best_estimator_` is the model itself, which scikit-learn has helpfully already refitted on the full training set using the winning settings, so you don't have to rebuild it by hand.

One thing to be firm about: **`best_score_` is not your headline number.** It is a validation score, produced by the same process that selected the winner. You picked the maximum of eighteen noisy measurements, and the maximum of a noisy sample is optimistically biased — the winner got where it did partly on merit and partly on luck. Quoting it as your model's performance is quoting a net average.

### The grid explodes, quickly

Grid search is exhaustive, which is its virtue and its whole problem. Every dial you add multiplies:

```
   2 dials  ×  9 and 2 values     =     18 combinations  ×  5 folds  =     90 fits
   4 dials  ×  10 values each     = 10,000 combinations  ×  5 folds  = 50,000 fits
```

At which point you are no longer selecting a side, you are running a domestic season.

Two escapes. **`RandomizedSearchCV`** samples a fixed number of combinations from the space rather than trialling all of them — you name your budget (`n_iter=60`) and it spends it. It sounds like a compromise and mostly isn't: when only two or three dials genuinely matter, random sampling covers the range of *those* dials far more efficiently than a grid that spends most of its effort on settings that make no difference. The other escape is a coarse pass to find the promising region, then a fine grid within it — exactly how you would scout a district before scouting a club.

### Search the pipeline, not the model

One structural detail that prevents a leak so subtle it survives most code review. If you scale your features and then grid-search, the scaler has seen every fold — including the one being held out on each round. Put the whole thing in a `Pipeline` and search that instead:

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler

pipe = Pipeline([
    ("scaler", MinMaxScaler()),
    ("knn", KNeighborsClassifier()),
])

grid = GridSearchCV(
    pipe,
    {"knn__n_neighbors": range(1, 10),
     "knn__metric": ["minkowski", "manhattan"]},
    scoring="f1",
    cv=5,
)
grid.fit(X_train, y_train)
```

The double underscore in `knn__n_neighbors` addresses a step inside the pipeline by name. Now the scaler is refitted on each fold's training portion alone, and the held-out fold is genuinely held out. The rule from 3.1 stops depending on your discipline and starts being enforced by the machinery.

## Opening the Vault

Everything up to this point has happened in the nets and the warm-up fixtures. The features are chosen. The dials are set. The team sheet is signed.

```python
knn_grid.best_estimator_.score(X_test_scaled, y_test)
# 0.831
```

One line. One run. The first and only time this data has been used.

`0.847` in the trial matches, `0.831` on the day. That small drop is not a failure — it is what honesty costs, and a gap that modest is the sign of a search that stayed disciplined. A **large** gap means you overfitted the search itself: too many combinations trialled against too small a validation set, until the winner was chosen more by luck than by class.

And now the hardest rule in this innings. Whatever that number is, **it is the number.** If it disappoints, you do not go back, adjust the grid, and run it again. The moment you do, the test set has been used to make a decision, it has quietly become a second validation set, and you no longer possess an honest estimate of anything.

Report it as it came out. Selectors who rewrite the scorecard after the match do not stay selectors for long.

## The Selection Committee's Checklist

- **Fewer, better features.** Every passenger is another chance to overfit and another thing to maintain in production.
- **Ask the coach first.** Domain expertise finds meaningless columns and future-leaking columns faster than any algorithm.
- **`corr()` is a scouting report, not a verdict.** It only sees linear relationships and only in isolation.
- **A correlation near 1.0 is a leak until proven otherwise.** Go and check where that column came from.
- **Tune the dials together, not one at a time.** Hyperparameters interact; individual winners don't necessarily combine.
- **Set `scoring=` deliberately.** It defines what "best" means for the whole search. The default is accuracy, and on imbalanced data it will find you the best possible lazy umpire — thoroughly, and without complaint.
- **Search a `Pipeline`, not a bare model.** It makes fold-level leakage structurally impossible rather than merely discouraged.
- **When the grid explodes, sample it.** `RandomizedSearchCV` with a fixed budget, or coarse-then-fine.
- **`best_score_` is a net average.** It is optimistically biased by the act of selection. Never report it as your model's performance.
- **`best_estimator_` is already refitted** on the full training set. Use it; don't rebuild it by hand.
- **Open the vault once, at the very end, and publish what it says.**

---

Forty names became eleven. The dials found their settings. The vault opened once and gave you a number that was slightly worse than you hoped, which is exactly how you know it was telling the truth.

The side is named. Which, as every selector eventually learns, is the moment the actual difficulty begins — because a team that was optimal in July is playing in November, on a different surface, against opposition that has spent three months watching the footage.

Next chapter: **Gradient Descent** — how a model tunes settings that were never on a shortlist to begin with, one small correction at a time.
