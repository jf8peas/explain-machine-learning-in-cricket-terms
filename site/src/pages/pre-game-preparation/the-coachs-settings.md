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

$$\text{Prediction } (\hat{y}) = w_1 x_1 + w_2 x_2 + b$$

The algorithm calculates and updates these weights automatically to minimize loss. You do not set parameters manually!

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

---

## 4. Hyperparameter Tuning: Finding the Winning XI Formula

How does a coach know which bowling machine speed or field placement produces the best results on match day? They experiment with different net configurations in a systematic way:

* **Grid Search:** Testing every combination of settings on a checklist (e.g., trying tree depths of `3, 5, 10` paired with learning rates of `0.01, 0.1`).
* **Random Search:** Randomly sampling settings across a range to quickly discover high-performing configurations without testing every single combination.
* **Bayesian Optimization:** Using past net session results to intelligently predict which hyperparameter combination will yield the highest performance in the next session.

---

## 5. Quick Reference Scorecard

| Feature | Model Parameters | Model Hyperparameters |
| :--- | :--- | :--- |
| **Who sets it?** | Learned automatically by the algorithm | Defined manually by the developer/coach |
| **When is it set?** | During training (`model.fit()`) | Before training begins |
| **Cricket Metaphor** | Player's wrist angle, seam position, muscle memory | Net drill constraints, machine speed dial, tree depth |
| **Examples** | Weights (*w*), Bias (*b*), Tree splits | Learning rate (*η*), *k* in kNN, Max Depth, L2 penalty (*λ*) |
| **Goal** | Minimize prediction error on training data | Prevent underfitting/overfitting and promote generalization |