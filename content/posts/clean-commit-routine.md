---
title: "My Clean Commit Routine"
date: 2026-03-18
draft: false
description: "How I keep commits small, reviewable, and easy to revert."
tags: ["git", "workflow", "writing"]
categories: ["Dev Workflow"]
---

Small commits make collaboration easier.

My default routine:

1. Make one logical change at a time
2. Run checks before staging
3. Stage only relevant files
4. Write a commit message that states intent
5. Push early and open a small PR

Example message format I use:

- `feat: add post card reading time`
- `fix: handle empty tag list on posts page`
- `docs: clarify local preview commands`

When a commit is easy to explain, it is usually easy to review.
