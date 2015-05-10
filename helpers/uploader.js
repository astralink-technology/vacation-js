/*
 * AST NodeJS AWS S3 Bucket Uploader Helper
 *
 * Copyright 2015 Astralink Technology
 * Author Fong Shi Wei
 * Released under the MIT license
 *
 * VERSION 2.1.1
 *
 */

var fs = require('fs-extra');
var aws = require('aws-sdk');
var path = require('path');
var gm = require('gm')
    , imageMagick = gm.subClass({ imageMagick: true });
var idGen = _require('/helpers/idGen');
var webConfig = _require('/config/webConfig');

var awsS3Config = webConfig.awsS3Config();
aws.config.update({ accessKeyId: awsS3Config.accessKeyId, secretAccessKey: awsS3Config.accessKeySecret });

var awsDns = awsS3Config.s3Dns;
var awsBucket = awsS3Config.bucket;

function getContentTypeByFile(fileName) {
    var rc = 'application/octet-stream';
    var fn = fileName.toLowerCase();

    if (fn.indexOf('.html') >= 0) rc = 'text/html';
    else if (fn.indexOf('.css') >= 0) rc = 'text/css';
    else if (fn.indexOf('.json') >= 0) rc = 'application/json';
    else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
    else if (fn.indexOf('.png') >= 0) rc = 'image/png';
    else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

    return rc;
}

var resizeImage = function (req, res, srcPathFile, dstPath, dstPathFile, s3UploadThumbPath,  size, callback){
    if (srcPathFile && dstPathFile && dstPath && size){
        //ensure that destination path is there
        fs.ensureDir(dstPath, function(){
            imageMagick(srcPathFile)
                .resize(size, size)
                .noProfile()
                .write(dstPathFile, function (err) {
                    if (err){
                        res.json({
                            RowsReturned : null,
                            Data : null,
                            Error : true,
                            ErrorDesc : err,
                            ErrorCode: 500
                        });
                        return;
                    }else{
                        //upload thumb to s3
                        var s3 = new aws.S3();
                        var fileBuffer = fs.readFileSync(dstPathFile);
                        var metaData = getContentTypeByFile(dstPathFile);
                        s3.putObject({
                            ACL: 'public-read',
                            Bucket: awsBucket,
                            Key: s3UploadThumbPath,
                            Body: fileBuffer,
                            ContentType: metaData
                        }, function(error, response) {
                            if (!error){
                                callback();
                            }else{
                                res.json({
                                    RowsReturned : null,
                                    Data : null,
                                    Error : true,
                                    ErrorDesc : err,
                                    ErrorCode: 500
                                });
                                return;
                            }
                        });

                    }
                });
        })
    }else{
        res.json({
            RowsReturned : null,
            Data : null,
            Error : true,
            ErrorDesc : 'Parameters are required for image resizing',
            ErrorCode: 500
        });
    }
}

var startImageUpload = function(req, res, ownerId){
    //gets the application directory
    var appDir = path.dirname(require.main.filename);
    //get the extension name
    var fileTypeExt = path.extname(req.files.image.name);

    //name of the new file
    var fileNameGen = idGen.imageNameGen();
    var newFileName = fileNameGen + fileTypeExt;
    var resizeImageName = fileNameGen + '-thumb' + fileTypeExt;

    //the main path that all newly uploaded images will be stored
    var fullPath = appDir + '/public/data/original/';
    var resizePath = appDir + '/public/data/thumb/';
    if (ownerId){
        fullPath = appDir + '/public/data/' + ownerId + '/original/';
        resizePath = appDir + '/public/data/' + ownerId + '/thumb/';
    }

    //The full path of the storage
    var fileStorageFullPath = fullPath + newFileName;
    var fileStorageFullPathResized = resizePath + resizeImageName;

    //path that will be released to users and stored in database
    var fileStorageReleasePath = '/data/original/' + newFileName;
    var fileStorageReleasePathResized = '/data/thumb/' + resizeImageName;
    if (ownerId){
        fileStorageReleasePath  = appDir + '/data/' + ownerId + '/original/' + newFileName;
        fileStorageReleasePathResized  = appDir + '/data/' + ownerId + '/thumb/' + resizeImageName;
    }

    //set the s3 paths
    var s3StoragePath = 'data/original/' + newFileName; //paths need to be relative to the bucket
    var s3StorageThumbPath = 'data/thumb/' + resizeImageName; //paths need to be relative to the bucket
    if (ownerId){
        var s3StoragePath = 'data/' + ownerId + '/original/' + newFileName; //paths need to be relative to the bucket
        var s3StorageThumbPath = 'data/' + ownerId + '/thumb/' + resizeImageName; //paths need to be relative to the bucket
    }

    //Ensure that directory has been created and upload Original File to normal directory
    fs.ensureDir(fullPath, function(err) {
        fs.move(
            req.files.image.path,
            fileStorageFullPath,
            function(error) {
                if(!error) {
                    //Upload Original file to S3
                    var s3 = new aws.S3();
                    var fileBuffer = fs.readFileSync(fileStorageFullPath);
                    var metaData = getContentTypeByFile(fileStorageFullPath);
                    s3.putObject({
                        ACL: 'public-read',
                        Bucket: awsBucket,
                        Key: s3StoragePath,
                        Body: fileBuffer,
                        ContentType: metaData
                    }, function(error, response) {
                        //remove the temp
                        fs.remove(req.files.image.path, function(err){
                            if (err) return console.error(err);
                        });
                        if (!error){
                            //resize the file
                            resizeImage(req, res, fileStorageFullPath, resizePath, fileStorageFullPathResized, s3StorageThumbPath, 200, function(){
                                //send the path to frontend
                                var fileUploadedObject = new Object();
                                fileUploadedObject.file_type = fileTypeExt;
                                fileUploadedObject.owner_id = ownerId;
                                fileUploadedObject.file_storage_page = fileStorageFullPath;
                                fileUploadedObject.file_storage_page_resized = fileStorageFullPathResized;
                                fileUploadedObject.cdn_storage_path =  awsDns+ '/' + awsBucket + '/' + s3StoragePath;
                                fileUploadedObject.cdn_storage_path_resized = awsDns + '/' + awsBucket + '/' + s3StorageThumbPath;
                                fileUploadedObject.release_path = fileStorageReleasePath;
                                fileUploadedObject.release_path_resized = fileStorageReleasePathResized;
                                res.json({
                                    RowsReturned : 1,
                                    Data : fileUploadedObject,
                                    Error : false,
                                    ErrorDesc : null,
                                    ErrorCode: null
                                });
                                return;
                            });
                        }else{
                            res.json({
                                RowsReturned : null,
                                Data : null,
                                Error : true,
                                ErrorDesc : error,
                                ErrorCode: 500
                            });
                            return;
                        }
                    });

                }else{
                    res.json({
                        RowsReturned : null,
                        Data : null,
                        Error : true,
                        ErrorDesc : error,
                        ErrorCode: 500
                    });
                    return;

                }
            }
        );
    })

}

exports.uploadImage = function(req, res, ownerId, maxSize, fileTypesPermitted){
    //checking file size
    fs.stat(req.files.image.path, function(err, stat) {
        if(err) {
            // handle error
            res.json({
                RowsReturned : null,
                Data : null,
                Error : true,
                ErrorDesc : error,
                ErrorCode: 500
            });
            return;
        }else{
            var fileSize = stat.size;
            if (fileSize > maxSize){
                // handle error
                res.json({
                    RowsReturned : null,
                    Data : null,
                    Error : true,
                    ErrorDesc : 'Image size exceeds, please choose a smaller file',
                    ErrorCode: 500
                });
            }else{
                //check extensions
                //get the extension name
                var fileTypeExt = path.extname(req.files.image.name);
                if(fileTypesPermitted){
                    var fileTypePermitted = false;
                    for (var ft = 0; ft < fileTypesPermitted.length; ft++){
                        if (fileTypeExt == fileTypesPermitted[ft]){
                            fileTypePermitted = true;
                        }
                    }
                    if (fileTypePermitted){
                        startImageUpload(req, res, ownerId);
                    }else{
                        res.json({
                            RowsReturned : null,
                            Data : null,
                            Error : true,
                            ErrorDesc : 'Image type not supported!',
                            ErrorCode: 500
                        });
                    }
                }else{
                    startImageUpload(req, res, ownerId);
                }
            }
        }
    });
}
