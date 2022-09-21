using ChartingService as service from '../../srv/service';

annotate service.Simulations with @(UI.LineItem : [
    {
        $Type : 'UI.DataField',
        Label : 'ID',
        Value : id,
    },
    {
        $Type : 'UI.DataField',
        Label : 'Name',
        Value : name,
    },
]);

annotate service.Simulations with @(
    UI.HeaderInfo                  : {
        TypeName       : 'Chart',
        TypeNamePlural : 'Charts',
        Title          : {Value : name},
        TypeImageUrl   : 'sap-icon://pie-chart'
    },
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Label : 'id',
                Value : id,
            },
            {
                $Type : 'UI.DataField',
                Label : 'name',
                Value : name,
            },
        ],
    },
    UI.Facets                      : [{
        $Type  : 'UI.ReferenceFacet',
        ID     : 'GeneratedFacet1',
        Label  : 'General Information',
        Target : '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
