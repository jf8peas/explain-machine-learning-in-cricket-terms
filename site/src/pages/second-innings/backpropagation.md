---
layout: ../../layouts/MatchLayout.astro
title: "Backpropagation"
subtitle: "The Third Umpire's Review"
innings: second-innings
chapter: backpropagation
meta: "13 min · the third umpire"
lede: "The network makes a call. The loss function says how wrong it was. Backpropagation is the review process that walks the decision back through every official who touched it and tells each one exactly how much to adjust."
commentary: "One review does not fix an umpire. Ten thousand small ones make a very good one."
codeFile: second_innings/backprop.py
codeOut: "epoch 10 · loss 0.312 → 0.087"
code: |
  import tensorflow as tf

  opt = tf.keras.optimizers.Adam(learning_rate=1e-3)
  loss_fn = tf.keras.losses.BinaryCrossentropy()

  for epoch in range(10):
      with tf.GradientTape() as tape:          # record the decision
          pred = model(X_train, training=True)
          loss = loss_fn(y_train, pred)
      grads = tape.gradient(loss, model.trainable_weights)   # the review
      opt.apply_gradients(zip(grads, model.trainable_weights))
      print(epoch, float(loss))
stats:
  - { k: "Epochs", v: "10", s: "review cycles" }
  - { k: "LR", v: "1e-3", s: "trust in the review" }
  - { k: "Loss", v: "0.087", s: "down from 0.312" }
  - { k: "Optimiser", v: "Adam", s: "adaptive steps" }
---

## Every decision gets reviewed, ball by ball

**Tensors** gave the numbers flowing through a network their shape. This chapter is about what actually happens to them on the way through — and, more importantly, on the way back. No single review fixes an umpire. It's the accumulation — thousands of small corrections, each one too small to overcorrect on its own — that eventually produces someone whose calls you stop double-checking. Training a network is that same accumulation, run at a scale no human panel could manage: the exact same review cycle below, repeated once per prediction, thousands of times over, until the pattern of tiny corrections adds up to something that looks like judgement.

The forward pass is the on-field call. The **loss** is how badly it missed. Backpropagation then replays the decision backwards through every layer, assigning each weight its precise share of the blame — its **gradient** — and the optimiser applies a small correction.

## Small corrections, endlessly repeated

The **learning rate** is how much the umpire trusts each review. Too high and every call gets overcorrected into a new mistake; too low and the season ends before anything improves. Training is not one dramatic review — it is ten thousand quiet ones that add up to competence.
