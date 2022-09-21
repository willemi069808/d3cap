const d3 = require('d3');
const d3Sankey = require('d3-sankey');
const JSDOM = require('jsdom').JSDOM;

class Charting {
    constructor() {
        console.log('Initializing new chart');
        const dom = new JSDOM('<!DOCTYPE html><body></body>');
        this.html = d3.select(dom.window.document.querySelector('body'));
    }
    getSVG = () => this.html.html();

    // Copyright 2021 Observable, Inc.
    // Released under the ISC license.
    // https://observablehq.com/@d3/bollinger-bands
    BollingerChart = (data, {
        x = ([x]) => x, // given d in data, returns the (temporal) x-value
        y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
        N = 20, // number of periods for rolling mean
        K = 2, // number of standard deviations to offset each band
        curve = d3.curveLinear, // method of interpolation between points
        marginTop = 20, // top margin, in pixels
        marginRight = 30, // right margin, in pixels
        marginBottom = 30, // bottom margin, in pixels
        marginLeft = 40, // left margin, in pixels
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        xDomain, // [xmin, xmax]
        xRange = [marginLeft, width - marginRight], // [left, right]
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        yFormat, // a format specifier string for the y-axis
        yLabel, // a label for the y-axis
        colors = ["#aaa", "green", "blue", "red"], // color of the 4 lines
        strokeWidth = 1.5, // width of lines, in pixels
        strokeLinecap = "round", // stroke line cap of lines
        strokeLinejoin = "round" // stroke line join of lines
    } = {}) => {
        console.log('... adding BollingerChart');

        // Compute values.
        const X = d3.map(data, x);
        const Y = d3.map(data, y);
        const I = d3.range(X.length);

        // Compute default domains.
        if (xDomain === undefined) xDomain = d3.extent(X);
        if (yDomain === undefined) yDomain = [0, d3.max(Y)];

        // Construct scales and axes.
        const xScale = d3.scaleUtc(xDomain, xRange);
        const yScale = d3.scaleLinear(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale).ticks(null, yFormat);

        // Construct a line generator.
        const line = d3.line()
            .defined((y, i) => !isNaN(X[i]) && !isNaN(y))
            .curve(curve)
            .x((y, i) => xScale(X[i]))
            .y((y, i) => yScale(y));

        function bollinger(N, K) {
            return values => {
                let i = 0;
                let sum = 0;
                let sum2 = 0;
                const Y = new Float64Array(values.length).fill(NaN);
                for (let n = Math.min(N - 1, values.length); i < n; ++i) {
                    const value = values[i];
                    sum += value, sum2 += value ** 2;
                }
                for (let n = values.length; i < n; ++i) {
                    const value = values[i];
                    sum += value, sum2 += value ** 2;
                    const mean = sum / N;
                    const deviation = Math.sqrt((sum2 - sum ** 2 / N) / (N - 1));
                    Y[i] = mean + deviation * K;
                    const value0 = values[i - N + 1];
                    sum -= value0, sum2 -= value0 ** 2;
                }
                return Y;
            };
        }

        // const svg = d3.create("svg")
        const svg = this.html.append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic; overflow: visible;");

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(yLabel));

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", strokeWidth)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("stroke-linecap", strokeLinecap)
            .selectAll()
            .data([Y, ...[-K, 0, +K].map(K => bollinger(N, K)(Y))])
            .join("path")
            .attr("stroke", (d, i) => colors[i])
            .attr("d", line);

        return svg.node();
    };

    // Copyright 2021 Observable, Inc.
    // Released under the ISC license.
    // https://observablehq.com/@d3/sankey-diagram
    SankeyChart = ({
        nodes, // an iterable of node objects (typically [{id}, …]); implied by links if missing
        links // an iterable of link objects (typically [{source, target}, …])
    }, {
        format = ",", // a function or format specifier for values in titles
        align = "justify", // convenience shorthand for nodeAlign
        nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
        nodeGroup, // given d in nodes, returns an (ordinal) value for color
        nodeGroups, // an array of ordinal values representing the node groups
        nodeLabel, // given d in (computed) nodes, text to label the associated rect
        nodeTitle = d => `${d.id}\n${format(d.value)}`, // given d in (computed) nodes, hover text
        nodeAlign = align, // Sankey node alignment strategy: left, right, justify, center
        nodeWidth = 15, // width of node rects
        nodePadding = 10, // vertical separation between adjacent nodes
        nodeLabelPadding = 6, // horizontal separation between node and label
        nodeStroke = "currentColor", // stroke around node rects
        nodeStrokeWidth, // width of stroke around node rects, in pixels
        nodeStrokeOpacity, // opacity of stroke around node rects
        nodeStrokeLinejoin, // line join for stroke around node rects
        linkSource = ({ source }) => source, // given d in links, returns a node identifier string
        linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
        linkValue = ({ value }) => value, // given d in links, returns the quantitative value
        linkPath = d3Sankey.sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
        linkTitle = d => `${d.source.id} → ${d.target.id}\n${format(d.value)}`, // given d in (computed) links
        linkColor = "source-target", // source, target, source-target, or static color
        linkStrokeOpacity = 0.5, // link stroke opacity
        linkMixBlendMode = "multiply", // link blending mode
        colors = d3.schemeTableau10, // array of colors
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        marginTop = 5, // top margin, in pixels
        marginRight = 1, // right margin, in pixels
        marginBottom = 5, // bottom margin, in pixels
        marginLeft = 1, // left margin, in pixels
    } = {}) => {
        console.log('... adding SankeyChart');

        // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
        if (typeof nodeAlign !== "function") nodeAlign = {
            left: d3Sankey.sankeyLeft,
            right: d3Sankey.sankeyRight,
            center: d3Sankey.sankeyCenter
        }[nodeAlign] ?? d3Sankey.sankeyJustify;

        // Compute values.
        const LS = d3.map(links, linkSource).map(intern);
        const LT = d3.map(links, linkTarget).map(intern);
        const LV = d3.map(links, linkValue);
        if (nodes === undefined) nodes = Array.from(d3.union(LS, LT), id => ({ id }));
        const N = d3.map(nodes, nodeId).map(intern);
        const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);

        // Replace the input nodes and links with mutable objects for the simulation.
        nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
        links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i], value: LV[i] }));

        // Ignore a group-based linkColor option if no groups are specified.
        if (!G && ["source", "target", "source-target"].includes(linkColor)) linkColor = "currentColor";

        // Compute default domains.
        if (G && nodeGroups === undefined) nodeGroups = G;

        // Construct the scales.
        const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

        // Compute the Sankey layout.
        d3Sankey.sankey()
            .nodeId(({ index: i }) => N[i])
            .nodeAlign(nodeAlign)
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
            ({ nodes, links });

        // Compute titles and labels using layout nodes, so as to access aggregate values.
        if (typeof format !== "function") format = d3.format(format);
        const Tl = nodeLabel === undefined ? N : nodeLabel == null ? null : d3.map(nodes, nodeLabel);
        const Tt = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
        const Lt = linkTitle == null ? null : d3.map(links, linkTitle);

        // A unique identifier for clip paths (to avoid conflicts).
        const uid = `O-${Math.random().toString(16).slice(2)}`;

        // const svg = d3.create("svg")
        const svg = this.html.append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const node = svg.append("g")
            .attr("stroke", nodeStroke)
            .attr("stroke-width", nodeStrokeWidth)
            .attr("stroke-opacity", nodeStrokeOpacity)
            .attr("stroke-linejoin", nodeStrokeLinejoin)
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0);

        if (G) node.attr("fill", ({ index: i }) => color(G[i]));
        if (Tt) node.append("title").text(({ index: i }) => Tt[i]);

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", linkStrokeOpacity)
            .selectAll("g")
            .data(links)
            .join("g")
            .style("mix-blend-mode", linkMixBlendMode);

        if (linkColor === "source-target") link.append("linearGradient")
            .attr("id", d => `${uid}-link-${d.index}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("x2", d => d.target.x0)
            .call(gradient => gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", ({ source: { index: i } }) => color(G[i])))
            .call(gradient => gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", ({ target: { index: i } }) => color(G[i])));

        link.append("path")
            .attr("d", linkPath)
            .attr("stroke", linkColor === "source-target" ? ({ index: i }) => `url(#${uid}-link-${i})`
                : linkColor === "source" ? ({ source: { index: i } }) => color(G[i])
                    : linkColor === "target" ? ({ target: { index: i } }) => color(G[i])
                        : linkColor)
            .attr("stroke-width", ({ width }) => Math.max(1, width))
            .call(Lt ? path => path.append("title").text(({ index: i }) => Lt[i]) : () => { });

        if (Tl) svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(({ index: i }) => Tl[i]);

        function intern(value) {
            return value !== null && typeof value === "object" ? value.valueOf() : value;
        }

        return Object.assign(svg.node(), { scales: { color } });
    };
}
module.exports = {
    Charting: Charting
};