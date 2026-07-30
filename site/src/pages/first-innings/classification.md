---
layout: ../../layouts/MatchLayout.astro
title: "Classification: Out or Not Out"
innings: first-innings
chapter: classification
meta: "10 min · out or not out"
lede: "Regression asks how many. Classification asks which one — and cricket is full of which-one questions with exactly two answers and a very loud crowd."
commentary: "Set the threshold before you see the replay. Otherwise you are just moving the stumps."
codeFile: first_innings/classify.py
codeOut: "precision 0.88 · recall 0.74 · threshold 0.60"
code: |
  from sklearn.linear_model import LogisticRegression
  from sklearn.metrics import classification_report

  clf = LogisticRegression(max_iter=1000, class_weight="balanced")
  clf.fit(X_train, y_train)

  proba = clf.predict_proba(X_val)[:, 1]
  appeal_upheld = proba > 0.60          # your threshold, your call

  print(classification_report(y_val, appeal_upheld, digits=2))
stats:
  - { k: "Classes", v: "2", s: "out / not out" }
  - { k: "Precision", v: "0.88", s: "appeals that were right" }
  - { k: "Recall", v: "0.74", s: "real dismissals caught" }
  - { k: "Threshold", v: "0.60", s: "chosen, not learned" }
---

## Which one, not how many

Classification assigns a **label**. Out or not out. Win, lose or draw. The model outputs a probability, and you — the umpire — decide where the finger goes up. That decision point is the threshold, and it is a policy choice, not something the model learns.

## Precision versus recall, the eternal appeal

High **precision** means when you give it out, you are usually right. High **recall** means you catch most of the genuine dismissals. Push one up and the other slides — exactly like a fielding side choosing between attacking catchers and saving runs on the rope.

Choose the threshold for the cost of the mistake. In some systems a false alarm is annoying; in others a missed positive is catastrophic. Set it before you look at the results, or you are fitting the rules to the match you just watched.
