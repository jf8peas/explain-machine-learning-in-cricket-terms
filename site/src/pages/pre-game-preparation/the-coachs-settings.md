---
layout: ../../layouts/MatchLayout.astro
title: "Parameters & Hyperparameters"
subtitle: "The Coach's Settings"
innings: pre-game-preparation
chapter: the-coachs-settings
meta: "6 min · technical tuning"
lede: "Before a net session starts, the coach sets the rules of the drill — the machine speed, the target cones, the imagined field, the fielders restricted to underarm throws only. What the players' bodies and instincts work out from there is a different thing entirely. Understanding the difference between the constraints you impose on practice (hyperparameters) and what players internalise through repetition (parameters) is fundamental to training machine learning models."
commentary: "'I set the cones, the field in their heads, the rules of the drill. What their hands and feet work out from there is theirs.' — Head Coach"
codeFile: setup/hyperparameters.py
codeOut: "model weights (parameters) initialised · max_depth=5, lr=0.01 (hyperparameters) set"
code: |
  from sklearn.tree import DecisionTreeClassifier

  # 1. Hyperparameters: Set by the coach BEFORE training
  model = DecisionTreeClassifier(
      max_depth=5,           # Maximum tree depth
      min_samples_split=10,  # Minimum samples required to split a node
      random_state=42
  )

  # 2. Parameters: Learned by the model DURING training
  model.fit(X_train, y_train)
  # Internal weights and split criteria are calculated automatically
stats:
  - { k: "Rules of the Drill", v: "Hyperparameters", s: "set before training" }
  - { k: "Player Mechanics", v: "Parameters", s: "learned during training" }
  - { k: "Net Tuning", v: "Grid Search", s: "finding optimal settings" }
  - { k: "Goal", v: "Generalisation", s: "balanced performance" }
---

## The Rules of the Drill vs. What Sticks: Setting the Stage

When a squad turns up for a net session, there are two distinct things happening:

1. **Constraints the coach imposes on the drill** before a single ball is bowled — machine speed, target cones, an imagined field, fielders told to throw underarm only.
2. **What the players' bodies and instincts work out for themselves** as they face ball after ball inside those constraints.

In machine learning, this exact distinction separates **Hyperparameters** from **Parameters**.

```
┌────────────────────────────────────────────────────────────────────────┐
│              THE RULES OF THE DRILL (Hyperparameters)                  │
│   Coach sets constraints before a ball is bowled: cones, imagined      │
│   field, machine speed, underarm-only throws                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       WHAT STICKS (Parameters)                         │
│   Player's body learns weights (w) and biases (b) through the reps     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Parameters: Muscle Memory on the Deck

**Parameters** are the internal configuration variables that the model learns automatically from the training data during the fitting process (`model.fit()`).

* **Cricket Analogy:** Think of parameters as whatever a player's body works out for itself, purely from repetition, inside whatever drill the coach has set up. A fast bowler running in at a set of cones makes micro-adjustments to wrist position and seam angle after every ball that swings the wrong way. A batter facing throwdowns against an imagined field adjusts backlift and foot position after every one that gets them out. A fielder restricted to underarm throws grooves the release point that keeps the ball flat and on target. Nobody hands any of them the exact numbers — the coach set the drill, not the technique. The technique is what gets learned inside it.
* **ML Equivalent:** In linear regression or neural networks, parameters are the **weights (*w*)** and **biases (*b*)**. In decision trees, parameters are the specific split thresholds chosen at each node.

```
prediction  ŷ  =  w₁x₁  +  w₂x₂  +  b
                  └──────┬──────┘   └┬┘
                     learned      learned
```

The algorithm calculates and updates these weights automatically to minimise loss. You do not set parameters manually — and after fitting, you can go and look at what the player's body worked out for itself:

```python
model.coef_          # learned during .fit()
model.intercept_     # learned during .fit()
```

Nobody instructed those numbers. They are the residue of thousands of deliveries.

---

## Hyperparameters: The Net Drill Configuration

**Hyperparameters** are the external settings that *you* (the coach/data scientist) specify **before** model training begins. They control *how* the model learns, setting the boundaries and constraints within which parameters are adjusted.

* **Cricket Analogy:** Think of hyperparameters as the rules the coach lays down before a drill starts — nobody's technique yet, just the constraints it has to fit inside:
  * **Speed Dial:** How fast the bowling machine fires balls down (→ **Learning Rate** *η*). Too fast, and the batter overreacts and misses every cue; too slow, and nothing about the technique gets properly tested.
  * **The Imagined Field:** There's nobody actually standing out there when you face a machine, so before the first ball you set a field in your head — three slips, a gully, a man up at point — and picture exactly where each one is. A shallow mental field (just a slip and a fine leg) leaves you two or three simple reads each ball; a deep one, stacked with layered if-he's-fuller-I-go-here, if-he's-straighter-I-go-there reasoning, lets you plan much further ahead (→ **Max Tree Depth** *d*). Build it too deep, though, and you stop playing the ball that actually arrives — you're playing the field you imagined.
  * **Target Cones:** The coach lays cones on a length and line and the bowler is only allowed to bowl at them — miss by too much and it's not a rep worth counting (→ **Regularisation Strength** *C*). Tight cones keep the action honest and stop the bowler grooving one wild, spectacular ball that never repeats; loose cones let more through, good habits and bad ones alike.
  * **Underarm Only:** Fielders in this drill are restricted to one technique — underarm throws, no side-arm flicks, no bombs from the boundary. Narrowing the toolbox on purpose is exactly what limiting the inputs a model is allowed to split on does (→ **Max Features** in a Random Forest).
  * **Number of Bowling Lanes:** How many bowlers run in at once, each working their own patch of net (→ **Number of Estimators / Trees** *n* in Random Forest).
  * **Neighbour Count:** A rule a batter sets for their own throwdowns — base the next shot on the line of the last *k* balls, not just the one arriving (→ *k* **in** *k*-**Nearest Neighbours**).

```python
# The Coach sets hyperparameters BEFORE fit()
from sklearn.neighbors import KNeighborsClassifier

model = KNeighborsClassifier(
    n_neighbors=5,      # Hyperparameter: k value
    weights='distance', # Hyperparameter: weighting scheme
    algorithm='auto'    # Hyperparameter: search algorithm
)
```

The same idea shows up in every net session, just wearing different clothes: how hard the machine is allowed to spit the ball down, how much restraint is built into the cones, how long the group works before rotating. Every one of these is a decision made *before* the first ball of the drill — by the coach, not the player — and every one of them shapes what the player is able to learn from the reps that follow:

```python
model = LinearSVC(
    C=10,              # how hard to fit the training data
    penalty="l2",      # what kind of restraint to impose
    max_iter=1000,     # how long the session runs
)
```

The coach does not run in and bowl the ball, or middle the shot, or dive for the catch. The coach decides the conditions the player trains under. That is the whole job description of a hyperparameter.

---

## The Tell: Telling Them Apart in Two Seconds

The two words look alike, which is why people mix them up for longer than they should. The distinction in code is refreshingly mechanical:

**Anything you pass into the constructor is a hyperparameter. Anything with a trailing underscore after fitting is a learned parameter.**

```python
model = LinearSVC(C=10)    # C ............ hyperparameter (you set it)
model.fit(X_train, y_train)
model.coef_                # coef_ ........ parameter (the fit set it)
```

That trailing underscore is scikit-learn telling you, politely, *"I worked this one out myself, thank you."*

---

## Hyperparameter Tuning: Finding the Winning XI Formula

How does a coach know which combination of machine speed, cones, and imagined field actually produces a better player, rather than just a player who's gotten used to that one drill? They experiment with different net configurations in a systematic way:

* **Grid Search:** Testing every combination of settings on a checklist (e.g., trying tree depths of `3, 5, 10` paired with learning rates of `0.01, 0.1`).
* **Random Search:** Randomly sampling settings across a range to quickly discover high-performing configurations without testing every single combination.
* **Bayesian Optimisation:** Using past net session results to intelligently predict which hyperparameter combination will yield the highest performance in the next session.

In practice, the checklist approach looks like this:

```python
from sklearn.model_selection import GridSearchCV

grid = GridSearchCV(
    model,
    {"C": [0.01, 0.1, 1, 10, 100]},
    cv=5,
)
grid.fit(X_train, y_train)
print(grid.best_params_, grid.best_score_)
```

One rule to carry forward, and it matters enormously: **hyperparameters are tuned against a closed-doors trial match — never against the real scorecard from match day.** A coach who keeps adjusting the drill until it flatters the trial match has just built a team that's good at beating the trial match, not good at cricket.

That is a whole discipline of its own, and it gets its own chapter. See **Train/Validation/Test Splits** in Innings 3, where we divide the ground properly, and **Underfitting, Overfitting & Finding the Sweet Spot**, where we work out whether the settings you chose produced a batter who can actually perform.

---

## Ground Rules for the Dressing-Room Wall

- **Hyperparameters are set before training; parameters are learned during it.** Passed into the constructor versus carrying a trailing underscore after `.fit()` — that's the tell, every time.
- **The coach fixes the conditions, not the technique.** Machine speed, target cones, the imagined field, underarm-only throws — every one of these constrains the drill, and none of them touches a player's wrist position or backlift directly.
- **Parameters are the residue of the reps.** Weights (*w*), biases (*b*), tree splits — `model.coef_`, `model.intercept_` — nobody hands these numbers over; they're what the repetition leaves behind.
- **Max depth, regularisation strength, feature count, and neighbour count are all the same idea wearing different kit:** a rule fixed before the first ball that decides how much freedom the model has to fit what it sees.
- **Grid search, random search, and Bayesian optimisation are three systematic ways of trying different drills**, rather than guessing at a machine speed and hoping.
- **Tune against a closed-doors trial match, never against match day.** A coach who keeps adjusting the drill until it flatters the trial match has built a team that's good at beating the trial match, not good at cricket.

---

The dials are set, the drill's rules are fixed, and the players have started grooving whatever those rules let them groove. Next up: dividing the ground properly into nets, trial match, and match day — so a coach can actually tell a well-trained player from one who's just memorised this particular session.
