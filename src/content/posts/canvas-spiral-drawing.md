---
title: Create a Spiral Drawing with JavaScript and canvasSketch
description: 'Learn how to code a spiral drawing using the canvasSketch library in JavaScript. This tutorial provides a step-by-step guide with explanations.'
publishedDate: 2024-05-23
featured: true
draft: false
postimage:
    src: '../../assets/canvas-spiral-drawing/canvas-spiral-drawing.jpg'
    alt: 'My Image'
tags: ["code", "javascript", "learning", "canvas"]
---

The canvasSketch library in JavaScript allows you to create interactive visuals within your web browser. This guide demonstrates how to code a spiral drawing using canvasSketch. We'll cover setting up the environment and implementing the spiral effect.

## CanvasSketch
We will be using CanvasSketch to organise our code. It is a collection of tools, modules and resources for creating generative art in JavaScript and the browser.  

[canvas-sketch](https://github.com/mattdesl/canvas-sketch "canvas-sketch")

```js
const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
    dimensions: [1080, 1080],
};

const sketch = () => {
    return ({ context, width, height }) => {
        // Fill the background with white
        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);

        // Set fill style to black for the following shapes
        context.fillStyle = "black";
/**
 * rest of the code ....
 */
```

## Setting up
Import the necessary libraries
- canvas-sketch
- canvas-sketch-util/math
- canvas-sketch-util/random

## Finding the canvas center
Calculate the center coordinates (x and y) by dividing the width and height by 2 and storing them in variables like cx and cy.

## Shaping the rectangle
Define the width (w) and height (h) of the rectangles as a percentage of the canvas size.

## Creating the spiral
Use a loop to iterate through a set number of rectangles (num).  
Inside the loop:
- Calculate the angle (angle) for each rectangle's placement using `math.degToRad(360 / num)`.
- Find the x and y coordinates (x and y) of the rectangle's center using the angle, radius, sine, and cosine functions.
- Use `context.save()` to store the current drawing state.
- Translate the origin to the center of the rectangle using `context.translate(x, y)`.
- Rotate the context by the negative of the calculated angle using `context.rotate(-angle)`.
- Scale the rectangle horizontally with a random value between 1 and 3 using `context.scale(random.range(1, 3), 1)`.
- Define the rectangle's shape using `context.rect` and offset it slightly from the center.
- Fill the rectangle with black using `context.fill()`.
- Restore the previously saved drawing state using `context.restore()`.

**Check out this other post where I explain save and restore** :  [Understanding save and restore](/post/understanding-save-store)

```js
// Calculate the center coordinates of the canvas
const cx = width * 0.5;
const cy = height * 0.5;

// Calculate the width and height of the rectangle to be drawn
const w = width * 0.01;
const h = height * 0.1;

let x, y;

const num = 12;
const radius = width * 0.3;

// Loop to draw multiple rectangles in a spiral pattern
for (let i = 0; i < num; i++) {
    // Calculate the angle for each rectangle placement
    const slice = math.degToRad(360 / num);
    const angle = slice * i;

    // Calculate the x and y coordinates for the rectangle's center
    x = cx + radius * Math.sin(angle);
    y = cy + radius * Math.cos(angle);

    // Save the current drawing state (transformations applied here won't affect future elements)
    context.save();

    // Move the origin (0, 0) to the center of the current rectangle
    context.translate(x, y);

    // Rotate the context by the negative of the calculated angle for a spiral effect
    context.rotate(-angle);
    // Randomly scale the rectangle horizontally between 1 and 3 times its original size
    context.scale(random.range(1, 3), 1);

    // Define a rectangle with a slight offset from the center based on its width and height
    context.beginPath();
    context.rect(w * 0.5, h * 0.5, w, h);

    // Fill the rotated rectangle with black
    context.fill();

    // Restore the previously saved drawing state (important to avoid affecting subsequent rectangles)
    context.restore();
}
```

## Key concepts
### Radians and Degres
While angles can be measured in degrees (e.g., 45 degrees), trigonometry functions typically work with radians. Radians are a unit of angular measurement based on the ratio of the arc length to the circle's radius. There are 2π radians in a full circle (360 degrees). The `math.degToRad()` function in canvasSketch helps us convert degrees to radians for compatibility with the trigonometric functions.

### Calculating the angle
Inside the loop, we calculate the angle (`angle`) for each rectangle's placement. The formula is `angle = math.degToRad(360 / num) * i`, where `i` represents the current iteration number (0 to num-1). This essentially divides the full circle (360 degrees) into `num` equal angles in radians.

### Leveraging Sine and Cosine
Now comes the magic! We use the calculated angle (`angle`) with the sine (`sin(angle)`) and cosine (`cos(angle)`) functions to determine the x and y coordinates of the rectangle's center. These coordinates are relative to the center of the canvas (which we might have stored in variables like `cx` and `cy`).
- **X-Coordinate**: We calculate the x-coordinate by multiplying the radius with the cosine of the angle (`radius * cos(angle)`). As the angle increases, the cosine value oscillates between 1 (positive x-axis) and -1 (negative x-axis), creating the horizontal movement of the rectangles in the spiral.
- **Y-Coordinat**e**: Similarly, the y-coordinate is calculated by multiplying the radius with the sine of the angle (`radius * sin(angle)`). The sine value oscillates between 1 (positive y-axis) and -1 (negative y-axis), resulting in the vertical movement of the rectangles, forming the spiral pattern.

