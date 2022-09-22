using db from '../db/schema';

service ChartingService {
    entity Simulations        as projection on db.Simulations;
    entity BollingerChartData as projection on db.data_BollingerChart;
    entity SankeyChartData    as projection on db.data_SankeyChart;
}
