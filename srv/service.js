const { Charting } = require('./d3functions.js');
const d3 = require('d3');

module.exports = async (srv) => {
    srv.after('READ', srv.entities.Simulations, async (item, req) => {
        if (Array.isArray(item) || !item) return;

        const chart = new Charting();
        switch (item.id) {
            case 'bollingerchart':
                //https://observablehq.com/@d3/bollinger-bands
                await srv.read(srv.entities.BollingerChartData).then(data => {
                    console.log(`... retrieved ${data.length} data points`);
                    if (data.length > 0) {
                        data.forEach(e => e.date = new Date(e.date));
                        chart.BollingerChart(data, {
                            x: d => d.date,
                            y: d => d.close,
                            N: 20,
                            K: 2,
                            yLabel: "↑ Daily close ($)",
                            width: 1500,
                            height: 500
                        });
                    }
                });
                break;

            case 'sankeychart':
                //https://observablehq.com/@d3/sankey
                await srv.read(srv.entities.SankeyChartData).then(data => {
                    console.log(`... retrieved ${data.length} data points`);
                    if (data.length > 0) {
                        chart.SankeyChart({
                            links: data
                        }, {
                            nodeGroup: d => d.id.split(/\W/)[0],
                            nodeAlign: 'justify',
                            linkColor: 'source-target',
                            format: (f => d => `${f(d)} TWh`)(d3.format(",.1~f")),
                            width: 1500,
                            height: 500
                        });
                    }
                });
                break;

            default:
                console.log(`Simulation ${item.id} not implemented`);
                break;
        }

        item.SVGObject = chart.getSVG();
    });
};
