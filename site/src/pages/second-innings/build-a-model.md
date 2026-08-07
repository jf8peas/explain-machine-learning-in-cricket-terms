---
layout: ../../layouts/MatchLayout.astro
title: "Build a Model"
subtitle: "Picking the Batting Order"
innings: second-innings
chapter: build-a-model
meta: "14 min · picking the order"
lede: "Building a neural network is picking a batting order. Layers are the lineup: openers take the raw new ball, the middle order builds structure, and the finisher converts everything into one clean number the scoreboard can use."
commentary: "A finisher with a sigmoid on the end. Everything before it is just building a platform."
codeFile: second_innings/model.py
codeOut: "val_accuracy 0.891 · params 4,417"
code: |
  import tensorflow as tf
  from tensorflow.keras import layers

  model = tf.keras.Sequential([
      layers.Input(shape=(8,)),
      layers.Dense(64, activation="relu"),     # openers
      layers.Dropout(0.2),                      # rotate the strike
      layers.Dense(32, activation="relu"),     # middle order
      layers.Dense(1,  activation="sigmoid"),  # the finisher
  ])

  model.compile(optimizer="adam", loss="binary_crossentropy",
                metrics=["accuracy"])
stats:
  - { k: "Layers", v: "4", s: "the batting order" }
  - { k: "Params", v: "4.4k", s: "trainable weights" }
  - { k: "Dropout", v: "0.2", s: "strike rotation" }
  - { k: "Val acc", v: "0.891", s: "held-out matches" }
---

## Openers, middle order, finisher

The first dense layer faces the raw input — eight features, new ball, nothing tamed yet. The middle order narrows sixty-four signals down to thirty-two, building the platform. The final layer is the finisher: one unit, sigmoid activation, a single probability between nought and one that the scoreboard can actually use.

## Dropout is strike rotation

**Dropout** randomly benches a fifth of the players each training step, so no single unit becomes the star the whole innings depends on. It looks wasteful in the nets and is worth several wickets on match day — another quiet regulariser in the tradition of **Gradient Descent**'s penalty term, just applied by benching units instead of shrinking weights.
