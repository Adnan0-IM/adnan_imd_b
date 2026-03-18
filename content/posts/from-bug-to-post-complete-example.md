---
title: "From Bug to Blog Post: A Complete Example"
date: 2026-03-18
draft: false
description: "How to turn one production bug into a practical post readers can reuse."
tags: ["writing", "debugging", "workflow"]
categories: ["Writing"]
---

Many good engineering posts start from a real bug.

Instead of writing abstract advice, I prefer documenting one concrete incident from start to finish. This approach gives readers context, tradeoffs, and a fix they can apply.

## 1) Context

The issue: a page occasionally rendered stale data after a deploy. It happened only in a specific sequence: user logs in, opens one tab, then refreshes another tab after a backend release.

The first mistake was assuming this was a backend consistency issue. Logs showed the API returning correct data, which shifted the investigation to client-side caching behavior.

## 2) Investigation

I collected three traces:

1. Network timeline in browser devtools
2. Server response headers
3. Client cache key generation

The useful signal was this: two requests with different user states were sharing the same cache key. That key ignored a field that changed after login.

## 3) Root Cause

The cache key builder did not include `sessionVersion`, so data fetched before login could still satisfy requests after login.

The bug was subtle because it only appeared when timing and tab order aligned.

## 4) Fix

I made three changes:

1. Included `sessionVersion` in cache key derivation
2. Added a cache invalidation call on auth state transitions
3. Wrote an integration test for the login + multi-tab scenario

## 5) Postmortem Notes

What mattered most was improving detection, not only fixing behavior.

I added structured logs for cache key composition and a dashboard panel for stale-response incidents. Future regressions should now be obvious in minutes, not days.

## 6) Reusable Writing Template

If you want to convert your own bug into a post, use this order:

1. Symptom and user impact
2. Evidence collected
3. Root cause
4. Patch details
5. Safeguards and tests

This keeps the post practical and avoids storytelling fluff.
