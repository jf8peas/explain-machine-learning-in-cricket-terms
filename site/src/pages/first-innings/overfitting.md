---
layout: ../../layouts/MatchLayout.astro
title: "Overfitting: Playing Too Many Shots"
innings: first-innings
chapter: overfitting
meta: "11 min · playing too many shots"
lede: "A model that memorises the training set is a batter who has learned one bowler's every delivery and nothing about batting. It looks magnificent in the nets and lasts four balls in the middle."
commentary: "Anyone can score in the nets. Show me the away fixture."
codeFile: first_innings/overfit.py
codeOut: "train 0.99 → cv 0.71 (±0.04) · overfit confirmed"
code: |
  from sklearn.tree import DecisionTreeClassifier
  from sklearn.model_selection import cross_val_score

  deep = DecisionTreeClassifier()                 # every shot, no discipline
  deep.fit(X_train, y_train)
  print("train", round(deep.score(X_train, y_train), 2))

  cv = cross_val_score(deep, X_train, y_train, cv=5)
  print("cv   ", round(cv.mean(), 2), "+/-", round(cv.std(), 2))

  tidy = DecisionTreeClassifier(max_depth=4, min_samples_leaf=25)
stats:
  - { k: "Train", v: "0.99", s: "nets score" }
  - { k: "CV mean", v: "0.71", s: "five pitches" }
  - { k: "Gap", v: "0.28", s: "the diagnosis" }
  - { k: "Max depth", v: "4", s: "after regularising" }
---

## The nets specialist

An unrestricted decision tree will memorise every training example perfectly — 0.99 in the nets. Send it to five different pitches with **cross-validation** and it scrapes 0.71. That gap between nets form and match form *is* overfitting, and the gap is the diagnosis, not the average.

## Discipline is a feature

The fix is restraint: limit the depth, demand more evidence per leaf, prune the shots that only work against the bowling machine. A slightly worse training score that travels to new pitches beats a perfect one that only performs at home. Select for the away tour, not the testimonial match.
