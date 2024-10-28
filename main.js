const svg = document.getElementById('drawingArea');

let points = [];
const NS = "http://www.w3.org/2000/svg";

let output = [];
let index = 0;

const color= {
    background: "lightgray",
    paper: "white",
    B: "black",
    C: "green",
    R: "red",
    S: "blue",
    P: "purple"
}

//draw point with cood and color choice.
function drawPoint(point, color) {
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', point[0]);
    circle.setAttribute('cy', point[1]);
    circle.setAttribute('r', 5);
    circle.setAttribute('fill', color);
    return circle;
}

//event handler for point input.
function pointInput(event) {
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = Math.round(event.clientY - rect.top);
    
    points.push([x, y]);

    svg.appendChild(drawPoint([x,y], color.S));
    console.log(points);
}

//clear button handler to clear SVG
function clearSVG() {
    svg.innerHTML = "";
    points = [];
}

//helper function for normalize 
function normalizeVector(vector) {
    const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
    return length > 0 ? [vector[0] / length, vector[1] / length] : [0, 0];
}

//function to draw a single parametric line.
function drawLine(point, direction, color, isDotted = false) {
    // Choose large positive and negative 's' values to extend the lines
    const s1 = -1000;
    const s2 = 1000;

    // Calculate the endpoints using the parametric equation F(s) = p1 + s * direction
    const x1 = point[0] + s1 * direction[0];
    const y1 = point[1] + s1 * direction[1];
    const x2 = point[0] + s2 * direction[0];
    const y2 = point[1] + s2 * direction[1];

    // Create a new line element
    const SVGLine = document.createElementNS(NS, 'line');
    SVGLine.setAttribute('x1', x1);
    SVGLine.setAttribute('y1', y1);
    SVGLine.setAttribute('x2', x2);
    SVGLine.setAttribute('y2', y2);
    SVGLine.setAttribute('stroke', color);
    SVGLine.setAttribute('stroke-width', 2);
    if (isDotted) lineElem.setAttribute("stroke-dasharray", "5,5"); // Make dotted
    return SVGLine;
}

function drawLines(lines, color) {
    const existingLines = document.querySelectorAll('line');
    existingLines.forEach(line => line.remove());

    // Set all existing circle elements back to blue
    const circles = svg.querySelectorAll("circle");
    circles.forEach(circle => circle.setAttribute("fill", "blue"));


    if (lines.length === 0) { return }; //return if no lines found.

    lines.forEach(line => {
        const p1 = line.p1; // Starting point [x, y]
        const direction = line.direction; // Direction vector [dx, dy]

        svg.appendChild(drawLine(p1, direction, color));
    });
}


function drawCurrentLine() {
    const existingLines = document.querySelectorAll('line');
    existingLines.forEach(line => line.remove());

    // Set all existing circle elements back to blue
    const circles = svg.querySelectorAll("circle");
    circles.forEach(circle => circle.setAttribute("fill", "blue"));

    if (output.length === 0) { return }; //return if no lines found.

    const line = output[index];
    const { p1, direction, extraPoints, extraLine, extraDottedLine } = line;

    svg.appendChild(drawLine(p1, direction, color.S));

    // Draw the extra solid line if `extraLine` is defined
    if (extraLine) {
        svg.appendChild(drawLine(extraLine.p1, extraLine.direction, color.B, false));
    }

    // Draw the extra dotted line if `extraDottedLine` is defined
    if (extraDottedLine) {
        svg.appendChild(drawLine(extraDottedLine.p1, extraDottedLine.direction, color.B, true));
    }
    
    const pointColors = ["black", "green", "red", "purple"];
    extraPoints.forEach((point, index) => {
        const color = pointColors[index] || "gray"; // Default to gray if more than 4 points
        const existingCircle = svg.querySelector(`circle[cx="${point[0]}"][cy="${point[1]}"]`);
        if (existingCircle) {
            // Update the color of the existing circle
            existingCircle.setAttribute("fill", color);
        } else {
            svg.appendChild(drawPoint(point, color));
            console.log("drawing point", point, color);
        }
    });

}

//helper function for perpendicular vector
function perpendicular(vector) {
    return [-vector[1], vector[0]];
}

function axiom1() {
    output = [];
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        for (let j = i + 1; j < points.length; j++){
            const p2 = points[j];
            
            let line = { p1: p1, direction: [p2[0] - p1[0], p2[1] - p1[1]], p2:p2, extraPoints:[p1,p2] };
            output.push(line);
        }
    }
    console.log(output);
    return (output);
}

function axiom2(lines) {
    output = [];

    lines.forEach(line => {
        const p1 = line.p1;
        const p2 = line.p2;

        // Calculate the direction vector of the line segment p1p2
        const direction = [p2[0] - p1[0], p2[1] - p1[1]];

        // Calculate the midpoint of the line segment
        const midpoint = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

        const PerpVector = perpendicular(direction);

        output.push({ p1: midpoint, direction: PerpVector, extraPoints:[p1, p2]});
    });

    return output;
}

function axiom3() {
    output = [];

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        for (let j = i + 1; j < points.length; j++) {
            const p2 = points[j];
            for (let k = 0; k < points.length; k++) {
                if (k !== i && k !== j) { // Ensure k is not the same as i or j
                    const p3 = points[k];

                    // Create direction vectors
                    const dirU = [p2[0] - p1[0], p2[1] - p1[1]]; // Line p1 to p2
                    const dirV = [p3[0] - p2[0], p3[1] - p2[1]]; // Line p2 to p3
                    const dirW = [p3[0] - p1[0], p3[1] - p1[1]]; // Line p1 to p3

                    // Calculate lengths of the direction vectors
                    const lengthU = Math.sqrt(dirU[0] ** 2 + dirU[1] ** 2);
                    const lengthV = Math.sqrt(dirV[0] ** 2 + dirV[1] ** 2);
                    const lengthW = Math.sqrt(dirW[0] ** 2 + dirW[1] ** 2);

                    // Check for zero length to prevent NaN in normalization
                    const unitU = lengthU > 0 ? [dirU[0] / lengthU, dirU[1] / lengthU] : [0, 0];
                    const unitV = lengthV > 0 ? [dirV[0] / lengthV, dirV[1] / lengthV] : [0, 0];
                    const unitW = lengthW > 0 ? [dirW[0] / lengthW, dirW[1] / lengthW] : [0, 0];

                    // Calculate the direction vector for each angle bisector
                    const w1 = [
                        (lengthU * dirV[0] + lengthV * dirU[0]) / (lengthU + lengthV),
                        (lengthU * dirV[1] + lengthV * dirU[1]) / (lengthU + lengthV)
                    ]; // Bisector at p2

                    const w2 = [
                        (lengthW * dirU[0] + lengthU * dirW[0]) / (lengthW + lengthU),
                        (lengthW * dirU[1] + lengthU * dirW[1]) / (lengthW + lengthU)
                    ]; // Bisector at p1

                    const w3 = [
                        (lengthV * dirW[0] + lengthW * dirV[0]) / (lengthV + lengthW),
                        (lengthV * dirW[1] + lengthW * dirV[1]) / (lengthV + lengthW)
                    ]; // Bisector at p3

                    // Store parametric equations for the angle bisectors
                    output.push({ p1: p2, direction: w1, extraPoints:[p1, p2, p3] }); // Bisector at p2
                    output.push({ p1: p1, direction: w2, extraPoints:[p1, p2, p3] }); // Bisector at p1
                    output.push({ p1: p3, direction: w3, extraPoints:[p1, p2, p3] }); // Bisector at p3

                    // Calculate the perpendicular direction vectors for each angle bisector
                    const perpW1 = [-w1[1], w1[0]]; // Perpendicular to w1
                    const perpW2 = [-w2[1], w2[0]]; // Perpendicular to w2
                    const perpW3 = [-w3[1], w3[0]]; // Perpendicular to w3

                    // Store parametric equations for the perpendicular bisectors
                    output.push({ p1: p2, direction: perpW1, extraPoints:[p1, p2, p3] }); // Perpendicular at p2
                    output.push({ p1: p1, direction: perpW2, extraPoints:[p1, p2, p3] }); // Perpendicular at p1
                    output.push({ p1: p3, direction: perpW3, extraPoints:[p1, p2, p3] }); // Perpendicular at p3
                }
            }
        }
    }

    return output;
}

function axiom4() {
    output = [];

    // Iterate through all combinations of three points
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        for (let j = i + 1; j < points.length; j++) {
            const p2 = points[j];
            for (let k = 0; k < points.length; k++) {
                if (k !== i && k !== j) { // Ensure k is not the same as i or j
                    const p3 = points[k];

                    // Create a line l1 from points p1 and p2
                    const lineL1 = { p1: p1, p2: p2 };

                    // Calculate the direction vector for line l1
                    const direction = [lineL1.p2[0] - lineL1.p1[0], lineL1.p2[1] - lineL1.p1[1]];

                    // Calculate the perpendicular vector to the direction
                    const perpendicularVector = [-direction[1], direction[0]];

                    // Store the parametric representation of the perpendicular line through p3
                    output.push({ p1: p3, direction: perpendicularVector, extraPoints: [p1, p2, p3], extraLine: { p1: p1, direction: [p2[0] - p1[0], p2[1] - p1[1]] } });
                }
            }
        }
    }
    return output;
}

function axiom5() {
    output = [];
//01 02 03 12 13 23
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            for (let k = 0; k < points.length; k++) {
                for (let l = 0; l < points.length; l++) {
                    if (k !== i && k !== j && l !== i && l !== j) { // Ensure k and l are not the same as i or j
                        const p1 = points[i]; // Point 1 for line l1
                        const p2 = points[j]; // Point 2 for line l1
                        const p3 = points[k]; // Point 3 to define the circle (fold should intersect this point.)
                        const p4 = points[l]; // Point 4 to define the line segments

                        // Calculate the radius from p3 to p4
                        const radius = Math.sqrt((p4[0] - p3[0]) ** 2 + (p4[1] - p3[1]) ** 2);

                        // Line l1: calculate direction vector
                        const dirU = [p2[0] - p1[0], p2[1] - p1[1]];
                        const slopeL1 = dirU[1] / dirU[0]; // Slope of line l1
                        const interceptL1 = p1[1] - slopeL1 * p1[0]; // y-intercept of l1

                        // Find the intersection points (d1, d2) of line l1 and circle centered at p3
                        const a = 1 + slopeL1 ** 2; // Coefficient for x^2
                        const b = -2 * p3[0] + 2 * slopeL1 * (interceptL1 - p3[1]); // Coefficient for x
                        const c = (p3[0] ** 2 + (interceptL1 - p3[1]) ** 2 - radius ** 2); // Constant term

                        // Calculate the discriminant
                        const discriminant = b ** 2 - 4 * a * c;

                        if (discriminant >= 0) {
                            // Calculate the intersection point d1
                            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                            const y1 = slopeL1 * x1 + interceptL1;
                            const d1 = [x1, y1];

                            // Line segment m1 from p4 to d1
                            const dirV1 = [d1[0] - p4[0], d1[1] - p4[1]];
                            const perp1 = perpendicular(dirV1);

                            // Push parametric line for the first intersection point d1
                            output.push({
                                p1: [
                                    p4[0] + 0.5 * (d1[0] - p4[0]),
                                    p4[1] + 0.5 * (d1[1] - p4[1])
                                ],
                                direction: perp1,
                                extraPoints: [p1, p2, p3, p4],
                                extraLine: { p1: p1, direction: [p2[0] - p1[0], p2[1] - p1[1]]}
                            });

                            if (discriminant > 0) {
                                // Calculate the second intersection point d2
                                const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                                const y2 = slopeL1 * x2 + interceptL1;
                                const d2 = [x2, y2];

                                // Line segment m2 from p4 to d2
                                const dirV2 = [d2[0] - p4[0], d2[1] - p4[1]];
                                const perp2 = perpendicular(dirV2);

                                // Push parametric line for the second intersection point d2
                                output.push({
                                    p1: [
                                        p4[0] + 0.5 * (d2[0] - p4[0]),
                                        p4[1] + 0.5 * (d2[1] - p4[1])
                                    ],
                                    direction: perp2,
                                    extraPoints: [p1, p2, p3, p4],
                                    extraLine: { p1: p1, direction: [p2[0] - p1[0], p2[1] - p1[1]]}
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    console.log("am i here?")
    console.log(output)
    return output;
}

// Attach event listener to the SVG for click events
svg.addEventListener('click', pointInput);

document.getElementById("clear").onclick = () => {
    clearSVG();
};

document.getElementById("next").onclick = () => {
    if (index < output.length - 1) {
        index++;
        drawCurrentLine();
    }
};

document.getElementById("prev").onclick = () => {
    if (index > 0) {
        index--;
        drawCurrentLine();
    }
};


document.getElementById("1").onclick = () => {
    drawLines(axiom1(), color.S, true);
    index = 0;
};

document.getElementById("2").onclick = () => {
    drawLines(axiom2(axiom1()), color.S, true);
    index = 0;
};

document.getElementById("3").onclick = () => {
    drawLines(axiom1(),color.R,true);
    drawLines(axiom3(), color.S, false);
    index = 0;
};

document.getElementById("4").onclick = () => {
    drawLines(axiom4(), color.S, true);
    index = 0;
};

document.getElementById("5").onclick = () => {
    drawLines(axiom5(), color.S, true);
    index = 0;
};