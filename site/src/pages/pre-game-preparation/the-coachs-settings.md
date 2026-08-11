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

1. **Constraints the coach imposes on the drill** — decided once, before the first ball, and then held fixed for the entire session no matter what happens inside it.
2. **What the players' bodies and instincts work out for themselves** as they face ball after ball inside those constraints, adjusting in real time to whatever the last delivery taught them.

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

"Restraint" and "toolbox" are doing a lot of work above, so it's worth putting an exact number on what each of these dials actually controls:

* **Regularisation strength (`C`)** decides how hard the model is allowed to chase every single training point. A high `C` says *fit this data as closely as you possibly can, whatever it costs* — loose cones, and the bowler gets away with anything that lands somewhere near the money, memorising the specific deliveries it happened to see. A low `C` says *keep it simple*, penalising the model for bending its decision boundary too far just to accommodate one unusual case. Tight cones make a bowler earn every ball; a low `C` makes a model earn every twist in its own shape.
* **The penalty shape (`penalty="l2"`)** decides *how* that restraint gets applied. L2 — the default, and the one shown above — discourages every weight from growing too large, nudging all of them down a little rather than eliminating any single one outright: the whole squad gets told to tone it down, nobody gets dropped. Its sterner alternative, L1, can push a weight all the way to exactly zero, cutting that feature from the model entirely rather than just quieting it.
* **`n_estimators`** is the most literal of the bunch: it's simply how many trees get built for a Random Forest to vote with — the number of bowling lanes running at once, no more, no less.
* **`max_features`** decides how many of the available columns any single tree is even allowed to look at when choosing a split, forcing it to make do with a random subset rather than surveying every stat on the sheet — the underarm-only rule, written in code.

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
* **Bayesian Optimisation:** Learning from every previous attempt to decide which combination is worth trying next, rather than working through a checklist or a random sample blind to its own results so far.

Grid and random search both burn expensive trials on combinations a coach could have ruled out after the very first over — neither one remembers what the last attempt taught it before picking the next. **Bayesian Optimisation** is the sequential alternative: an intelligent strategy for hunting down the best setting of a function that's expensive to test and impossible to see the shape of in advance — exactly the situation with a hyperparameter combination, where every single trial costs a full model fit. After each attempt, it updates a probabilistic model — a running belief about where the good settings are likely to be — and uses that belief, not a blind guess or a fixed checklist, to choose where to test next.

Picture a bowler working out a new batter ball by ball, rather than bowling to a fixed plan:

1. **Ball one, a yorker.** Full and straight. Blocked out, no drama — the coach notes: *safe there.*
2. **Ball two, a bouncer.** Short and quick. The batter takes a risky hook and nearly gets caught — the coach notes: *dangerous there, but risky for us too.*
3. **The update.** The mental map just changed: short is high-reward but high-variance, and nobody's tested a length just back-of-a-length outside off yet — that gap is still a total unknown.
4. **Ball three, back-of-a-length outside off.** Not the safest repeat (another yorker) and not a gamble on the same risky area again (another bouncer) — it's the ball that trades off what's already known against what's still worth finding out.

That trade-off — lean on what's worked, but keep probing the areas you haven't tested — is what an **acquisition function** formalises. Applied to hyperparameters instead of overs, tools like `scikit-optimize`'s `BayesSearchCV` do exactly this: use every previous combination's score to decide which combination is worth the cost of actually training next, rather than working through a checklist blind to its own results so far.

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

Minimising error on the training data is exactly the right goal for a *parameter* — it's the one, well-defined job `model.fit()` is doing, and there's no other target worth aiming at. Point that same goal at a *hyperparameter*, though, and it stops being safe. Every dial in this chapter only has one direction to turn if "lowest training error" is all that's being scored: deeper trees, a higher `C`, the cones taken away entirely, every neighbour but the single nearest one ignored. More flexibility can only ever help a model fit the exact deliveries it's already seen — it can never hurt training error — so a search judged purely against the training set will keep cranking every dial toward maximum flexibility until the model has essentially memorised that one net session, ball for ball: flawless against the deliveries it trained on, and hopeless the moment an unfamiliar one arrives. Hyperparameters need a different scoreboard, one that rewards a setting for generalising rather than for memorising, which is exactly why they get judged against a held-out slice of data instead of the training set itself.

One rule to carry forward, and it matters enormously: **hyperparameters are tuned against a closed-doors trial match — never against the real scorecard from match day.** A coach who keeps adjusting the drill until it flatters the trial match has just built a team that's good at beating the trial match, not good at cricket.

That is a whole discipline of its own, and it gets its own chapter. See **Train/Validation/Test Splits** in model evaluation, where we divide the ground properly, and **Underfitting, Overfitting & Finding the Sweet Spot**, where we work out whether the settings you chose produced a batter who can actually perform.

---

## Ground Rules for the Dressing-Room Wall

- **Hyperparameters are set before training; parameters are learned during it.** Passed into the constructor versus carrying a trailing underscore after `.fit()` — that's the tell, every time.
- **The coach fixes the conditions, not the technique.** Machine speed, target cones, the imagined field, underarm-only throws — every one of these constrains the drill, and none of them touches a player's wrist position or backlift directly.
- **Parameters are the residue of the reps.** Weights (*w*), biases (*b*), tree splits — `model.coef_`, `model.intercept_` — nobody hands these numbers over; they're what the repetition leaves behind.
- **Max depth, regularisation strength, feature count, and neighbour count are all the same idea wearing different kit:** a rule fixed before the first ball that decides how much freedom the model has to fit what it sees.
- **Grid search, random search, and Bayesian optimisation are three systematic ways of trying different drills**, rather than guessing at a machine speed and hoping — only Bayesian optimisation updates its next guess based on what every previous one taught it.
- **Minimising training error is the right goal for a parameter and a trap for a hyperparameter.** More flexibility can only ever help fit the training data, never hurt it, so scoring a hyperparameter search against training error alone just cranks every dial toward memorising the net session rather than learning from it.
- **Tune against a closed-doors trial match, never against match day.** A coach who keeps adjusting the drill until it flatters the trial match has built a team that's good at beating the trial match, not good at cricket.

---

The dials are set, the drill's rules are fixed, and the players have started grooving whatever those rules let them groove. Next up: dividing the ground properly into nets, trial match, and match day — so a coach can actually tell a well-trained player from one who's just memorised this particular session.
