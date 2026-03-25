module.exports = async (tp) => {
  const title = await tp.system.prompt("Post title");
  if (!title) return;

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const folder = `posts/${slug}`;
  const path = `${folder}/index.md`;

  // Create folder if needed.
  try {
    await app.vault.createFolder(folder);
  } catch (e) {
    // Folder may already exist.
  }

  // Abort if post already exists.
  if (app.vault.getAbstractFileByPath(path)) {
    new Notice(`Already exists: ${path}`);
    return;
  }

  const safeTitle = title.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const content = `---
title: "${safeTitle}"
date: ${tp.date.now("YYYY-MM-DDTHH:mm:ss")}
draft: true
description: ""
image: ""
tags: []
categories: []
---

Write a strong opening paragraph (this becomes the Summary).

<!--more-->

## Outline
-

## Draft
###

## Notes / Sources
-
`;

  const file = await app.vault.create(path, content);
  const leaf = app.workspace.activeLeaf ?? app.workspace.getLeaf(true);
  await leaf.openFile(file);
  new Notice(`Created ${path}`);

  // FIXED CLEANUP SECTION
  // Wait for UI to settle (critical!)
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Get the file this template was executed in
  const prevFile = tp.file?.path
    ? app.vault.getAbstractFileByPath(tp.file.path)
    : app.workspace.getActiveFile(); // Fallback

  if (prevFile && /^Untitled( \d+)?\.md$/.test(prevFile.name)) {
    // Use Obsidian's native method to close all leaves with this file
    app.workspace.detachLeavesOfFile(prevFile);
    // Another small delay to ensure the file is fully released
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Now delete
    try {
      await app.vault.delete(prevFile);
      new Notice(`Cleaned up ${prevFile.name}`);
    } catch (e) {
      console.error("Failed to delete untitled note:", e);
      new Notice("Failed to delete untitled note (check console)");
    }
  }
};
