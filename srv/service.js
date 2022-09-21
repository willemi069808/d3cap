const { Charting } = require('./d3functions.js');
const d3 = require('d3');

module.exports = async (srv) => {
    srv.after('READ', 'Simulations', async (item, req) => {
        if (Array.isArray(item)) return;

        const chart = new Charting();

        //BollingerChart
        //https://observablehq.com/@d3/bollinger-bands
        const dataBollingerChart = await srv.read('data_BollingerChart').where({ 'simulation_id': item.id });
        if (dataBollingerChart.length > 0) {
            for (let each of dataBollingerChart) {
                each.date = new Date(each.date);
                delete each.simulation_id;
            };
            chart.BollingerChart(dataBollingerChart, {
                x: d => d.date,
                y: d => d.close,
                N: 20, // number of periods, per input above
                K: 2, // number of standard deviations, per input above
                yLabel: "↑ Daily close ($)",
                width: 1500,
                height: 500
            });
        }

        //SankeyChart
        //https://observablehq.com/@d3/sankey
        const dataSankeyChart = await srv.read('data_SankeyChart').where({ 'simulation_id': item.id });
        if (dataSankeyChart.length > 0) {
            for (let each of dataSankeyChart) {
                delete each.simulation_id;
            };
            chart.SankeyChart({
                links: dataSankeyChart
            }, {
                nodeGroup: d => d.id.split(/\W/)[0], // take first word for color
                nodeAlign: 'justify', // e.g., d3.sankeyJustify; set by input above
                linkColor: 'source-target', // e.g., "source" or "target"; set by input above
                format: (f => d => `${f(d)} TWh`)(d3.format(",.1~f")),
                width: 1500,
                height: 500
            })
        }

        item.SVGObject = chart.getSVG();
    });
};
