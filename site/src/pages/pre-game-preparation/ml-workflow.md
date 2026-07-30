---
layout: ../../layouts/MatchLayout.astro
title: "The ML Workflow: From Net Practice to Match Day"
innings: pre-game-preparation
chapter: ml-workflow
meta: "11 min · match plan"
lede: "No side walks out without a plan for the first ten overs. The ML workflow is that plan — a fixed order of operations that turns a hunch into something you would bet a match on."
commentary: "Rotate the strike between exploration and evaluation. Batters who only play one shot get found out by tea."
codeFile: workflow/plan.py
codeOut: "train 1600 · val 200 · test 200 (untouched)"
code: |
  from sklearn.model_selection import train_test_split

  # the match is played once — hold it back
  X_rest, X_test, y_rest, y_test = train_test_split(
      X, y, test_size=0.10, random_state=7, stratify=y
  )
  X_train, X_val, y_train, y_val = train_test_split(
      X_rest, y_rest, test_size=0.11, random_state=7
  )

  print(len(X_train), len(X_val), len(X_test))
stats:
  - { k: "Steps", v: "6", s: "frame to deploy" }
  - { k: "Test touches", v: "1", s: "at the very end" }
  - { k: "Seed", v: "7", s: "reproducible innings" }
  - { k: "Cadence", v: "2 wks", s: "one experiment cycle" }
---

## The six-step match plan

Frame the question, gather the data, prepare the features, train in the nets, evaluate honestly, then deploy. Skip a step and you are not being agile — you are walking out without pads.

The most sacred rule in the plan is the **test set**. It plays exactly once, at the very end, like the match itself. Every peek before that is a net session, and net sessions do not count on the scorecard.

## Split like you mean it

Train on the training split, tune on the validation split, and keep the seed fixed so the whole innings can be replayed ball for ball. A result you cannot reproduce is a run the scorer refuses to give you.
