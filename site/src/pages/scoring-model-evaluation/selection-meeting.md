---
layout: ../../layouts/MatchLayout.astro
title: "The Selection Meeting: Underfitting, Overfitting & Finding the Sweet Spot"
innings: scoring-model-evaluation
chapter: selection-meeting
meta: "7 min · bias, variance & generalization"
lede: "The ground is divided, the numbers are in, and now four people in a small room have to decide who can actually bat. One candidate has a single shot. One has memorised a bowling machine. Somewhere between them is the player you want."
commentary: "'Form is temporary. Class is permanent. Our job tonight is to work out which one we're looking at.' — Chair of Selectors"
codeFile: scoring/bias_variance.py
codeOut: "depth 1: 0.8912 · depth 5: 0.9401 ← sweet spot · depth None: 0.9138"
code: |
  model.score(X_train, y_train)   # 0.998  net form
  model.score(X_val,   y_val)     # 0.712  match form
  # mind the gap
stats:
  - { k: "One-Trick", v: "Underfitting", s: "high bias · both scores low" }
  - { k: "Net Hero", v: "Overfitting", s: "high variance · mind the gap" }
  - { k: "Travels Well", v: "Good Fit", s: "adaptable fundamentals" }
  - { k: "The Verdict", v: "The Gap", s: "watch it, not the score" }
---

The ground has been divided. Nets, center wicket, and Match Day sealed in the vault. The season's numbers are printed and sitting on the table, and now four people in a room above the pavilion have to do the hard part.

Because a batting average, on its own, has never once told anyone whether a player can bat. What tells you is *where* the runs came from, and *against what*. That is the entire agenda of tonight's meeting, and there are only three kinds of player on the list.

## Underfitting: The One-Dimensional Batter (High Bias)

First name on the sheet. Picture a batter who has learned exactly one shot: the forward defensive.

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

The committee's mistake here is patience. Everyone wants to give the blocker another season. Another season is not the answer; a different technique is.

## Overfitting: The Flat-Track Bully and the Net Hero (High Variance)

Second name, and the one that causes the argument. The seductive failure.

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
- **Regularisation** (L1/L2, dropout, lower `C`) — penalise over-complexity so the model learns clean batting fundamentals rather than memorising pitch cracks
- **Simplify** — shallower trees, fewer features, fewer parameters
- **Cross-validation** — rotate which slice is held out, so no single quirky split flatters you
- **Early stopping** — pull the batter out of the nets before they start grooving in bad habits
- **Data augmentation** — change the machine's pace and length between deliveries

One thing that never fixes overfitting: more training on the same data. That is sending the net hero back to the same shed and hoping the shed has changed.

## Generalization: The Player Who Travels

Third name. Nobody in the room is excited by this one, and that is usually how you know.

They do not have one shot, and they have not memorised one bowler. What they have is **adaptable fundamentals**: watch the ball out of the hand, get the front foot moving, play late, and — critically — know which shot the delivery deserves. Full and straight, drive it. Short and wide, cut it. Angling across outside off with a hint of movement, leave it alone and let it go through to the keeper.

That last one matters more than it sounds. Knowing when *not* to play is a learned skill, and it is the closest thing cricket has to a good regularisation term.

Because the fundamentals are general rather than memorised, the technique travels. Indoor nets in February, a dry turner in Chennai, a seaming green top in Leeds — the same batter, adjusting, scoring. That portability is **generalization**: performance on data drawn from the real distribution, not just on the rows you happened to train with.

Their nets numbers are worse than the net hero's. They will be worse forever. Pick them anyway.

## The Shape of the Trade-off

The argument has a shape, and it is worth carrying around as a picture. As you increase model complexity, training error falls continuously — a more complex model can always fit the nets better. Validation error falls too, for a while, as the model captures more genuine structure. Then it turns and starts climbing, as the model begins fitting noise.

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

## Reading the Room: A Three-Line Diagnosis

| Nets (train) | Middle (validation) | Verdict |
|---|---|---|
| Low | Low | **Underfitting** — add capacity |
| High | Low | **Overfitting** — add variety, subtract capacity |
| High | High | **Good fit** — name the squad |

There is a fourth row people occasionally see — validation *better* than training — and it is almost never a triumph. It usually means your validation split is easier than it should be, or something leaked. Go back and check the split.

## Selection Checklist

- **Watch the gap, not the score.** Train ≈ validation and both low means underfitting. Train high, validation low means overfitting. The distance between them is your diagnosis.
- **Underfitting → add capacity.** Richer model, better features, less regularisation. More data will not help.
- **Overfitting → add variety or subtract capacity.** More data, more regularisation, simpler model, early stopping. More epochs will not help.
- **Cross-validate before you commit.** One flattering split has ended more careers than any bowler.
- **Optimise for the middle, not the nets.** Nobody hands out caps for net form.
- **Open the vault once.** Squad named, one run on Match Day, report the number honestly.

---

The head coach's line is worth keeping. In the nets, everyone looks like Bradman. Your job is not to build a model that looks good in the nets — it is to build one you would happily send out on a green wicket, in a stiff breeze, against a bowler it has never faced.

The squad is named. The number came back respectable. And yet — some of the most confidently selected sides in history have been all out for sixty.

Next chapter: what to do when accuracy itself is the thing lying to you.
