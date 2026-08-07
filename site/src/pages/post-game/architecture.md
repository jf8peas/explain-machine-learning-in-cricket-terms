---
layout: ../../layouts/MatchLayout.astro
title: "Agent Architecture"
subtitle: "The Dressing Room"
innings: post-game
chapter: architecture
meta: "12 min · the dressing room"
lede: "A single model is one player. Agent architecture is the dressing room around them — a captain who decides, specialists who execute, and an analyst who remembers what happened in the last six matches."
commentary: "The captain does not bowl every over. That is the entire idea."
codeFile: post_game/dressing_room.py
codeOut: "turn 3/8 · handoff → stats_specialist"
code: |
  ROSTER = {
      "captain":  "routes the question, never answers it",
      "stats":    "queries the match database",
      "video":    "retrieves and describes footage",
      "analyst":  "long-term memory across sessions",
  }

  def play(question, max_overs=8):
      for over in range(max_overs):
          role, task = captain.decide(question, memory)
          result = ROSTER_AGENTS[role].run(task)
          memory.append((role, result))
          if captain.is_settled(memory):
              return captain.summarise(memory)
stats:
  - { k: "Agents", v: "4", s: "captain + 3 specialists" }
  - { k: "Max overs", v: "8", s: "hard step cap" }
  - { k: "Handoffs", v: "3", s: "this session" }
  - { k: "Logged", v: "100%", s: "every decision" }
---

## Nobody fields at every position

A multi-agent system splits one impossible job into four plausible ones. The **captain** routes each question to a specialist, the specialists execute with their own tools and prompts, and the **analyst** keeps memory across sessions so the side stops relitigating last week's collapse.

## The step cap is the match rules

The `max_overs` cap matters more than any prompt. Uncapped agent loops are endless rain delays — expensive and going nowhere. Eight overs, every handoff logged, and the captain must declare when the answer is settled. Structure is what turns a chat model into a team.
