---
layout: ../../layouts/MatchLayout.astro
title: "Tensors"
subtitle: "The Scorecard as a Shape"
innings: second-innings
chapter: tensors
meta: "9 min · the scorecard as a shape"
lede: "A tensor is a scorecard with more dimensions. One ball is a scalar, an over is a vector, an innings is a matrix, and a whole tournament is the rank-3 array everyone keeps getting the axes wrong on."
commentary: "Nobody misreads a scorecard on purpose. They just forget which column is which."
codeFile: second_innings/tensors.py
codeOut: "shape (32, 6, 8) · rank 3 · dtype float32"
code: |
  import tensorflow as tf

  ball    = tf.constant(4.0)                      # scalar  · rank 0
  over    = tf.constant([1, 0, 4, 6, 0, 2])       # vector  · rank 1
  innings = tf.random.normal((6, 8))              # matrix  · rank 2
  season  = tf.random.normal((32, 6, 8))          # batch   · rank 3

  print(season.shape, tf.rank(season).numpy(), season.dtype)
stats:
  - { k: "Rank", v: "3", s: "matches × overs × feats" }
  - { k: "Batch axis", v: "0", s: "never move it" }
  - { k: "dtype", v: "f32", s: "default precision" }
  - { k: "Elements", v: "1536", s: "32 × 6 × 8" }
---

## Rank is just how many columns deep the scorecard goes

Every algorithm in First Innings — trees, forests, regressions — worked directly on a table of named columns. Second Innings leaves that table behind, and before any of the chapters that follow make sense, the numbers themselves need a new shape.

Every example in the card above climbs the same ladder, one column at a time — and a **tensor** is just the name that ladder gets once you stop giving each rung its own separate word. A scorer doesn't reach for new vocabulary going from a single delivery to a whole season; they just keep more columns on the same page. Neural networks work the same way: no special machinery kicks in at rank 3 that wasn't already there at rank 1, just more axes to keep straight.

## Axis zero is sacred

The first axis is the batch — which match you are looking at. Shuffle it, slice it, never reorder the *meaning* of it. Nearly every mysterious shape error in TensorFlow is someone forgetting which column was which, and the fix is always to write the shape down before you write the code.
