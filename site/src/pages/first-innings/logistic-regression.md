---
layout: ../../layouts/MatchLayout.astro
title: "Logistic Regression: How Plumb Was It?"
innings: first-innings
chapter: logistic-regression
meta: "16 min · turning an appeal into a probability"
lede: "No umpire actually thinks in yes or no. There's a sliding scale in their head running from 'stone dead plumb' to 'not a hope in the world,' and the finger only goes up once that internal reading crosses a line. Logistic Regression is that sliding scale, written down."
commentary: "'Nobody's ever 100% certain out there. Some of us are just a lot more certain than others.' — Umpire"
codeFile: first_innings/logistic_regression.py
codeOut: "P(out) 0.73 · odds ≈ 2.7 to 1 · call: OUT"
code: |
  from sklearn.linear_model import LogisticRegression

  model = LogisticRegression()
  model.fit(X_train, y_train)

  print("intercept", round(model.intercept_[0], 2))
  print("coefficients", dict(zip(X_train.columns, model.coef_[0].round(2))))

  proba = model.predict_proba(X_val)[:, 1]
  print("P(out) for first delivery:", round(proba[0], 2))
stats:
  - { k: "Output", v: "Probability", s: "squeezed through the sigmoid" }
  - { k: "Linear In", v: "Log-Odds", s: "not in probability itself" }
  - { k: "Loss", v: "Log-Loss", s: "punishes confident wrongness hard" }
  - { k: "Coefficient", v: "Odds Ratio", s: "eᵝ, not runs" }
---

## A Straight Line Can't Live Between Zero and One

**Linear Regression**, last chapter, fit a straight line to a target that could be any number — runs, and runs alone, with no ceiling and no floor. The DRS review from **Classification vs Regression** has a target that's nothing like that: out, or not out. Two values, and a straight line has no idea how to behave itself between them — ask a fitted line for a prediction and it will cheerfully hand back `-0.3` or `1.8`, numbers that mean nothing as a chance of anything.

**Logistic Regression** is, in the most literal sense, the classification equivalent of linear regression — same linear combination of predictors, same weights, same intercept, still found by the same downhill walk from **Gradient Descent**. What's different is what happens to that linear combination on its way out the door, and that difference is the whole chapter.

## Probability, Odds, and Log-Odds: Three Ways to Say How Sure You Are

Before the sigmoid, three ways of expressing the exact same underlying confidence, each with different manners.

**Probability** is the plain one — the chance the outcome is "out," somewhere between 0 and 1. Bounded on both ends, which is precisely the problem: a linear model doesn't know how to stay inside a fence.

**Odds** rephrase the same confidence as a ratio — probability of the event over probability against it. This is the bookmaker's native language: "2 to 1" means twice as likely to happen as not. Odds run from 0 up to infinity, so at least the ceiling is gone, but they still can't go negative, and a straight line doesn't respect that fence either.

**Log-odds** — the logarithm of the odds — finally break free in both directions, running the whole way from negative infinity to positive infinity. That's exactly the range a linear combination of predictors already produces naturally. Log-odds are the honest target. Probability is just the report you eventually translate it into for the scoreboard.

Take one LBW shout and run it through all three. Say the model looks at this delivery and lands on a probability of `0.75` — 75% likely to be out.

- **Probability**: `0.75`. Reads naturally. Bounded between 0 and 1, which is exactly why a straight line can't predict it honestly — nothing stops linear regression from handing back `1.4` or `-0.2`.
- **Odds**: `0.75 / 0.25 = 3`. This is the bookmaker's "3 to 1 on" — three times as likely to be out as not. The lower fence is gone (odds can't go negative), but the upper one's still there.
- **Log-odds**: `ln(3) ≈ 1.10`. Finally unbounded both ways — the number the model is honestly allowed to predict.

The pattern that matters sits in how these three move together across a full range of confidence:

| Probability | Odds | Log-odds |
|---|---|---|
| 0.95 — near-certain out | 19 | +2.94 |
| 0.75 — fairly confident | 3 | +1.10 |
| 0.50 — dead-even shout | 1 | 0 |
| 0.25 — fairly confident not out | 0.33 | −1.10 |
| 0.05 — near-certain not out | 0.053 | −2.94 |

Odds are lopsided around a coin-flip shout — 3 on one side of even, but `0.33` rather than `-3` on the other — which is exactly the fence a linear model can't respect. Log-odds are perfectly symmetric around zero at the dead-even 0.50 mark, and climb without limit toward either extreme. That symmetry is why log-odds, not probability or odds, is the quantity a straight line can honestly predict.

Z = β₀ + β₁X

Z here is log-odds — the model's raw, unfiltered opinion, in units nobody outside a statistics department finds intuitive.

## The Sigmoid: Squeezing the Opinion Back Into a Percentage

An umpire's gut certainty is exactly this kind of unbounded quantity — it can run from "plumb, no argument, biggest of all shouts" to "not in a million years," with no natural ceiling on how sure or unsure they feel. The **sigmoid function** is what takes that raw, unbounded reading and squashes it back into something you could put a percentage sign on:

E[Y] = h(Z) = 1 / (1 + e^(−Z))

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))
```

![A line chart titled The sigmoid: log-odds squeezed into a probability. An S-shaped curve rises from near zero on the left to near one on the right, flattening at both ends and crossing the midpoint exactly at Z equals zero, probability 0.5. Four points from the earlier probability, odds and log-odds table are marked on the curve: Z equals negative 2.94 at probability 0.05, Z equals 0 at probability 0.50, Z equals 1.10 at probability 0.75, and Z equals 2.94 at probability 0.95.](/explain-machine-learning-in-cricket-terms/images/sigmoid.png)

Same four shouts from the table a moment ago, now sitting on the curve. The middle of the S is the steep part — near `Z = 0`, a small nudge in log-odds swings the probability substantially, which is exactly why a dead-even shout is the most sensitive point on the whole curve. Out at the flat ends, near-certainty in either direction, that same size nudge barely moves the probability at all — the umpire's already made up their mind, and no small scrap of new evidence is going to shift it much further.

Feed it a very negative Z and it flattens toward 0. Feed it a very positive Z and it flattens toward 1. Feed it exactly 0 and it lands precisely on 0.5 — the model's version of a genuine, dead-even shout. The sigmoid never quite touches either fence, which is honest: no model — no umpire — should ever claim absolute certainty.

## Fitting It: The Same Walk, a Sharper Penalty

**Gradient Descent** already covered the mechanism — guess, measure the loss, find the downhill direction, take a step, repeat. What changes here is the loss function itself. Linear regression punished misses with squared error. Logistic regression uses **log-loss**, and the shape of that punishment is deliberate:

```python
costs = y * (-np.log(hz)) + (1 - y) * (-np.log(1 - hz))
```

Read it delivery by delivery. When the true call is "out" (`y = 1`), only the first term survives, and it punishes a confident wrong prediction savagely — an umpire who predicted `hz = 0.01` ("essentially impossible") on a delivery that turns out to be plumb is charged a cost that shoots toward infinity as `hz` approaches zero. A cautious near-miss barely costs anything by comparison. Squared error, from **Linear Regression**, only ever grows quadratically. Log-loss is far less forgiving of confident wrongness, which is exactly the behaviour you want from a probability: say you're nearly certain, and you had better be right.

Built by hand, one delivery at a time, this is the whole training loop:

```python
def gradient_descent(init, x, y, iterations=1000, learning_rate=0.0001,
                      stopping_threshold=1e-6):
    previous_cost = None
    beta0, beta1 = init[0], init[1]

    for i in range(iterations):
        hz = 1 / (1 + np.exp(-1 * (beta0 + beta1 * x)))            # predicted P(out)
        costs = y * (-np.log(hz)) + (1 - y) * (-np.log(1 - hz))    # log-loss per delivery
        current_cost = sum(costs)

        if previous_cost and abs(previous_cost - current_cost) <= stopping_threshold:
            break
        previous_cost = current_cost

        beta0_derivative = np.mean(hz - y)
        beta1_derivative = np.mean(x * (hz - y))
        beta0 = beta0 - learning_rate * beta0_derivative
        beta1 = beta1 - learning_rate * beta1_derivative

    return np.array([beta0, beta1])
```

Same shape as every gradient descent loop you've already met: a prediction, a cost, a stopping check, a nudge in the downhill direction, repeat. In practice, nobody writes this out — `sklearn` does the walking for you:

```python
from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
model.fit(X_train, y_train)
```

## Reading the Coefficients: Percent Changes, Not Runs

```python
model.intercept_
model.coef_
model.predict_proba(X)
```

Here's the trap that catches everyone coming from linear regression: **a logistic regression coefficient is not "runs per unit," because the model isn't linear in probability — it's linear in log-odds.** A coefficient of `0.7` on "delivery pitched in line with the stumps" doesn't mean "add 0.7 to the chance of being out." It means: add `0.7` to the log-odds, which — undoing the logarithm — means **multiply the odds by e^0.7 ≈ 2.01.** Pitching in line, all else held equal, roughly doubles the odds of the decision going against the batter. That's an **odds ratio**, and it's the native, honest unit a logistic coefficient speaks in.

`model.predict_proba(X)` will hand you probabilities directly, and they're the number you'll actually report — but they're the less useful number to *reason* with. A coefficient's effect on log-odds is constant everywhere; its effect on probability is not. Near a coin-flip (probability around 0.5), a small nudge in log-odds swings the probability substantially. Out near the extremes (a probability already at 0.02 or 0.98), that exact same nudge in log-odds barely moves the probability at all — the sigmoid has gone nearly flat out there. Same coefficient, wildly different real-world impact, depending entirely on where you started. Odds ratios don't have that problem — the same multiplier applies everywhere on the curve, regardless of where you started. Know the odds before you trust the probability.

## Grading the Verdict: Four Numbers, Two Vocabularies

**The Scorer's Box** already gave you precision and recall. Evaluating a logistic regression classifier the way statisticians traditionally do adds two more numbers to the same confusion matrix, under different names:

| Stats name | Same as | Formula | Question it answers |
|---|---|---|---|
| **Sensitivity** | Recall | TP / (TP + FN) | Of every genuine dismissal, how many did we call correctly? |
| **Specificity** | — (new) | TN / (TN + FP) | Of every genuine not-out, how many did we correctly clear? |
| **PPV** | Precision | TP / (TP + FP) | Of everything we called "out," how much of it actually was? |
| **NPV** | — (new) | TN / (TN + FN) | Of everything we called "not out," how much of it actually was? |

Specificity and NPV are the mirror images of sensitivity and PPV, just facing the negative class instead of the positive one. A model can have excellent sensitivity — catching every real dismissal — while being trigger-happy and hopeless at specificity, wrongly convicting batters left and right. The two vocabularies (precision/recall from machine learning, PPV/sensitivity from statistics and medicine) measure exactly the same arithmetic; you'll meet both in the wild, so it's worth recognising them as the same four numbers wearing different shirts.

```python
from sklearn.metrics import accuracy_score, confusion_matrix

predictions = model.predict(X_val)
accuracy_score(y_val, predictions)
confusion_matrix(y_val, predictions)
```

`accuracy_score` gives you the plain correct-over-total figure — still vulnerable to the class-imbalance trap **The Scorer's Box** warned about, since "not out" vastly outnumbers "out" across an innings. `confusion_matrix` gives you the raw counts everything else in this table is arithmetic on.

## A Quick Scout Before You Model Anything

Before fitting anything at all, a fast way to check whether a feature is even worth including — group by the outcome and compare averages:

```python
deliveries.groupby("given_out").agg({
    "ball_speed": "mean",
    "seam_deviation": "mean",
})
```

If deliveries given out show a noticeably different average seam deviation than deliveries that weren't, that's a feature worth including. If the two groups look identical, that column probably isn't carrying much signal — the same instinct as `corr()` in **Trial Matches**, just split-apply-combined across categories instead of measured as a single linear number.

## Overfitting Hasn't Gone Anywhere

Everything **Form and Class** taught about overfitting applies here without a single change. A logistic regression with too many predictors, or predictors too aggressively engineered, will learn the specific noise of the training deliveries rather than the underlying relationship between conditions and dismissals — evidenced, exactly as before, by training accuracy that looks superb next to validation accuracy that doesn't. Regularisation, from **Gradient Descent**, is the standard fix, and it applies to logistic regression's log-odds exactly as it applied to linear regression's raw coefficients.

## Beyond Out or Not Out: Multi-Class

Nothing about this restricts you to two outcomes. `LogisticRegression` handles a five-way call — dot ball, single, four, six, wicket — the same way it handles a two-way one; you fit it on a target column with five labels instead of two, and `sklearn` manages the extension for you.

What changes is the shape of everything downstream. Instead of one set of coefficients, there's effectively one per class, each measuring what pushes a delivery toward that particular outcome versus the rest. The tidy 2×2 confusion matrix becomes a 5×5 grid, and precision, recall, sensitivity, and specificity all need to be computed *per class* — "precision for predicting Six" is a different number from "precision for predicting Dot Ball" — or averaged into one summary figure. The mechanism doesn't change. The bookkeeping does.

## Ground Rules for the Dressing-Room Wall

- **Probability is bounded; log-odds aren't.** That's why the model is linear in log-odds, not in probability directly.
- **The sigmoid translates unbounded confidence into a reportable percentage.** It never quite touches 0 or 1, which is the honest behaviour.
- **Log-loss punishes confident wrongness far harder than squared error does.** A near-certain wrong call costs enormously more than a cautious near-miss.
- **A coefficient is an odds ratio, not a "runs per unit."** `e^coefficient` tells you how much a predictor multiplies the odds, holding everything else fixed.
- **Probability's sensitivity to a predictor depends on where you start.** The same coefficient moves probability a lot near 50/50 and barely at all near the extremes — reason in odds, report in probability.
- **Sensitivity/PPV and recall/precision are the same arithmetic in different clothes.** Specificity and NPV are the mirror images, covering the negative class the way recall and precision cover the positive one.
- **Overfitting and regularisation work exactly as before.** Nothing about a categorical target changes the diagnosis or the fix.
- **Multi-class is the same model, more bookkeeping.** One coefficient set per class, one confusion matrix that's grown past 2×2.

---

An umpire was never picking between two buttons. There was always a sliding scale of certainty behind the decision, and logistic regression is just that scale, made explicit, fitted from data, and translated — through one careful squeeze of a sigmoid — into a number the giant screen can actually show the crowd.
