var vacationController = _require('/routes/m-core/vacation');
var apiHelper = _require('/helpers/api');

exports.index = function(req, res){
    res.json('Welcome to list holiday API')
};

exports.list = function(req, res){
    if (
        req.query.CountryCode
    ) {
        vacationController.getVacation(req, res, true, null)
    }else{
        apiHelper.getRes(req, res, "Country Code Required", null, null, null);
    }
};