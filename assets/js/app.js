// Scatter Plot 

// Define SVG dimensions 
let svgWidth = 960;
let svgHeight = 500;

let axisDelay = 2500; 
let circleDelay = 2500;

// Set the margin 
let margin = {
    top: 20, 
    right: 40, 
    bottom: 80, 
    left: 100
};

// Calculate chart Dimension by adjusting the margin 
let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrappeer
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group 
// Shift latter by left and top margins 
let chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

/********************************************/

d3.csv("assets/data/data.csv", rowConverter)
    .then(createChart)
    .catch(function (error) {
        console.log("*********unexpected error occured*********");
        console.log(error);
    });

/********************************************/

function rowConverter(row) {
    row.healthcare = +row.healthcare;
    row.poverty = +row.poverty;
    row.smokes = +row.smokes;
    row.age = +row.age;
    return row;
}

/********************************************/

function createChart(data) {
    console.table(data, [
        "state",
        "healthcare",
        "poverty",
        "smokes", 
        "age",
    ]);

    // Store the current chart info into activeInfo Object
    let activeInfo = {
        data: data, 
        currentX: "poverty",
        currentY: "healthcare",
    };

    activeInfo.xScale = d3
        .scaleLinear()
        .domain(getXDomain(activeInfo))
        .range([0, chartWidth]);

    activeInfo.yScale = d3
        .scaleLinear()
        .domain(getYDomain(activeInfo))
        .range([chartHeight, 0]);

    activeInfo.xAxis = d3.axisBottom(activeInfo.xScale);
    activeInfo.yAxis = d3.axisLeft(activeInfo.yScale);

    createAxis(activeInfo);
    createCircles(activeInfo);
    createToolTip(activeInfo);
    createLabels();

    d3.selectAll(".aText").on("click", function (event) {
        console.log(event);
        handleClick(d3.select(this), activeInfo);
    });
}

/********************************************/

function createLabels() {
    let xlabelsGroup = chartGroup
        .append("g")
        .attr("class", "xText")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    xlabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("data-name", "poverty")
        .atrr("data-axis", "x")
        .attr("class", "aText active x")
        .text("In Poverty (%)");

    xlabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("data-name", "age")
        .attr("data-axis", "x")
        .attr("class", "aText inactive x")
        .text("Age (Median)");

    let ylabelsGroup = chartGroup 
        .append("g")
        .attr("class", "yText")
        .attr("transform", `translate(-60 , ${chartHeight / 2}) rotate(-90)`);

    ylabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", -40)
        .attr("data-name", "healthcare")
        .attr("data-axis", "y")
        .attr("class", "aText active y")
        .text("Lacks Healthcare (%)");

    ylabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", -60)
        .attr("data-name", "smokes")
        .attr("data-axis", "y")
        .attr("class", "aText inactive y")
        .text("Smokes(%)");
}

/********************************************/

function createCircles(activeInfo) {
    let currentX = activeInfo.currentX;
    let currentY = activeInfo.currentY;
    let xScale = activeInfo.xScale;
    let yScale = activeInfo.yScale;

    chartGroup
        .selectAll("circle")
        .data(activeInfo.data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d[currentX]))
        .attr("cy", (d) => yScale(d[currentY]))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", ".5");
}

/********************************************/

function createAxis(activeInfo) {
    chartGroup
        .append("g")
        .call(activeInfo.yAxis)
        .attr("class", "y-axis");

    chartGroup
        .append("g")
        .call(activeInfo.xAxis)
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${chartHeight})`);
}

/********************************************/

function renderXAxes(activeInfo) {
    chartGroup
        .select(".x-axis")
        .transition()
        .duration(axisDelay)
        .call(activeInfo.xAxis);
}

/********************************************/

function renderYAxes(activeInfo) {
    chartGroup
        .select(".y-axis")
        .transition()
        .duration(axisDelay)
        .call(activeInfo.yAxis);
}

/********************************************/

function getXDomain(activeInfo) {
    let min = d3.min(activeInfo.data, (d) => d[activeInfo.currentX]);
    let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentX]);
    return [min * 0.8, max * 1.2];
}

/********************************************/

function getYDomain(activeInfo) {
    let min = d3.min(activeInfo.data, d => d[activeInfo.currentY]);
    let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentY]);
    return [min, max];
}

/********************************************/

function renderHorizontal(activeInfo) {
    d3.selectAll("circle").each(adjustCircles);

    function adjustCircles() {
        d3.select(this)
            .transition()
            .attr("cx", (d) => activeInfo.xScale(d[activeInfo.currentX]))
            .duration(circleDelay);
    }
}

/********************************************/

function renderVertical(activeInfo) {
    d3.selectAll("circle").each(adjustCircles);

    function adjustCirlces() {
        d3.select(this)
            .transition()
            .attr("cy", (d) => activeInfo.yScale(d[activeInfo.currentY]))
            .duration(circleDelay);
    }
}

/********************************************/
function updateLabel(label, axis) {
    d3.selectAll(".aText")
        .filter("." + axis)
        .filter(".active")
        .classed("active", false)
        .classed("inactive", true);

    label.classed("inactive", false).classed("active", true);
}

/********************************************/

function createToolTip(activeInfo) {
    let xlabel = "";
    let xpercent = "";

    if (activeInfo.currentX === "poverty") {
        label = "Poverty: ";
        xpercent = "%";
    } else {
        label = "Age: ";
    }

    let ylabel = "";
    let ypercent = "";

    if (activeInfo.currentY === "healthcare") {
        ylabel = "Healthcare: ";
        ypercent = "%";
    } else {
        ylabel = "Smokes: ";
        ypercent = "%";
    }

    let toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offest([50, -75])
        .html(function (event, d) {
            let html = 
                d.state +
                "<br> " + 
                `${xlabel} + ${xpercent}` +
                d[activeInfo.currentX] +
                "<br> " + 
                `${ylabel} + ${ypercent}` +
                d[activeInfo.currentY];
            return html;
        });

    chartGroup.call(toolTip);

    let circles = d3.selectAll("cirlce");
        
    circles.on("mouseover", toolTip.show);
        
    circles.on("mouseout", toolTip.hide);
}

