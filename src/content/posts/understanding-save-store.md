---
title: Understanding context.save() and context.restore()
description: 'How context.save() and context.restore() work in canvasSketch, and how to use them to keep styles and transformations from leaking between shapes.'
publishedDate: 2024-05-23
featured: true
draft: false
postimage:
    src: '../../assets/understanding-save-store/understanding-save-store.jpg'
    alt: ''
postSeoImage: '../../assets/understanding-save-store/understanding-save-store.jpg'
tags: ["code", "javascript", "learning", "canvas"]
---
Once a canvasSketch drawing has more than a few shapes, styles and transformations start leaking from one shape to the next. You rotate a circle and the square after it is rotated too. `context.save()` and `context.restore()` are how you keep that under control.

This post explains what the two methods do and walks through a short example.

## What the drawing state is
The context object holds every setting that affects how the next shape is drawn:

- Fill style (color used to fill shapes)
- Stroke style (color and width of lines)
- Line width
- Transformations (scaling, rotation, translation)
- Clipping region (area where drawing is allowed)

## Why it matters
In a scene with many elements, you usually want each one to have its own colours and transformations without touching the others. Changing the context directly makes that hard, because every change stays in place until you undo it by hand.

## How the two methods work

- `context.save()`: This method creates a snapshot of the current drawing state (all the settings mentioned above) and pushes it onto a stack. This allows you to return to the state before any subsequent modifications.

- Drawing with Modifications: After calling `context.save()`, you can freely modify drawing styles and apply transformations. These changes only affect the current drawing operation.

- `context.restore()`: This method pops the most recent drawing state from the stack and restores the context to that state. In other words, it undoes every change made since the last `context.save()`.

## What you get out of it

- Modular Drawing: Break down complex drawings into smaller, independent elements. Each element can have its own set of styles and transformations without affecting the rest.
- Error Correction: Accidentally applied the wrong transformation? Use `context.restore()` to revert to a known good state.
- Cleaner Code: Isolate drawing logic with `context.save()` and `context.restore()` to make your code more organized and easier to maintain.

## Example: Drawing a Square and a Rotated Circle
Here a blue square and a rotated red circle are drawn independently:

```js
context.save(); // Save the initial state

// Draw the square
context.fillStyle = "blue";
context.fillRect(width / 2, height / 2, 50, 50);

context.restore(); // Restore to the state before drawing the square

// Draw the red circle with rotation
context.save(); // Save the state after restoring the previous one
context.fillStyle = "red";
context.translate(width / 2, height / 2); // Move origin to center
context.rotate(Math.PI / 4); // Rotate 45 degrees
context.beginPath();
context.arc(0, 0, 25, 0, 2 * Math.PI); // Draw the circle
context.fill();

context.restore(); // Restore to the state before drawing the circle
```
In this example, `context.save()` and `context.restore()` ensure that the rotation applied for the circle doesn't affect the square or any subsequent drawings.

## Conclusion
Wrap each element in a `save()` / `restore()` pair and it can't affect anything drawn after it. That one habit makes complex sketches much easier to change later.
