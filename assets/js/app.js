// Svg Dimensions 
var svgWidth = 960;
var svgHeight = 620;

// Margin 
var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};

// Chart Dimension by adjusting the margin
var chartWidth = svgWidth - margin.right - margin.left;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Append div classed chart to the scatter element
var chart = d3.select("#scatter")
    .append("div")
    .classed("chart", true);


// SVG Wrapper 
var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Apppend an SVG Group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used to update X-Scale
function xScale(stateData, chosenXAxis) {
    // Create Scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
            d3.max(stateData, d => d[chosenXAxis]) * 1.2])
        .range([0, chartWidth]);

    return xLinearScale;
}

// Function used to update Y-Scale 
function yScale(stateData, chosenYAxis) {
    // Create Scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
            d3.max(stateData, d => d[chosenYAxis]) * 1.2])
        .range([chartHeight, 0]);

    return yLinearScale;
}

// Function used to update xAxis 
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used to update yAxis 
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used to update circles group 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function used to update state labels 
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}
// Function to style x-axis values for tooltips
function styleX(value, chosenXAxis) {
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    else {
        return `${value}`;
    }
}

// Function used to update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if (chosenXAxis === 'poverty') {
        var xLabel = "Poverty:";
    }
    else {
        var xLabel = "Age:";
    }

    if (chosenYAxis === 'healthcare') {
        var yLabel = "Healthcare:"
    }
    else {
        var yLabel = "Smokers:"
    }

    // Create Tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    // Handle Click Event 
    circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    return circlesGroup;
}

// CSV data 
d3.csv("./assets/data/data.csv").then(function(stateData) {

    console.log(stateData);

    // Parse data
    stateData.forEach(function(data) {
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Create Linear Scalees 
    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create Axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append X-Axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // Append Y-Axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Append Circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("opacity", ".5");

    // Append Text
    var textGroup = chartGroup.selectAll(".stateText")
        .data(stateData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function(d) { return d.abbr });

    // Create X-Axis label group 
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20 + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    // Create Y-Axis label group 
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(chartHeight/2)})`);

    var healthcareLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)");

    // Update tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X-Axis Label Event 
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // Value of selection
            var value = d3.select(this).attr("value");

            // Check if value is same as current axis
            if (value != chosenXAxis) {

                // Replace chosenXAxis with value
                chosenXAxis = value;

                // Update XScale 
                xLinearScale = xScale(stateData, chosenXAxis);

                // Update X-Axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Update circles with new X values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update text with new X values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update tooltips 
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Change classes 
                if (chosenXAxis === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                } else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                }
            }
        });

    // Y-Axis Label Event 
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // Value of selection
            var value = d3.select(this).attr("value");

            // Check if value is same as current axis
            if (value != chosenYAxis) {

                // Replace chosenYAxis with value
                chosenYAxis = value;

                // Update Y-Scale
                yLinearScale = yScale(stateData, chosenYAxis);

                // Update Y-Axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Update circles with new Y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update text with new Y values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                // Update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Change classes 
                if (chosenYAxis === "healthcare") {
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);
                } else {
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                }
            }
        });
});
