---
title: "Quick Debugging Checklist for Everyday Bugs"
date: 2026-03-18
draft: false
description: "A repeatable checklist to debug faster without guessing."
tags: ["debugging", "workflow", "productivity"]
categories: ["Engineering"]
---

When something breaks, I use this order before trying random fixes.

1. Reproduce the issue consistently
2. Read the exact error message
3. Check recent changes (`git diff` and latest commits)
4. Verify environment/config values
5. Add temporary logs around assumptions
6. Reduce the failing case to the smallest input
7. Fix one root cause and retest

This process avoids panic and saves time.

A useful rule: if I cannot explain the failure in one sentence, I have not understood it yet.
