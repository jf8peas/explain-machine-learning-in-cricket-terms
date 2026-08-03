---
layout: ../../layouts/MatchLayout.astro
title: "The Practice Nets: Train/Test Splits & Model Fit"
innings: scoring-model-evaluation
chapter: practice-nets
meta: "7 min · data splits & fit"
lede: "You don't evaluate a batter's match readiness by how well they hit gentle throw-downs in the nets. To build an accurate model, you must split your data and learn the difference between practicing footwork and flat-track bullying."
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
  - { k: "Net Practice", v: "Train Set", s: "learning the strokes" }
  - { k: "Match Day", v: "Test Set", s: "unseen bowling" }
  - { k: "Net Hero", v: "Overfitting", s: "memorized throw-downs" }
  - { k: "One-Trick", v: "Underfitting", s: "too simple technique" }
---

Every club has one. The player who murders the bowling in the nets — pulls, cuts, lofts everything over the sightscreen — and then walks out on Saturday and nicks off for three. The coach knew. The coach always knows. And the reason the coach knows is that they never once mistook net form for match form.

Your model has exactly the same problem, and this chapter is about not being fooled by it.

## Dividing the Ground: Data Splits

Scoring a model on the data it trained on is the cardinal sin of machine learning. Not a rookie mistake — a *sin*, because it produces a number that looks wonderful and means nothing, and it will happily follow you all the way into production before anyone notices.

Think about what you are actually asking. You have shown the model 10,000 deliveries. You then ask it to play those same 10,000 deliveries again and report how it did. A sufficiently complex model can simply memorise all 10,000 and answer perfectly. That tells you the model has a good memory. It tells you nothing about whether it can bat.

So we divide the ground into three areas, each with a different job.

### Training Set — Net Practice and Throw-downs

This is where the volume happens. Thousands of deliveries, a coach feeding balls from twenty-two yards, the batter grooving footwork, timing, and shot selection. Mistakes here are free and expected — that is the entire point of a net. The model looks at these rows over and over, adjusting its internal parameters until the patterns stick.

Roughly 70–80% of your data lives here.

### Validation Set — Center-Wicket Warm-Up Matches

Between the nets and the Test match sits the practice fixture: full-length, match conditions, real bowlers, no trophy. This is where the coaching staff try things. Move the young left-hander up to three. Ask the seamer to bowl a fuller length. See what happens.

The validation set is your center-wicket warm-up. You use it to make decisions *about* the model without touching the official benchmark:

- Which algorithm to use
- Which hyperparameter settings work — `C`, tree depth, learning rate, number of neighbours
- Which features to keep and which to drop
- When to stop training

You may look at the validation score as many times as you like. That freedom is precisely why it cannot also serve as your final verdict — a score you have optimised against is a score you have contaminated.

Typically 10–15%.

### Test Set — Match Day

Sealed in the vault. Opened once, at the very end, after every decision has already been made.

The test set exists to answer one question: *how will this perform against deliveries nobody has ever seen?* It is a one-shot instrument. If you run it, see a disappointing number, go back and adjust something, then run it again, you have converted your test set into a second validation set and you no longer have an honest estimate of anything.

Around 10–15%, and treated with something close to superstition.

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

A few ground rules worth taping to the dressing-room wall:

- **Split before you do anything else.** Scaling, imputing, encoding — fit those on the training set only, then apply the fitted transformer to validation and test. Fit a `StandardScaler` on the full dataset and you have leaked information about match day into your net sessions.
- **Fix your `random_state`.** Reproducible splits mean comparable results.
- **Stratify when classes are imbalanced.** `stratify=y` keeps the same class proportions in every split, so you don't end up with a validation set containing four examples of your rare class.

Now, with the ground properly divided, we can talk about the two ways a technique goes wrong.

## Underfitting: The One-Dimensional Batter (High Bias)

Picture a batter who has learned exactly one shot: the forward defensive.

Short ball climbing at the throat? Forward defence. Yorker crashing into the base of off stump? Forward defence. Leg-spinner drifting wide outside leg? Forward defence, played hopefully in the general direction of the bowler. The technique is *consistent*. It is also useless.

This batter does not score runs in the nets. They do not score runs on match day. They do not score runs anywhere, because their model of "how to bat" is too simple to capture what batting actually requires.

That is **underfitting**, or **high bias**. The model's capacity is too small for the structure in the data. A straight line trying to trace a curve. A depth-1 decision tree asked to separate ten classes. No amount of extra practice fixes it, because the limitation is in the technique itself, not the volume of reps.

**The diagnostic sign is unmistakable: poor performance on the training set *and* poor performance on validation.** Both numbers are bad, and they are bad together.

```python
model.score(X_train, y_train)   # 0.61
model.score(X_val,   y_val)     # 0.59
```

Two low scores sitting next to each other is the signature. If you see this, do not reach for more data — more throw-downs will not teach a blocker to drive. Reach for:

- A more expressive model (polynomial terms, a deeper tree, more layers)
- Better or more informative features
- Less regularisation — you have been coaching caution into a player who needs to play shots
- Longer training, if it simply hasn't converged yet

## Overfitting: The Flat-Track Bully and the Net Hero (High Variance)

Now the opposite failure, and the more seductive one.

Our net hero has spent six months in the same indoor facility, facing the same bowling machine, set to the same length, at the same pace, off the same worn patch of artificial turf. They have effectively memorised it. Ball leaves the machine, and before it has travelled a yard they are already into the shot — because it is *always this ball*. Six, four, six, six. They look like Bradman. People come to watch.

Then the tour party lands, and they walk out on a green, seaming, bouncy overseas wicket with a cross-breeze and a bowler who has never operated at a fixed pace in his life. First delivery moves half a bat's width off the seam. Caught behind. Duck.

Nothing was learned about *how a cricket ball moves*. What was learned was the specific quirks of one bowling machine in one shed — the **noise**, not the **signal**.

That is **overfitting**, or **high variance**. The model has enough capacity to memorise the training set, including its random idiosyncrasies, and it has done exactly that.

**The diagnostic sign is a gap:**

```python
model.score(X_train, y_train)   # 0.998
model.score(X_val,   y_val)     # 0.712
```

Near-perfect in the nets, falling apart in the middle. Whenever training accuracy substantially exceeds validation accuracy, you are looking at a net hero. The size of that gap *is* the measurement — watch it, not the training score.

The remedies all amount to varying the practice conditions:

- **More data** — more bowlers, more surfaces, more genuine variety
- **Regularisation** (L1/L2, dropout, lower `C`) — penalise the model for over-committing to any single pattern
- **Simplify** — shallower trees, fewer features, fewer parameters
- **Cross-validation** — rotate which slice is held out, so no single quirky split flatters you
- **Early stopping** — pull the batter out of the nets before they start grooving in bad habits
- **Data augmentation** — change the machine's pace and length between deliveries

One thing that never fixes overfitting: more training on the same data. That is sending the net hero back to the same shed.

## Generalization: Finding the Sweet Spot

Between the blocker and the bully stands the player you actually want.

They do not have one shot, and they have not memorised one bowler. What they have is **adaptable fundamentals**: watch the ball out of the hand, get the front foot moving, play late, and — critically — know which shot the delivery deserves. Full and straight, drive it. Short and wide, cut it. Angling across outside off with a hint of movement, leave it alone and let it go through to the keeper.

That last one matters more than it sounds. Knowing when *not* to play is a learned skill, and it is the closest thing cricket has to a good regularisation term.

Because the fundamentals are general rather than memorised, the technique travels. Indoor nets in February, a dry turner in Chennai, a seaming green top in Leeds — the same batter, adjusting, scoring. That portability is **generalization**: performance on data drawn from the real distribution, not just on the rows you happened to train with.

The trade-off has a shape, and it is worth carrying around as a picture. As you increase model complexity, training error falls continuously — a more complex model can always fit the nets better. Validation error falls too, for a while, as the model captures more genuine structure. Then it turns and starts climbing, as the model begins fitting noise.

**The sweet spot is the bottom of that validation curve.** Not the point of lowest training error — that is the far right of the graph, where the net hero lives.

```python
from sklearn.model_selection import cross_val_score

for depth in [1, 3, 5, 10, 20, None]:
    model = DecisionTreeClassifier(max_depth=depth, random_state=42)
    scores = cross_val_score(model, X_train, y_train, cv=5)
    print(depth, round(scores.mean(), 4))

# 1      0.8912
# 3      0.9317
# 5      0.9401   <- sweet spot
# 10     0.9285
# 20     0.9163
# None   0.9138
```

Rising, peaking, falling. Depth 1 is the forward-defence-only batter. Depth `None` is the net hero. Depth 5 can bat anywhere.

Note that this search ran entirely on the training data via cross-validation. The test set has not been opened. It is still in the vault, where it belongs, until the squad is final.

## Match Day Checklist

- **Split first, split cleanly.** Train / validation / test at roughly 80/10/10. Do it before scaling, imputing, or encoding anything.
- **Fit transformers on training data only.** Then apply them to validation and test. Anything else is leakage wearing a disguise.
- **Fix `random_state`; use `stratify=y`** when classes are imbalanced.
- **Never score on training data and call it performance.** It is a memory test, not a batting average.
- **Watch the gap, not the score.** Train ≈ validation and both low means underfitting. Train high, validation low means overfitting. The distance between them is your diagnosis.
- **Underfitting → add capacity.** Richer model, better features, less regularisation. More data will not help.
- **Overfitting → add variety or subtract capacity.** More data, more regularisation, simpler model, early stopping. More epochs will not help.
- **Tune against validation, never against test.** Every peek at the test set spends a little of its credibility.
- **Open the vault once.** Final model, final settings, one run, report the number honestly — including when it disappoints.
- **Optimise for the middle, not the nets.** Nobody hands out caps for net form.

---

The head coach's line is worth keeping. In the nets, everyone looks like Bradman. Your job is not to build a model that looks good in the nets — it is to build one you would happily send out on a green wicket, in a stiff breeze, against a bowler it has never faced.

Next chapter: what to do when accuracy itself is the thing lying to you.