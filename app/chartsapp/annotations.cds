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
    }
]);

annotate service.Simulations with @(UI : {
    HeaderInfo                     : {
        TypeName       : 'Chart',
        TypeNamePlural : 'Charts',
        Title          : {Value : name},
        TypeImageUrl   : 'sap-icon://pie-chart'
    },
    Facets                         : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : 'General Information',
        Target : '@UI.FieldGroup#GeneralInformation',
    }, ],
    FieldGroup #GeneralInformation : {
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
    }
});
