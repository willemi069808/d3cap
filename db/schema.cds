namespace db;

entity Simulations {
    key id             : Integer;
        name           : String;
        SVGObject      : String;

        BollingerChart : Composition of many data_BollingerChart
                             on BollingerChart.simulation = $self;
        SankeyChart    : Composition of many data_SankeyChart
                             on SankeyChart.simulation = $self;
}

entity data_BollingerChart {
    simulation : Association to Simulations;
    date       : Date;
    close      : Double;
}

entity data_SankeyChart {
    simulation : Association to Simulations;
    source     : String;
    target     : String;
    value      : Double;
}
