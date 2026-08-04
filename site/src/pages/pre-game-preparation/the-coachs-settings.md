---
layout: ../../layouts/MatchLayout.astro
title: "The Coach's Settings: Parameters & Hyperparameters"
innings: pre-game-preparation
chapter: the-coachs-settings
meta: "6 min · technical tuning"
lede: "Before a team takes the field, the head coach dials in the bowling machine settings, boundary ropes, and tactical constraints. Understanding the difference between external configuration (hyperparameters) and internal player adaptation (parameters) is fundamental to training machine learning models."
commentary: "'You set the pitch dimensions and net drills in the morning. The bowler's wrist position and seam control adapt during the spell.' — Head Coach"
codeFile: setup/hyperparameters.py
codeOut: "model weights (parameters) initialized · max_depth=5, lr=0.01 (hyperparameters) set"
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
  - { k: "Dressing Room Setup", v: "Hyperparameters", s: "set before training" }
  - { k: "Player Mechanics", v: "Parameters", s: "learned during training" }
  - { k: "Net Tuning", v: "Grid Search", s: "finding optimal settings" }
  - { k: "Goal", v: "Generalization", s: "balanced performance" }
---

## 1. The Dressing Room vs. The Pitch: Setting the Stage

When preparing a squad for a long series, there are two distinct types of adjustments taking place:

1. **Strategic decisions made in the dressing room** before players cross the boundary line.
2. **On-field physical adaptations made by the players** as they face actual bowling on the pitch.

In machine learning, this exact distinction separates **Hyperparameters** from **Parameters**.

```
┌────────────────────────────────────────────────────────────────────────┐
│               THE DRESSING ROOM (Hyperparameters)                      │
│   Coach sets rules before play: Tree Depth, Learning Rate, k-Neighbors │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     THE PITCH (Parameters)                             │
│   Model adjusts internal weights (w) and biases (b) during the fit     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Parameters: Muscle Memory on the Deck

**Parameters** are the internal configuration variables that the model learns automatically from the training data during the fitting process (`model.fit()`).

* **Cricket Analogy:** Think of parameters as a bowler's muscle memory. As a fast bowler runs in on a green pitch, their brain makes micro-adjustments to wrist position, release point, and seam angle based on how the ball is swinging. The coach doesn't manually move the bowler's fingers on every ball; the bowler's body learns the optimal angles through repetition.
* **ML Equivalent:** In linear regression or neural networks, parameters are the **weights (*w*)** and **biases (*b*)**. In decision trees, parameters are the specific split thresholds chosen at each node.

```
prediction  ŷ  =  w₁x₁  +  w₂x₂  +  b
                  └──────┬──────┘   └┬┘
                     learned      learned
```

The algorithm calculates and updates these weights automatically to minimize loss. You do not set parameters manually — and after fitting, you can go and look at what the bowler's body worked out for itself:

```python
model.coef_          # learned during .fit()
model.intercept_     # learned during .fit()
```

Nobody instructed those numbers. They are the residue of thousands of deliveries.

---

## 3. Hyperparameters: The Net Drill Configuration

**Hyperparameters** are the external settings that *you* (the coach/data scientist) specify **before** model training begins. They control *how* the model learns, setting the boundaries and constraints within which parameters are adjusted.

* **Cricket Analogy:** Think of hyperparameters as dialing in the controls on an automated bowling machine in the indoor nets:
  * **Speed Dial:** Sets how fast the balls arrive (→ **Learning Rate** *η*). Too fast, and the batter overreacts and misses; too slow, and they don't learn real match conditions.
  * **Slip Cordon Width:** Dictates how wide the fielding practice grid extends (→ **Max Tree Depth** *d*).
  * **Number of Bowling Lanes:** Dictates how many bowlers run in at once (→ **Number of Estimators / Trees** *n* in Random Forest).
  * **Neighbor Count:** Deciding how many previous deliveries to analyze before selecting a shot (→ *k* **in** *k*-**Nearest Neighbors**).

```python
# The Coach sets hyperparameters BEFORE fit()
from sklearn.neighbors import KNeighborsClassifier

model = KNeighborsClassifier(
    n_neighbors=5,      # Hyperparameter: k value
    weights='distance', # Hyperparameter: weighting scheme
    algorithm='auto'    # Hyperparameter: search algorithm
)
```

The same idea shows up on the field as **field restrictions**. Three slips and a gully, fielders inside the circle for the powerplay, spin from the Pavilion End — every one of these is a decision made *before* the ball is bowled, by a human, and every one of them shapes what the bowler is able to learn during the spell:

```python
model = LinearSVC(
    C=10,              # how hard to fit the training data
    penalty="l2",      # what kind of restraint to impose
    max_iter=1000,     # how long the session runs
)
```

The captain does not bowl the ball. The captain decides the conditions under which the ball is bowled. That is the whole job description of a hyperparameter.

---

## 4. The Tell: Telling Them Apart in Two Seconds

The two words look alike, which is why people mix them up for longer than they should. The distinction in code is refreshingly mechanical:

**Anything you pass into the constructor is a hyperparameter. Anything with a trailing underscore after fitting is a learned parameter.**

```python
model = LinearSVC(C=10)    # C ............ hyperparameter (you set it)
model.fit(X_train, y_train)
model.coef_                # coef_ ........ parameter (the fit set it)
```

That trailing underscore is scikit-learn telling you, politely, *"I worked this one out myself, thank you."*

---

## 5. Hyperparameter Tuning: Finding the Winning XI Formula

How does a coach know which bowling machine speed or field placement produces the best results on match day? They experiment with different net configurations in a systematic way:

* **Grid Search:** Testing every combination of settings on a checklist (e.g., trying tree depths of `3, 5, 10` paired with learning rates of `0.01, 0.1`).
* **Random Search:** Randomly sampling settings across a range to quickly discover high-performing configurations without testing every single combination.
* **Bayesian Optimization:** Using past net session results to intelligently predict which hyperparameter combination will yield the highest performance in the next session.

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

One rule to carry forward, and it matters enormously: **hyperparameters are tuned against a held-out validation set — never against your final test data.** A coach who keeps rerunning match day until the settings look good has stopped measuring anything.

That is a whole discipline of its own, and it gets its own chapter. See **The Practice Nets** in Innings 3, where we divide the ground properly, and **Form and Class**, where we work out whether the settings you chose produced a batter who can actually travel.

---

## 6. Quick Reference Scorecard

| Feature | Model Parameters | Model Hyperparameters |
| :--- | :--- | :--- |
| **Who sets it?** | Learned automatically by the algorithm | Defined manually by the developer/coach |
| **When is it set?** | During training (`model.fit()`) | Before training begins |
| **Where in code?** | Trailing underscore: `model.coef_` | Passed into the constructor: `LinearSVC(C=10)` |
| **Cricket Metaphor** | Player's wrist angle, seam position, muscle memory | Net drill constraints, machine speed dial, field restrictions |
| **Examples** | Weights (*w*), Bias (*b*), Tree splits | Learning rate (*η*), *k* in kNN, Max Depth, L2 penalty (*λ*) |
| **Goal** | Minimize prediction error on training data | Prevent underfitting/overfitting and promote generalization |
