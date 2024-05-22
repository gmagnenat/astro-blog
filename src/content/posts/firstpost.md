---
title: Creative Coding - Context 1st step
description: 'Using JavaScript and context to draw shapes'
publishedDate: 2022-07-08
featured: true
draft: false
postimage:
    src: '../../assets/firstpost/firstpostimage.jpg'
    alt: 'My Image'
---

## Fundamentals - draw a square
First I will create a new html file with basic markup.
I added a `canvas` and a script tag where I will add my code.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Context Basics</title>
</head>
<body>
  <canvas id="canvas" width="600" height="600"></canvas>
  <script></script>
</body>
</html>
```

Let's start by creating a square in our script

```js
// Get a reference to the canvas element on the HTML page
let canvas = document.getElementById('canvas');

// Get a 2D rendering context from the canvas element
// This context will be used for all drawing operations on the canvas
let context = canvas.getContext('2d');

// Set the width of lines drawn on the canvas (in pixels)
context.lineWidth = 4;

// Begin a new path for drawing shapes.
// Subsequent drawing methods (like rect) will add to this path.
context.beginPath();

// Define a rectangle on the canvas with given dimensions
// (x-coordinate, y-coordinate, width, height)
context.rect(100, 100, 400, 400);

// Stroke the previously defined path (draw the outline of the rectangle)
context.stroke();
```

If everything went smoothly you should get a beautiful square on the screen  

![A square](../../assets/firstpost/contextSquare.jpg)

## Fundamentals - draw a circle

Let's add a circle inside the square.  
The 2D Canvas API has a method ___CanvasRederingContext2D.arc()___ that allow us to draw arcs.  

### Parameters
- x
- y
- radius
- startAngle
- endAngle
- anticlockwise  

With a bit of code it looks like this

```js
// begin a new path to create shapes
context.beginPath();
// draw a circle in the middle of our canvas
// x: 300, y: 300, radius: 100, startAngle: 0, endAngle: PI*2
context.arc(300, 300, 100, 0, Math.PI * 2);
//draw the outline of previously defined path (draw the outline of the circle)
context.stroke();
```

And if everything went correctly you will have a circle inside the square
![A square and a circle](../../assets/firstpost/contextCircle.jpg)

## fundamentals - for loop
A for loop will allow us to iterate and draw multiple shape in our canvas.
Let's try to do something with the shape we already know.

```javascript
// Define the dimensions of each square
const width = 60;
const height = 60;

// Define the spacing between squares
const gap = 20;

// Variables to store the positions of each square (updated within the loop)
let x, y;

// Loop to draw a 5x5 grid of squares
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    // Calculate the x and y coordinates for the current square
    x = 100 + (width + gap) * i;
    y = 100 + (height + gap) * j;

    // Begin a new path for drawing the square
    context.beginPath();

    // Define the rectangle for the square at the calculated position
    context.rect(x, y, width, height);

    // Draw the outline of the square
    context.stroke();

    // Add a chance to draw a smaller square inside the current square
    if (Math.random() > 0.5) {
      context.beginPath();
      context.rect(x + 8, y + 8, width - 16, height - 16); // Adjust position and size for inner square
      context.stroke();
    }
  }
}
```
This code snippet creates a 5x5 grid of squares on a canvas element. It defines the width, height, and spacing of the squares, then uses nested loops to iterate through each position in the grid. Inside the loops, it calculates the x and y coordinates for each square and draws its outline using the context.stroke() method.  

An interesting feature is the random chance to draw a smaller square inside some of the larger ones. The Math.random() > 0.5 condition checks if a random number is greater than 0.5. If it is, a smaller rectangle is drawn with an offset and adjusted size.


