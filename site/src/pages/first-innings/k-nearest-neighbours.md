---
layout: ../../layouts/MatchLayout.astro
title: "K-Nearest Neighbours: Who Does He Remind You Of?"
innings: first-innings
chapter: k-nearest-neighbours
meta: "12 min · the scouting comparison"
lede: "Every scout has said it about an uncapped kid: 'he reminds me of a young someone.' K-Nearest Neighbours is that exact instinct, minus the vagueness — find the players who look most like this one, on the numbers, and let them vote."
commentary: "'I don't have a report on him yet. But put his numbers next to the last five who played that way, and you'll know exactly who he's going to be.' — Chief Scout"
codeFile: first_innings/knn.py
codeOut: "K=5 → 4×Finisher, 1×Anchor → call: Finisher"
code: |
  features = ["batting_avg", "strike_rate", "boundary_pct"]

  # Distance from the uncapped player to every player on file
  distance = 0
  for feature in features:
      distance += (train_df[feature] - scout_target[feature]) ** 2
  train_df["distance"] = distance ** 0.5

  # The five closest comparisons, and what the majority says
  panel = train_df.nsmallest(5, "distance")
  call = panel["role"].mode()[0]
  print(call)
stats:
  - { k: "K", v: "5", s: "size of the panel" }
  - { k: "Distance", v: "Euclidean", s: "√Σ(x − y)²" }
  - { k: "Training phase", v: "None", s: "it's a lazy learner" }
  - { k: "Verdict", v: "Majority", s: "panel votes, label wins" }
---

## The Scouting Instinct, Formalised

Every commentary box does this. An uncapped nineteen-year-old walks out, plays three shots, and someone leans into the microphone: "reminds me of a young [established player]." Nobody derived that from first principles. They compared this player's numbers to players they already know, found the closest few, and borrowed a label.

**K-Nearest Neighbours (KNN)** is that instinct with the guesswork surgically removed. Give it an unlabelled player, and it finds the **K** most similar players already on file — by the numbers, not the eye test — and hands the new player whatever label the majority of them share.

## No Nets Required

Most of the models in this innings spend a preseason in the nets: reading the training data once, adjusting a set of internal parameters, then packing that knowledge away into a compact model before ever meeting a new player. KNN skips the nets entirely.

It keeps the *entire* scouting database on file and does all its actual work at the moment someone asks the question — every comparison, computed fresh, every single time. There is no equation to inspect afterwards, no weights, nothing that was "learned" in advance. The database *is* the model. That makes KNN essentially free to set up and comparatively expensive to ask, since answering one question means re-scanning the whole squad.

## Measuring "Similar"

Before any of this works, "similar" needs to become a number. The standard answer is **Euclidean distance** — the plain, ruler-straight gap between two players' stat lines, feature by feature.

With a single stat, it's just the difference between two numbers:

```python
abs(train_df["strike_rate"] - scout_target["strike_rate"])
```

Compare a player on more than one stat — batting average, strike rate, boundary percentage, whatever you've got — and the formula for *n* features is:

distance = √( (x₁−y₁)² + (x₂−y₂)² + … + (xₙ−yₙ)² )

which in code is a square, a sum, and a square root:

```python
distance = 0
for feature in features:
    distance += (train_df[feature] - scout_target[feature]) ** 2
train_df["distance"] = distance ** 0.5
```

Smaller distance means a closer comparison. That's the entire engine — everything else is bookkeeping around this one idea.

## Getting Everyone Onto the Same Scale

Two bits of groundwork have to happen before that formula means anything.

**Categorical stats need translating into numbers first.** "Bowling arm" — right-arm or left-arm — isn't a distance apart, it's a label. One-hot encode it into a dummy column before it can take part in any arithmetic:

```python
squad_df = pd.get_dummies(squad_df, columns=["bowling_arm"], drop_first=True)
```

`drop_first=True` skips one category rather than encoding all of them, since knowing "not left-arm" already tells you the player is right-arm — encoding both would just be recording the same fact twice.

**Different stats live on wildly different scales**, and Euclidean distance can't tell the difference between "big number" and "important number." Strike rate roams from 0 to 200-odd; economy rate rarely leaves single digits. Left unscaled, strike rate would dominate every distance calculation purely by being numerically larger — not because it's more informative, just because it's louder. **Min-max scaling** squashes every feature into the same `[0, 1]` range so no single stat bullies the others out of the conversation:

x′ = (x − min(x)) / (max(x) − min(x))

Scale first, encode categoricals first, *then* measure distance. Do it in the wrong order and you're comparing players on a ruler that's secretly rubber.

## Convening the Panel

With the numbers finally comparable, the algorithm itself is four steps — a scouting panel, not a formula to memorise:

1. Take the new, unlabelled player and measure the distance from them to every player in the training file, across every feature.
2. Sort those distances, closest first.
3. Pull the top **K** — these are the K-nearest neighbours.
4. Ask which label the majority of that panel holds, and give it to the new player.

```
              THE PANEL (K = 5)

  comparison player     distance    role
  ───────────────────────────────────────────
  player_114              0.041     Finisher
  player_087              0.058     Finisher
  player_203               0.061     Anchor
  player_045              0.074     Finisher
  player_162              0.079     Finisher
  ───────────────────────────────────────────
  4 Finisher · 1 Anchor  →  call: Finisher
```

## Choosing K Is Choosing How Much to Trust the Nearest Voice

K isn't free to ignore, and the failure modes on either side will look familiar from **Form and Class**.

Set K too small — K=1, say — and the new player's label is decided by whichever single comparison happens to be nearest, fluke or not. One unusual season from one unusual player, and the call flips. That's a **net hero**: high variance, memorising a single close match instead of reading the wider pattern.

Set K too large and the panel starts including players who aren't really comparable at all — at the extreme, K equal to the whole database just returns whatever label is most common overall, regardless of who the new player actually resembles. That's the **one-trick batter** again: high bias, too much smoothing to say anything specific.

The sweet spot, as ever, sits in the middle, and you find it the same way you found it there — by trialling values of K against a validation set, not by guessing.

## Setting Aside a Test Panel

You already know why held-out data matters from **The Practice Nets**. Here's the same idea, written the manual way — cutting a training and test set with `sample()` and `drop()` instead of `train_test_split`:

```python
train_df = squad_df.sample(frac=0.85, random_state=417)
test_df  = squad_df.drop(train_df.index)
```

Eighty-five percent of the historical squad becomes the reference file KNN compares against. The remaining fifteen percent is held back, unseen, so you can test the scout's judgement blind rather than taking their word for it.

## Grading the Scout

Once every held-out player has been given a predicted label, accuracy is simply the share of calls that matched reality:

```python
accuracy = (test_df["predicted_role"] == test_df["role"]).value_counts(normalize=True)[0] * 100
```

One word of caution on that line: `value_counts()` sorts by *frequency*, not by which value means "correct." It only lands on the right number at `[0]` because correct calls happen to be the majority. If your scout is having a genuinely bad day and gets more calls wrong than right, `[0]` will silently hand you the wrong-call rate instead. Safer to filter explicitly for the match you actually want, rather than trust the sort order to save you.

## The Full Report

- **KNN has no training phase.** It stores the data and does the work at query time — a lazy learner, not a coach with a pre-season plan.
- **Distance defines "similar."** Euclidean distance is the default: square the gaps, sum them, square-root the total.
- **Scale before you compare.** One-hot encode categoricals, min-max scale numerics, or your distance calculation is secretly just measuring whichever stat has the biggest numbers.
- **K is a bias–variance dial.** Too small and one lucky or unlucky comparison decides everything; too large and the panel stops saying anything specific about this player.
- **Grade the scout on held-out players.** Accuracy is correct calls over total calls — but check you're reading the correct row out of `value_counts()`, not just the first one.

---

Regression and classification told you what question to ask. K-Nearest Neighbours is the first player on the team sheet who can answer either kind — vote on a label, or, point it at a number instead and average the panel's stats rather than counting their votes, and the exact same distance-and-shortlist machinery does regression instead.
