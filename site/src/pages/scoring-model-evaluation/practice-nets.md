---
layout: ../../layouts/MatchLayout.astro
title: "Train/Validation/Test Splits"
subtitle: "The Practice Nets"
innings: scoring-model-evaluation
chapter: practice-nets
meta: "7 min · train, validation & test splits"
lede: "You don't judge a batter's match readiness by how well they hit gentle throw-downs in the nets. Before you can trust a single number your model reports, you have to divide the ground — nets, warm-up fixture, and a Match Day sealed in the vault."
commentary: "'In the nets, everyone looks like Bradman. Match day on a green wicket is where you find out who can actually bat.' — Head Coach"
codeFile: scoring/train_test_split.py
codeOut: "train: 80% (net practice) · val: 10% (center wicket) · test: 10% (match day)"
code: |
  from sklearn.model_selection import train_test_split
  # Splitting historical match telemetry into Net Practice and Match Day
  X_train, X_test, y_train, y_test = train_test_split(
      features, targets, test_size=0.2, random_state=42
  )
stats:
  - { k: "Net Practice", v: "Train Set", s: "70–80% · learning the strokes" }
  - { k: "Center Wicket", v: "Validation Set", s: "10–15% · trying things out" }
  - { k: "Match Day", v: "Test Set", s: "10–15% · unseen bowling" }
  - { k: "The Vault", v: "Opened Once", s: "no second looks" }
---

Every club has one. The player who murders the bowling in the nets — pulls, cuts, lofts everything over the sightscreen — and then walks out on Saturday and nicks off for three. The coach knew. The coach always knows. And the reason the coach knows is that they never once mistook net form for match form.

Your model has exactly the same problem, and this chapter is about building a ground that won't let it fool you.

## The Cardinal Sin

Scoring a model on the data it trained on is the cardinal sin of machine learning. Not a rookie mistake — a *sin*, because it produces a number that looks wonderful and means nothing, and it will happily follow you all the way into production before anyone notices.

Think about what you are actually asking. You have shown the model 10,000 deliveries. You then ask it to play those same 10,000 deliveries again and report how it did. A sufficiently complex model can simply memorise all 10,000 and answer perfectly. That tells you the model has a good memory. It tells you nothing about whether it can bat.

So we divide the ground into three areas, each with a different job, and — this is the part clubs get wrong — a different set of rules about who is allowed to walk on it.

## Training Set — Net Practice and Throw-downs

This is where the volume happens. Thousands of deliveries, a coach feeding balls from twenty-two yards, the batter grooving footwork, timing, and shot selection. Mistakes here are free and expected — that is the entire point of a net. The model looks at these rows over and over, adjusting its internal parameters until the patterns stick.

Nobody is being judged here. Nets are for repetition, and repetition is not evidence.

Roughly 70–80% of your data lives here.

## Validation Set — Center-Wicket Warm-Up Matches

Between the nets and the Test match sits the practice fixture: full-length, match conditions, real bowlers, no trophy. This is where the coaching staff try things. Move the young left-hander up to three. Ask the seamer to bowl a fuller length. See what happens.

The validation set is your center-wicket warm-up. You use it to make decisions *about* the model without touching the official benchmark:

- Which algorithm to use
- Which hyperparameter settings work — `C`, tree depth, learning rate, number of neighbours
- Which features to keep and which to drop
- When to stop training

You may look at the validation score as many times as you like. That freedom is precisely why it cannot also serve as your final verdict — a score you have optimised against is a score you have contaminated.

Typically 10–15%.

## Test Set — Match Day

Sealed in the vault. Opened once, at the very end, after every decision has already been made.

The test set exists to answer one question: *how will this perform against deliveries nobody has ever seen?* It is a one-shot instrument. If you run it, see a disappointing number, go back and adjust something, then run it again, you have converted your test set into a second validation set and you no longer have an honest estimate of anything.

Around 10–15%, and treated with something close to superstition. Some clubs won't even say its name out loud during selection week.

## Who Is Allowed to Touch What

The three areas differ in size, but the far more important difference is *who has permission to change something* while standing on each one.

| Dataset | What is adjusted? | Who/what adjusts it? | Example adjustment |
|---|---|---|---|
| **Training set** — the nets | Model parameters (weights & biases) | The algorithm itself, e.g. gradient descent | Nudging weight β₁ from 0.4 to 0.8 to minimise loss |
| **Validation set** — center wicket | Hyperparameters & architecture | You, or an automated tuner like `GridSearchCV` | Changing alpha from 0.01 to 1.0, or picking Random Forest over Logistic Regression |
| **Test set** — match day | Nothing | No one. Locked away until the very end | Purely measuring final real-world performance |

Read it as a chain of command. In the nets, nobody is consciously deciding anything — the batter's hands and feet are adjusting themselves, ball after ball, the way an optimiser adjusts weights. At the center-wicket fixture, the *coach* is the one adjusting: batting order, bowling plans, whether the young left-hander goes up to three. And on match day, the coach sits in the pavilion with their arms folded and changes nothing at all, because the whole point of match day is to find out what you've actually got.

## Why Not Just Call Validation a "Second Training Set"?

Fair question. Both sets influence the final model. But they operate at completely different levels.

**Direct fitting versus indirect tuning.** The training set is read *by the model*: raw features `X` and targets `y` go in, gradients come out, internal equations get set. The validation set is never seen by the algorithm during mathematical optimisation. You look at the score from outside the rope and decide: *should I stop training early? Should I add more trees to this forest?* The batter learns in the nets. In the warm-up fixture, the batter learns nothing new — **the selectors do**.

**Preventing hyperparameter overfitting.** Suppose you had only a training set and tuned hyperparameters directly against it. The tuner would cheerfully pick whatever settings memorise that data best: tree depth set to infinity, regularisation (the overfitting penalty properly defined in **Gradient Descent**) set to zero, every knob turned to "flatter me."

This is what happens when you let a batter choose their own net conditions. They will pick the length they like, the pace they like, and the surface they like, and their average will be magnificent and entirely fictional.

The validation set is the sanity check. It forces you to choose settings that hold up on deliveries the model's weights have never directly memorised — which is a different question from "which settings score highest in the shed," and a much better one.

## Cutting the Ground in Two Passes

```python
from sklearn.model_selection import train_test_split

# First cut: peel off Match Day (20%) and lock it away
X_temp, X_test, y_temp, y_test = train_test_split(
    features, targets, test_size=0.2, random_state=42
)

# Second cut: split the rest into Net Practice and Center-Wicket
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.125, random_state=42
)

print(len(X_train), len(X_val), len(X_test))
# 80% / 10% / 10%
```

The `test_size=0.125` on the second split looks odd until you follow the arithmetic: it is 12.5% of the remaining 80%, which is 10% of the original. Splitting twice is the standard idiom, and the second fraction always needs this adjustment.

## Ground Rules for the Dressing-Room Wall

- **Know who's adjusting what.** The algorithm tunes parameters on the nets; you tune hyperparameters on the center wicket; nobody tunes anything on match day.
- **Split before you do anything else.** Scaling, imputing, encoding — fit those on the training set only, then apply the fitted transformer to validation and test. Fit a `StandardScaler` on the full dataset and you have leaked information about match day into your net sessions.
- **Fix your `random_state`.** Reproducible splits mean comparable results, and comparable results are the only kind worth arguing about.
- **Stratify when classes are imbalanced.** `stratify=y` keeps the same class proportions in every split, so you don't end up with a validation set containing four examples of your rare class.
- **Never score on training data and call it performance.** It is a memory test, not a batting average.
- **Tune against validation, never against test.** Every peek at the test set spends a little of its credibility.
- **Open the vault once.** Final model, final settings, one run, report the number honestly — including when it disappoints.

## Leakage: The Twelfth Man Who Talks

One more warning before we go in. Leakage is rarely dramatic. It is not usually someone training on the test set outright. It is a scaler fitted too early, a target-derived feature nobody questioned, a duplicate row that ended up on both sides of the split.

The symptom is a score that feels a bit too good. Trust that feeling. In this game, a suspiciously excellent number is almost never a gift — it is a bill arriving later.

---

The ground is now properly divided: nets for grooving, a warm-up fixture for decisions, and Match Day untouched in the vault. Which means we can finally do the thing every coaching staff actually gets paid for — look at a player and work out whether the runs are real.

Next chapter: **Form and Class** — where the blockers, the flat-track bullies, and the batters who can actually travel all get argued over.
