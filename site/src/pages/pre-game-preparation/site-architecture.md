---
layout: ../../layouts/MatchLayout.astro
title: "Site Architecture: Reading the Ground"
innings: pre-game-preparation
chapter: site-architecture
meta: "9 min · ground plan"
lede: "Before a single ball is bowled, you walk the ground. A learning system is the same — know where the pitch is, where the boundary sits, and which end the data comes from."
commentary: "If you cannot draw your system on the back of a scorecard, it is too complicated to debug at 2am."
codeFile: project/layout.py
codeOut: "4 zones registered · feature store: pitch/"
code: |
  from pathlib import Path

  ZONES = {
      "outfield": "data/raw",       # ingestion
      "pitch":    "data/features",  # prepared
      "nets":     "experiments",    # training
      "middle":   "serving",        # production
  }

  for name, path in ZONES.items():
      Path(path).mkdir(parents=True, exist_ok=True)
      print(f"{name:9} -> {path}")
stats:
  - { k: "Zones", v: "4", s: "outfield to middle" }
  - { k: "Boundary", v: "1", s: "raw never reaches serving" }
  - { k: "Owners", v: "2", s: "data + platform" }
  - { k: "Review", v: "Weekly", s: "architecture net session" }
---

## Walk the outfield first

Every ground has its own dimensions, and every ML system has its own constraints. Before you model anything, map the four zones: **raw data** (the outfield, where everything lands), **features** (the pitch, prepared and measured), **experiments** (the nets, where mistakes are free), and **serving** (the middle, where it counts).

The rule that keeps you honest: there is exactly one boundary that matters. Raw data never crosses directly into serving. Everything that reaches the middle has been through preparation, and you can trace its journey back.

## Name your ends

In cricket the ends have names so both teams describe the same ground. Give your zones owners for the same reason — data owns the outfield and the pitch, platform owns the nets and the middle. When something breaks at 2am, you know whose end the ball is coming from.
