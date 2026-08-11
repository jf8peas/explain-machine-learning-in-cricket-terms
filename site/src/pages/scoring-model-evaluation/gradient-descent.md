---
layout: ../../layouts/MatchLayout.astro
title: "Gradient Descent"
subtitle: "Finding the Perfect Length"
innings: scoring-model-evaluation
chapter: gradient-descent
meta: "15 min · loss landscapes & learning rates"
lede: "Feature Selection & Hyperparameter Optimisation searched for good settings by trying combinations and keeping the winner. Most models don't get that luxury — their real dials aren't a short list you can grid-search, they're numbers that could be anything. Gradient Descent is how a model finds good settings anyway: not by trying everything, but by feeling which way is downhill and taking a step."
commentary: "'You don't need the pitch report. You need to know: did that miss short, or did it miss full? Adjust, and bowl again.' — Bowling Coach"
codeFile: scoring/gradient_descent.py
codeOut: "same destination, different road: intercept 4.1 · overs +14.6 · wickets −9.0 · run_rate +11.2"
code: |
  from sklearn.linear_model import SGDRegressor

  model = SGDRegressor(
      loss="squared_error",
      learning_rate="constant",
      eta0=0.01,
      tol=1e-3,
      max_iter=1000,
  )
  model.fit(X_train, y_train)

  print("intercept", round(model.intercept_[0], 2))
  print("coefficients", dict(zip(X_train.columns, model.coef_.round(2))))
stats:
  - { k: "Global Min", v: "One", s: "the actual best length" }
  - { k: "Local Min", v: "Many", s: "false floors nearby" }
  - { k: "Learning Rate", v: "Step Size", s: "too big overshoots, too small crawls" }
  - { k: "Stop When", v: "Barely Moving", s: "or out of overs — max_iter" }
---

## Not Every Dial Has a Team Sheet

Grid search, from **Feature Selection & Hyperparameter Optimisation**, works by trying candidates and keeping the best one — a finite shortlist of `n_neighbors` or `max_depth` values, trialled and ranked. That approach quietly depends on the dial having a short list to begin with.

Most of the numbers a model actually tunes don't. A linear regression's coefficients aren't chosen from `{1, 2, 3}` — they could be `14.6183...` or `-9.047...` or anything in between, and there's no whiteboard long enough to write out every candidate. You cannot grid-search a number line. What you can do is start somewhere, check whether you're too high or too low, and adjust — which is exactly what a bowler does every time they walk back to their mark.

## A Bowler Finding Their Length

Imagine a bowler on an unfamiliar pitch, uneven bounce, trying to clip the top of off stump. Nobody hands them the perfect length in advance. They find it the only way it's ever found — ball by ball.

**Ball one, the opening guess.** It's short. Well short — the ball bounces harmlessly over the stumps, closer to the keeper's gloves than the timber. That's a big miss, and the bowling coach doesn't need a radar gun to see it: *"missed high and short — pitch it fuller."* The coach has just given a **direction**, not a number. Not "add exactly forty centimetres" — just *which way is better*.

**Ball two, the overcorrection.** Fuller, the bowler agrees — and takes that instruction much too literally, dropping in something close to a full toss. Still wrong, now wrong the other way, and by roughly as much. The bowler didn't misunderstand the direction. They misjudged how big a step to take on it.

**Ball three, the calibrated correction.** Smaller this time — nudge it back up the pitch a touch, not all the way to a yorker. Closer. Noticeably closer.

**Ball four.** Off stump, top of off, exactly the mark. Job done.

Strip the cricket out and what's left is the entire algorithm: **measure the error, work out which direction reduces it, take a step of some size in that direction, and repeat until the misses stop being worth correcting.** That's Gradient Descent, and everything else in this chapter is just giving those four moves proper names.

## Naming the Parts

- **Loss** is the size of the miss — two metres short, half a metre full, dead on the mark. A single number describing how wrong the current attempt was.
- **The gradient** is the coach's shout — the *direction and steepness* of the error at exactly the length just bowled. It doesn't tell you the perfect length outright. It tells you whether *this* attempt should go fuller or shorter, and roughly how urgently.
- **The learning rate** is how literally the bowler takes that instruction — how big a step to make in the direction the gradient points. Ball two's problem was never the direction. It was a learning rate set far too high.
- **An iteration** is one full lap of the loop: bowl, measure, adjust. Four balls, four iterations, one converged bowler.

## The Loss Landscape: All the Lengths, Not Just the Ones You Tried

Now zoom out. Instead of one ball at a time, imagine plotting the loss for *every* length the bowler could conceivably bowl — a foot short of a good length, all the way up to a searching yorker — against how far off the stumps each one lands on average. That curve is the **loss landscape**: a map of how wrong you'd be, for every setting you haven't tried yet as well as the ones you have.

Somewhere on that curve sits a **global minimum** — the one true length that minimises the error better than any other, the actual bottom of the actual valley. Gradient descent's whole job is to walk downhill on this landscape until it can't find anywhere lower nearby.

That "nearby" is the catch. A slightly-too-short length might, on a two-paced pitch, produce fewer boundaries than lengths immediately around it — a small dip that looks like the answer if you're only comparing it to its neighbours. That's a **local minimum**: genuinely better than nearby alternatives, while a much deeper valley sits further off, reachable only by getting worse for a while first. A bowler taking small, timid corrections can get stuck in that shallow dip forever, convinced they've found the length, because every small step away from it looks like a step backwards.

![A line chart titled Loss vs length bowled. The curve starts high at the point labelled ball one, well short, big miss, then descends through a series of dots into a shallow dip labelled local minimum, looks like the answer from nearby. The curve rises into a small hump, then descends much further into a deep valley marked with a star and labelled global minimum, the true best length, before rising again toward yorker-length deliveries.](/images/loss-landscape.png)

A bowler taking cautious, one-step-at-a-time corrections from the left edge of that curve rolls straight into the shallow dip and stops — every neighbouring length looks worse, so there's no local signal telling them to keep going. Reaching the true minimum means tolerating a stretch where the loss goes back *up* before it comes back down, which is exactly why "always take the step that looks best right now" isn't quite the whole strategy real optimisers use.

With one dial — just length — the landscape is a single curve, and it's hard to miss a deep valley by much. Real models tune dozens or thousands of dials simultaneously — length *and* line *and* pace *and* seam position — and the landscape becomes a surface with folds and false floors in every direction at once. This is the same explosion **Feature Selection & Hyperparameter Optimisation** hit when the grid went from two dials to four: exhaustively checking every combination stopped being possible long before you ran out of dials worth tuning. Gradient descent doesn't check every combination either. It just always knows, from wherever it's currently standing, which direction is downhill.

## Learning Rate: How Big a Step Is Too Big?

Ball two already showed you the failure mode. A **learning rate** that's too large doesn't creep toward the minimum, it leaps past it — overcorrecting from short to full, and if it's bad enough, from full back to short again, bouncing across the valley without ever settling in it. Turn it up further still and the bowler can end up worse with every correction, wandering further from the mark each time rather than closer.

A learning rate that's too small has the opposite problem. Every step is safely, cautiously in the right direction — and each one is so tiny that the bowler could run out of overs before ever troubling the stumps. Technically still converging. Not in any useful timeframe.

The practical fix — the one a good bowler does on instinct and `sklearn`'s optimisers do by design — is to not use one fixed step size all the way through. Take large, confident corrections early, when the loss is large and the direction obvious, and shrink the steps automatically as the misses get smaller and the mark gets closer. Scikit-learn's stochastic gradient descent implementations do exactly this: the learning rate you set is a starting point, not a constant.

## Bringing Back Regression: What's Actually Being Tuned

Time to make this concrete against a model you'll meet properly in First Innings. A **projected score** — runs predicted from overs faced, wickets in hand, and current run rate — is weight and bias: a coefficient for every predictor, plus one intercept. One way to find those coefficients, covered in full when you get to **Linear Regression**, is the **normal equation** — an exact, one-shot piece of matrix algebra: β̂ = (XᵀX)⁻¹XᵀY.

Gradient descent finds the *same* weight and bias, for the *same* mean-squared-error loss, by a completely different road — and every single step it takes, whether there's one coefficient in play or a thousand, breaks down into exactly the same three moves.

**1. The forward pass — measure the damage.** Every weight currently in play — the coefficient on `overs`, on `wickets`, on `run_rate`, plus the intercept — gets used together to predict a projected score for every row in the training set. Those predictions get compared against what actually happened, and out comes a single number: the total loss.

**2. The backward pass — one partial derivative per weight.** For each weight in turn, gradient descent asks the same narrow question: *if I nudged just this one, holding every other weight exactly still, would the total loss go up or down, and how fast?* That per-weight answer has a name — a **partial derivative** — and every one of them gets computed off the exact same forward pass, before any weight actually changes:

```
∂Loss/∂w₁,   ∂Loss/∂w₂,   ∂Loss/∂w₃,   …
```

**3. The update — every weight moves, together, but not equally.** Once every partial derivative is known, the whole vector updates in a single step, each weight nudged by its own partial derivative and scaled by the learning rate:

```
w₁ ← w₁ − learning_rate × ∂Loss/∂w₁
w₂ ← w₂ − learning_rate × ∂Loss/∂w₂
w₃ ← w₃ − learning_rate × ∂Loss/∂w₃
```

Worth being precise about what "together" means here, because it's easy to picture wrong. Gradient descent doesn't tune `overs`, stop, tune `wickets`, stop, tune `run_rate` — that one-predictor-at-a-time discipline belongs to **Model Selection**'s sequential feature selector, which adds a single column, checks the result, and only then moves on to the next. Every weight above updates in the very same step. But "together" doesn't mean "equally": a predictor with a steep, urgent gradient gets nudged hard, one that's already nearly right barely moves, and a genuinely useless one can sit close to zero for the whole run.

Repeat all three steps, re-measure the loss, and go again. Ball one, ball two, ball three — except now there are as many "balls" as there are `max_iter` allows, and as many things being adjusted at once as there are predictors.

**Picture the motion, not just the arithmetic.** Imagine a hillside where height is the loss, one direction is `overs`, and the other is `wickets`. A step down that hillside isn't a walk along the overs axis followed by a separate walk along the wickets axis — it's one look at the actual slope from wherever the model is currently standing, some blend of both directions, and a single diagonal step straight down that combined slope. Three predictors and the hillside becomes a shape with no name past three dimensions; real models do this across thousands of weights, but the motion is identical at any scale: one look at the whole slope, one step, every weight moving together.

```python
from sklearn.linear_model import SGDRegressor

model = SGDRegressor(
    loss="squared_error",
    learning_rate="constant",
    eta0=0.01,
    tol=1e-3,
    max_iter=1000,
)
model.fit(X_train, y_train)
```

Run this against overs/wickets/run-rate data and the coefficients it settles on land close to whatever the normal equation would have produced outright — the same weight and bias, the same projected score, reached by walking instead of solving. When you get to **Linear Regression**, you'll see that exact match made explicit.

## Regularisation: Making the Model Pay for Trying Too Hard

**Underfitting, Overfitting & Finding the Sweet Spot** told you to reach for "regularisation" when a model is overfitting, and left the word doing a lot of unexplained work. Here's what it actually is, now that you've seen the loss function up close: **regularisation is an extra term bolted directly onto the loss, penalising the weights themselves for being large or numerous — not just the predictions for being wrong.**

Ordinary loss asks one question: how far off were the predictions? A regularised loss asks two, and adds them together:

Loss_regularised = Loss_original + λ · penalty(weights)

Gradient descent doesn't know or care which part of that sum it's minimising — it just walks downhill on the total. Which means a weight can no longer grow huge for free, chasing one quirky net session's worth of deliveries, unless shrinking the raw prediction error by that much is worth the penalty it now costs to carry a weight that size. It's the coach who marks a batter down not just for runs scored, but for technique that only works against one specific bowling machine — an elaborate, over-fitted trigger movement has to earn its keep against the penalty, not just against the scoreboard.

λ (in `sklearn`'s `LogisticRegression`, its inverse, `C`) is the dial that decides how much the penalty matters relative to the error. A small `C` — strong regularisation — tells the model that carrying large weights is expensive, so it had better be worth it. That's the fix **Underfitting, Overfitting & Finding the Sweet Spot** was gesturing at with "lower `C`" for an overfitting model, and now you know why it works: it's not a separate correction bolted on afterward, it's a change to the exact number gradient descent has been walking downhill on the whole time.

The two standard penalty shapes behave differently:

- **L2 (Ridge)** penalises the sum of *squared* weights. Every weight gets nudged smaller, roughly in proportion to its size — a general instruction to tone everything down a little, with nothing banned outright.
- **L1 (Lasso)** penalises the sum of *absolute* weights. This shape has a sharper habit: it tends to push the least useful weights all the way to exactly zero, dropping them from the model entirely rather than just shrinking them. That's regularisation doubling as feature selection — a second, automatic route to the same trimmed roster **Feature Selection & Hyperparameter Optimisation** built by hand with `corr()`, and a third route (alongside sequential selection and PCA) to the same too-many-features problem **Model Selection** covers.

Applied to plain linear regression, these two penalties are common enough to have their own names: L2-penalised linear regression is **Ridge**, L1-penalised linear regression is **Lasso**. Both still need λ set to something, and rather than guess, `scikit-learn` will search a range of candidates via built-in cross-validation and keep the best one:

```python
import numpy as np
from sklearn.linear_model import RidgeCV, LassoCV

ridge = RidgeCV(alphas=np.linspace(0.1, 10, num=100))
ridge.fit(X, y)

lasso = LassoCV(alphas=np.linspace(0.1, 10, num=100))
lasso.fit(X, y)
```

`alphas` is the shortlist of candidate λ values to trial; each `CV` class scores every one of them by cross-validation internally and settles on whichever strength generalises best, the same instinct as **Feature Selection & Hyperparameter Optimisation**'s grid search, now narrowed to a single dial.

One requirement is easy to skip and expensive to skip: **standardise your features before fitting a regularised model.** The penalty term sums up coefficients directly, so it has no way of knowing that a coefficient of `40` on a feature measured in the thousands is timid while a coefficient of `40` on a feature measured in single digits is enormous — it just sees two coefficients of `40` and penalises them identically. Left unscaled, regularisation ends up punishing whichever features happen to have small raw coefficients, regardless of how much they actually matter, exactly the failure mode min-max scaling and standardisation already exist to prevent in **K-Nearest Neighbours** and **K-Means Clustering**.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

## Why Walk When You Can Just Solve It?

For plain linear regression, the normal equation is genuinely the better tool most of the time — it's exact, and there's no learning rate to get wrong. Gradient descent earns its keep in two situations the closed form struggles with:

**Scale.** The normal equation requires inverting (XᵀX), and matrix inversion gets punishingly expensive as the number of predictors grows — the "increased minima and ground to cover" that makes standard gradient descent itself slow with many predictors, only worse for a direct matrix solve. Gradient descent's per-step cost barely notices how many dials it's turning.

**Everywhere the closed form doesn't exist at all.** Plain linear regression is one of the few models simple enough to solve exactly in one shot. Logistic regression, and every network layer waiting in Second Innings, has no equivalent clean formula — gradient descent, walking downhill one step at a time, is the *only* way most models ever get tuned. Learn it here and it explains not just this chapter, but a great deal of what comes later.

## Stopping the Spell: Three Hyperparameters

Gradient descent doesn't run forever, and it's governed by exactly three settings:

- **Learning rate** — how big each step is.
- **Maximum iterations** — the hard cap on how many balls get bowled before someone calls stumps regardless of where things stand.
- **Stopping tolerance** — if the loss barely changes between one iteration and the next, smaller than some threshold you set, there's no point continuing. The bowler has, for practical purposes, found the length; every further correction is chasing a difference too small to matter.

```python
SGDRegressor(
    loss="squared_error",
    learning_rate="constant",
    eta0=0.01,       # the initial step size
    tol=1e-3,        # stop once improvement drops below this
    max_iter=1000,   # or stop here regardless
)
```

Whichever condition trips first ends the run — converged early, or simply out of overs.

## Doing It at Scale: Stochastic Gradient Descent

Everything so far describes **batch gradient descent** — computing the exact gradient using every single row of training data before making even one adjustment. Accurate, and increasingly unaffordable: recomputing the loss and every partial derivative across the *entire* season's footage before allowing yourself one tiny correction to your length doesn't scale once the season has a hundred thousand deliveries in it.

**Stochastic gradient descent** fixes this by using just a sample of the data for each update — sometimes a single delivery, more often a small batch — rather than the whole archive every time.

```python
from sklearn.linear_model import SGDRegressor

model = SGDRegressor(loss="squared_error", learning_rate="optimal")
model.fit(X_train, y_train)
```

Think of it as adjusting after each net session instead of reviewing the entire year's tape before allowing yourself a single correction. Each individual update is noisier — one small, possibly unrepresentative batch of deliveries can point in a slightly wrong direction — but it's dramatically cheaper, and across many such updates the noise tends to cancel out, landing in roughly the same valley the slow, exact method would have found. It's also why `SGDRegressor` accepts a `learning_rate="optimal"` setting: scikit-learn's implementation doesn't just take steps, it continually re-tunes their size as training proceeds, rather than trusting one fixed setting for the whole spell.

## Not Just for Runs: Gradient Descent as a Classifier

Nothing about "measure the error, find the downhill direction, take a step" is specific to predicting a number. Swap the loss function for one that scores label mismatches instead of run differences, and the exact same optimiser tunes a classifier:

```python
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import classification_report

clf = SGDClassifier(loss="squared_error", class_weight="balanced")
clf.fit(X_train, y_train)
print(classification_report(y_val, clf.predict(X_val)))
```

`classification_report` is the same tool from **Evaluation Metrics & Data Leakage** — precision, recall, and F1 haven't changed. What's changed is only what's underneath the model doing the tuning: still a bowler adjusting length by feel, just aiming at a different kind of stumps.

## Ground Rules for the Dressing-Room Wall

- **The gradient is a direction, not an answer.** It tells you which way to correct, and how urgently — never the perfect setting outright.
- **The learning rate is the size of the correction, and it's easy to get wrong in both directions.** Too large overshoots and can even diverge; too small crawls and may never arrive within your iteration budget.
- **A loss landscape can have false floors.** A local minimum looks like the answer from nearby and can still be far from the true global minimum.
- **More dials make the landscape harder to search exhaustively** — exactly why gradient descent, not grid search, is how models with continuous parameters get tuned.
- **Three hyperparameters govern the whole process:** learning rate, maximum iterations, and a stopping tolerance. Any one of them can end the run.
- **Every weight updates in the same step, but not by the same amount.** All partial derivatives get computed off one shared forward pass, then the whole vector moves at once — each weight in proportion to its own gradient, not tuned one predictor at a time like a sequential feature selector.
- **Regularisation is a penalty added to the loss itself, not a separate step.** Large weights now cost something, so gradient descent only keeps them where they earn their keep. L2 (Ridge) shrinks everything a little; L1 (Lasso) can drop weights to zero outright.
- **`RidgeCV`/`LassoCV` search for the penalty strength instead of you guessing it**, scoring a shortlist of candidate `alpha` values by cross-validation and keeping the best.
- **Standardise before you regularise.** The penalty sums coefficients directly, so features on different scales get penalised unfairly unless they're all on the same footing first.
- **Stochastic gradient descent trades a little accuracy per step for a lot of speed** — sampling instead of scanning the whole dataset on every update.
- **The mechanism doesn't care what it's optimising.** Swap the loss function and the same downhill walk tunes a classifier instead of a regressor.

---

Feature Selection & Hyperparameter Optimisation searched over a short list and kept the winner. This chapter's bowler had no such list — just a length, a miss, a direction to correct in, and enough overs to get there. That's the trick underneath the projected score's coefficients, underneath a classifier's decision boundary, and — several chapters from now, in Second Innings — underneath every single layer of a network learning to bat.
