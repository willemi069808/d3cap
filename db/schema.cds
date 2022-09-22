namespace db;

@readonly
entity Simulations {
    key id                : String;
        name              : String;
        virtual SVGObject : String @Core.Computed default '';
};

@readonly
entity data_BollingerChart {
    date  : Date;
    close : Double;
};

@readonly
entity data_SankeyChart {
    source : String;
    target : String;
    value  : Double;
};
