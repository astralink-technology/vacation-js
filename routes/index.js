exports.index = function(req, res){
    res.json('Welcome to list holiday API')
};

exports.list = function(req, res){
    if (
        req.query.CountryCode
    ) {
        var entityId = req.query.CompanyId;
        req, req.query = new Object();
        req.query.Entity = entityId;
        req.query.Type =  'E';

        var apiOptions = new Object();

        apiOptions.entityRelationshipFields = new Object();
        apiOptions.entityRelationshipFields.related_entity = 1;

        apiOptions.relatedEntityFields = new Object();
        apiOptions.relatedEntityFields._id = 1;
        apiOptions.relatedEntityFields.first_name = 1;
        apiOptions.relatedEntityFields.last_name = 1;
        apiOptions.relatedEntityFields.name = 1;
        apiOptions.relatedEntityFields.authentication_string_lower = 1;

        entityRelationshipController.getEntityRelationship(req, res, true, function(getCompanyEmployeesErr, getCompanyEmployees, getCompanyEmployeesRowsReturned, getCompanyEmployeesTotalRows){
            if (!getCompanyEmployeesErr){
                if (getCompanyEmployeesRowsReturned){
                    var getCompanyEmployeesData = new Array();
                    _.each(getCompanyEmployees, function(employee){
                        if (_.isObject(employee)) getCompanyEmployeesData.push(employee.related_entity);
                    })
                    apiHelper.getRes(req, res, getCompanyEmployeesErr, getCompanyEmployeesData, getCompanyEmployeesTotalRows, callback);
                }else{
                    apiHelper.getRes(req, res, getCompanyEmployeesErr, getCompanyEmployees, getCompanyEmployeesTotalRows, callback);
                }
            }else{
                apiHelper.getRes(req, res, getCompanyEmployeesErr, null, null, callback);
            }
        }, apiOptions);
    }else{
        apiHelper.getRes(req, res, "Company Id Required", null, null, callback);
    }
};