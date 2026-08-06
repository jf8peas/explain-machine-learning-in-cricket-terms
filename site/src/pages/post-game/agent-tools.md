---
layout: ../../layouts/MatchLayout.astro
title: "Agent Tools"
subtitle: "Twelfth Man Duties"
innings: post-game
chapter: agent-tools
meta: "10 min · twelfth man duties"
lede: "Tools are the twelfth man: not in the XI, but the reason the XI can keep going. A retrieval call, a SQL query, a calculator — each one does the errand the model should never attempt from memory."
commentary: "Do not ask the batter to fetch their own drinks mid-over. That is what the tool call is for."
codeFile: post_game/tools.py
codeOut: "match_stats(...) → 12 rows in 240ms"
code: |
  TOOLS = [
      {
          "name": "match_stats",
          "description": "Return per-over runs and wickets for one match id.",
          "input_schema": {
              "type": "object",
              "properties": {"match_id": {"type": "string"}},
              "required": ["match_id"],
          },
      },
  ]

  def match_stats(match_id, timeout=5, limit=50):
      return db.readonly.query(OVER_SQL, match_id, timeout=timeout)[:limit]
stats:
  - { k: "Tools", v: "3", s: "stats, video, calc" }
  - { k: "Timeout", v: "5s", s: "per call" }
  - { k: "Row cap", v: "50", s: "hard limit" }
  - { k: "Access", v: "Read", s: "no writes, ever" }
---

## The schema is the job description

A tool definition is three things: a name the model can call, a **description** written like instructions to a debutant, and a schema that makes bad calls unrepresentable. If the model keeps misusing a tool, the description is vague — fix the words before you fix the model.

## Hard limits are the boundary rope

Every tool runs with a timeout, a row cap, and **read-only** access. Models are enthusiastic and occasionally wrong in expensive ways; the rope keeps the enthusiasm from reaching the carpark. The model decides *when* to fetch the drinks. The tool decides what fetching is allowed to mean.
