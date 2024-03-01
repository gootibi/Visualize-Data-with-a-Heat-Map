/** Main values */
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

let baseTemp;
let values = [];

let xScale;
let yScale;
let yScaleRight;

let minYear;
let maxYear;

let width = 1200;
let height = 600;
let padding = 60;

let canvas = d3.select('#canvas');
let legend = d3.select('#legend');
let tooltip = d3.select('#tooltip');

/** Create canvas and legend size */
const drawCanvas = () => {

    canvas.attr('width', width);
    canvas.attr('height', height);
    legend.attr('width', 300);
    legend.attr('height', 155);

};

/** Generate x scale and y (left - right) scale */
const generateScale = () => {

    minYear = d3.min(values, (item) => {
        return item['year'];
    });

    maxYear = d3.max(values, (item) => {
        return item['year'];
    });

    xScale = d3.scaleLinear()
        .domain([minYear, maxYear + 1])
        .range([padding, width - padding])

    yScale = d3.scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)]) // Date format => year, month, day, hour, minute, second, millisecond
        .range([padding, height - padding])

    yScaleRight = d3.scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)]) // Date format => year, month, day, hour, minute, second, millisecond
        .range([padding, height - padding])
};

/** Create cells and tooltip */
const drawCells = () => {

    canvas.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', (item) => {
            let variance = item['variance']
            if (variance <= -1) {
                return 'SteelBlue'
            } else if (variance <= 0) {
                return 'LightSteelBlue'
            } else if (variance < 1) {
                return 'Orange'
            } else {
                return 'Crimson'
            }
        })
        .attr('data-year', (item) => {
            return item['year']
        })
        .attr('data-month', (item) => {
            return item['month'] - 1 // month 1 - 12 => in javascript month 0 - 11
        })
        .attr('data-temp', (item) => {
            return baseTemp + item['variance'] // base temperature plus actual temperature
        })
        .attr('height', (height - (2 * padding)) / 12)
        .attr('y', (item) => {
            return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0)) // Date format => year, month, day, hour, minute, second, millisecond
        })
        .attr('width', (item) => {
            let numberOfYears = maxYear - minYear;
            return (width - (2 * padding)) / numberOfYears
        })
        .attr('x', (item) => {
            return xScale(item['year'])
        })
        .on('mouseover', (e, item) => {
            tooltip.transition()
                .style('visibility', 'visible')

            let monthName = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ]

            tooltip.text(`${item['year']} ${monthName[item['month'] - 1]} - ${baseTemp + item['variance']} (${item['variance']})`)

            tooltip.attr('data-year', item['year'])
        })
        .on('mouseout', (e, item) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })

};

/** Draw x axis (number => year) and y axis (number => month) */
const drawAxes = () => {

    let xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d')) // 'd' decimal or integer format settings

    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%B')) // '%B' for month string format settings

    let yAxisRight = d3.axisRight(yScaleRight)
        .tickFormat(d3.timeFormat('%B')) // '%B' for month string format settings

    canvas.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`)

    canvas.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`)

    canvas.append('g')
        .call(yAxisRight)
        .attr('id', 'y-axis-right')
        .attr('transform', `translate(${width - padding}, 0)`)

};

/** Windows onload (async function) => data fetching and functions */
window.onload = async () => {

    /** Data fetching (base temperature, year, month and temperature variance)*/
    let req = await fetch(url);
    let data = await req.json();
    baseTemp = data['baseTemperature']
    values = data['monthlyVariance']

    /** Functions load */
    drawCanvas();
    generateScale();
    drawCells();
    drawAxes();

};