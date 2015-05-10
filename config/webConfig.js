exports.mainConfig = function(){
    var mainConfig = new Object();
    mainConfig.production = true;

    return mainConfig;
}

exports.awsS3Config = function(){
    var awsS3Config = new Object();
    awsS3Config.accessKeyId = null;
    awsS3Config.accessKeySecret = null;
    awsS3Config.s3Dns = 'https://s3-ap-southeast-1.amazonaws.com';
    awsS3Config.bucket = null;

    return awsS3Config;
}


exports.trackingConfig = function(){
    var whiteList = new Object();
    var enterpriseWhiteList = new Array();

    whiteList.enterpriseWhiteList = enterpriseWhiteList;

    return whiteList;
}

exports.mongoDbConfig = function(){

    var mongoDbConfig = new Object();
    mongoDbConfig.db = 'eyex';
    mongoDbConfig.dbUser = 'shiweifong';
    mongoDbConfig.password = 's8944896d';
    mongoDbConfig.host = 'ds033107.mongolab.com:33107';

    //for session usage
    mongoDbConfig.sessDb = 'eyex-session';
    mongoDbConfig.sessDbUser = 'shiweifong';
    mongoDbConfig.sessPassword = 's8944896d';
    mongoDbConfig.sessHost = 'ds033439.mongolab.com:33439';

    return mongoDbConfig;
}

exports.dbConfig = function(){
    var dbConfig = new Object();
    //When development for eyeOrcas, use this
    dbConfig.appName = null;
    dbConfig.username = null;
    dbConfig.password = null;
    dbConfig.host = null;
    dbConfig.port = null;
    dbConfig.db = null;
    dbConfig.sslMode = true;

    return dbConfig;
}

exports.mailConfig = function(){
    var mailConfig = new Object();

    mailConfig.host = 'smtp.mandrillapp.com';
    mailConfig.username = 'shiweifong@gmail.com';
    mailConfig.password = '9nwaBLJV5FtYeOeyfF_yBQ';
    mailConfig.from = 'shiwei@chilli-panda.com';
    mailConfig.fromName = 'Chillipanda';
    mailConfig.addReplyTo = 'shiwei@chilli-panda.com';
    mailConfig.bcc = 'shiwei@chilli-panda.com';

    return mailConfig;
}

exports.pusherConfig = function(){
    var pusherConfig = new Object();
    pusherConfig.AppId = null;
    pusherConfig.Key = null;
    pusherConfig.Secret = null;

    return pusherConfig;
}