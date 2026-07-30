---
layout: ../../layouts/MatchLayout.astro
title: "The 'DRS' Agent: Referring the Decision"
innings: post-game
chapter: drs-agent
meta: "11 min · referring the decision"
lede: "DRS exists because confident officials are sometimes wrong. A review agent is the same institution in software: a second model whose only job is to check the first one's work against the evidence."
commentary: "Umpire's call is not indecision. It is a system that knows the limits of its own cameras."
codeFile: post_game/drs_agent.py
codeOut: "verdict: umpire's call · escalated to human"
code: |
  VERDICTS = ("upheld", "overturned", "umpires_call")

  def review(question, answer, evidence):
      verdict = reviewer.judge(
          question=question,
          answer=answer,
          evidence=evidence,        # the footage, not the opinion
          allowed=VERDICTS,
      )
      if verdict == "overturned":
          return primary.retry(question, hint=reviewer.reason)
      if verdict == "umpires_call":
          return escalate_to_human(question, answer, evidence)
      return answer
stats:
  - { k: "Verdicts", v: "3", s: "incl. umpire's call" }
  - { k: "Overturned", v: "7%", s: "of primary answers" }
  - { k: "Escalated", v: "2%", s: "to a human" }
  - { k: "Latency", v: "+1.4s", s: "cost of the review" }
---

## The reviewer judges evidence, not vibes

The review agent never sees the primary model's confidence or chain of thought — only the question, the answer, and the retrieved evidence. Like the third umpire, it rules on the footage, not the appeal. Confining the verdicts to a fixed list keeps the review inside the laws of the game.

## Umpire's call is a designed outcome

The most important verdict is the honest shrug. When the evidence cannot settle it, the system **escalates to a human** rather than guessing with extra steps. A review layer that is not allowed to say "insufficient evidence" will eventually invent some, and that is how confident nonsense gets into production.
