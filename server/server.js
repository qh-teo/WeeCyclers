const express = require('express');
const mysql = require('mysql');
const app = express();
var bodyParser = require('body-parser');
var methodOvereide = require('method-override');
var cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(methodOvereide());
const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8100'
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    }
}

//please change the credentials according to requirement
const db = mysql.createPool({
    connectionLimit: 100,
    host: '<HOST_URL>',
    user: '<DB_USER>',
    password: '<DB_PW>',
    database: '<DB_NAME>'
});

/**
 * Query to retrieve, store and update necessary fields
 */

app.options('*', cors(corsOptions));

app.get('/', cors(corsOptions), (req, res, next) => {
    res.json({ message: 'This route is CORS-enabled for an allowed origin.' });
})

// Tommy's code section
app.route('/getUserData', cors(corsOptions))
    .post(function (request, response) {

        // Get user data        
        let ProfileId = request.body.ProfileID;              
        db.query('SELECT profilename, profileaddress, profileemail, profilerole FROM profile WHERE profileid = ?', [ProfileId],
            function (error, result, fields) {
                if (!error) {
                    if (result.length > 0) {
                        // o1 = result;
                        response.send(result);
                    } else {
                        response.send(false + ": Something is wrong");
                    }
                } else {
                    console.log(error);
                    throw error
                }
            });
    })

app.route('/getProdData', cors(corsOptions))
    .post(function (request, response) {
        let PriceId = request.body.PriceID;
        db.query('SELECT * FROM payment_price WHERE id = ?', [PriceId],
            function (error, result, fields) {
                if (!error) {
                    if (result.length > 0) {                        
                        response.send(result);
                    } else {
                        response.send(false + ": Something is wrong");
                    }
                } else {
                    console.log(error);
                    throw error
                }
            });
    });

app.route('/updateUserData', cors(corsOptions))
    .post(function (request, response) {
        let ProfileId = request.body.ProfileId;
        let ProfileRole = request.body.ProfileRole;
        db.query('UPDATE profile SET profilerole=? WHERE profileid=?;'
            , [ProfileRole, ProfileId], function (error, result, fields) {
                if (!error) {
                    console.log(result);
                    response.send(result);
                } else {
                    console.log(error);
                    response.send(error);
                }
            });
    });

//QH Stuffs
app.route('/addBooking', cors(corsOptions)).post(function (request, response){
    var collectionDate = request.body.collectionDate;
    var collectionAddress = request.body.collectionAddress;
    var collectionPts = request.body.collectionPts;
    var collectionSTS = request.body.collectionSTS;
    var collectionCollector = request.body.collectionCollector;
    var collectionPostalCode = request.body.collectionPostalCode;
    var empe_id = request.body.empe_id;
    
    db.query('INSERT INTO collection (collectiondate,collectionaddress, collectionpt, collectionsts, collectioncollector, collectionpostal ) VALUES (?,?,?,?,?,?) ; ',
    [collectionDate, collectionAddress, collectionPts, collectionSTS, collectionCollector, collectionPostalCode], function(error,result, fields){
        if(!error){
             db.query('INSERT INTO collection_profile(collection,profile) values (?,?)  ; ',
                [result["insertId"], empe_id], function(error, result, fields){
                    if(!error){
                       console.log(result);
                       response.send(result);
                    }else{
                        console.log(error);
                        response.send(error);
                    }
                  
                });
            console.log(result);
            // response.send(result);
        } else {
            console.log(error);
          
        }
    });
});

app.route('/getBooking', cors(corsOptions)).post(function(request, response){
    var empe_id = request.body.empe_id;
    var collection_id = request.body.collection_id;
    //select  from collection_profile A inner join collection B on A.collection=B.collectionid where A.profile=1;
    db.query('select B.collectionid,B.collectiondate,B.collectionaddress, B.collectionpostal,B.collectionsts from collection_profile A inner join collection B on A.collection=B.collectionid where A.profile=? and A.collection=?'
    , [empe_id,collection_id], function(error,result, fields){
    // db.query('select * from collection where collectionid=?', [collectionid], function(error,result, fields){
        if(!error){
            console.log(result);
            // console.log(fields);
            // response.send(fields);
            response.send(result);
        }else{
            console.log(error);
            response.send(error);
        }
    });
});


app.route('/getBookingDetails', cors(corsOptions)).post(function(request, response){
    var empe_id = request.body.empe_id;
    //select  from collection_profile A inner join collection B on A.collection=B.collectionid where A.profile=1;
    db.query('select B.collectionid,B.collectiondate,B.collectionaddress, B.collectionpostal,B.collectionsts from collection_profile A inner join collection B on A.collection=B.collectionid where A.profile=? and B.collectionsts=0 order by B.collectiondate'
    , [empe_id], function(error,result, fields){
    // db.query('select * from collection where collectionid=?', [collectionid], function(error,result, fields){
        if(!error){
            console.log(result);
            // console.log(fields);
            // response.send(fields);
            response.send(result);
        }else{
            console.log(error);
            response.send(error);
        }
    });
});

app.route('/deleteBooking', cors(corsOptions)).post(function (request, response) {
    var empe_id = request.body.empe_id;
    var collectionid = request.body.collectionid;

    db.query('delete from collection_profile where collection=? and profile=?'
        , [collectionid, empe_id], function (error, result, fields) {
            if (!error) {
                db.query('delete from collection where collectionid=?',
                    [collectionid], function (error, result, fields) {
                        if (!error) {
                            response.send(result);
                        } else {
                            response.send(error);
                        }
                    });
                // console.log(result);
                // response.send(result);
            } else {
                // console.log(error);
                // response.send(error);
            }
        });
});

app.route('/updateBooking', cors(corsOptions)).post(function (request, response) {
    var collectionid = request.body.collectionid;
    var collectionaddress= request.body.collectionAddress;
    var collectiondate = request.body.collectionDate;
    var collectionpostal = request.body.collectionPostalCode;
    db.query('UPDATE collection SET collectionaddress=?, collectiondate=?, collectionpostal=? WHERE collectionid=?;'
    , [collectionaddress, collectiondate, collectionpostal, collectionid], function(error,result, fields){
        if(!error){
            console.log(result);
            response.send(result);
        }else{
            console.log(error);
            response.send(error);
        }
    });
});

app.route('/getBookingHistory', cors(corsOptions)).post(function(request, response){
    var empe_id = request.body.empe_id;
    //select  from collection_profile A inner join collection B on A.collection=B.collectionid where A.profile=1;
    db.query('select B.collectionid,B.collectiondate,B.collectionaddress, B.collectionpostal,B.collectionsts from collection_profile A inner join collection B on A.collection=B.collectionid where A.profile=? and B.collectionsts=1 order by B.collectiondate'
    , [empe_id], function(error,result, fields){
    // db.query('select * from collection where collectionid=?', [collectionid], function(error,result, fields){
        if(!error){
            console.log(result);
            // console.log(fields);
            // response.send(fields);
            response.send(result);
        }else{
            console.log(error);
            response.send(error);
        }
    });
});

app.route('/getBookingLocations', cors(corsOptions)).get(function (request, response) {
    db.query('select collectionLatLong from collection ;', function (error, result, field) {
        if (!error) {
            // console.log(result);
            // response.send(true);
            response.send(result);
        } else {
            // console.log(error);
            // response.send(false);
            response.send(error);
        }
    })
});


//Raj's code
app.route('/getSmartBins', cors(corsOptions)).get(function (request, response) {
    db.query('select * from smartbins;', function (error, result, field) {
        if (!error) {
            // console.log(result);
            // response.send(true);
            response.send(result);
        } else {
            // console.log(error);
            // response.send(false);
            response.send(error);
        }
    })
});

app.route('/addPoints', cors(corsOptions)).post(function (request, response){
    var points= request.body.points;
    var amtR = request.body.amtR;
    let sql = 'CALL ThrowRecyclable(?,?)'
    db.query(sql
    ,[points,amtR], function (error, result, field){
        if(!error){
            console.log(result);
            response.send(result);
        }else{
            console.log(error);
            response.send(error);
        }
    });
});

app.route('/clearBin', cors(corsOptions)).post(function (request, response){
    var points= request.body.points;
    let sql = 'CALL ClearBin(?)'
    db.query(sql
    ,[points], function (error, result, field){
        if(!error){
            console.log(result);
            response.send(result);
        }else{
            console.log(error);
            response.send(error);
        }
    });
});

app.route('/signup', cors(corsOptions)).post(function (request, response){
    var username= request.body.username;
    var password = request.body.password;
    db.query('INSERT Into profile (profilename,profilepassword) values (?,?);', [username,password], function (error, result, field){
        if(!error){
            console.log("Im here1");
            console.log(result);
            response.send(result);
        }else{
            console.log("Im here2");
            console.log(error);
            response.send(error);
        }
    });
});
app.route('/login', cors(corsOptions)).post(function (request, response){
    var username= request.body.username;
    var password = request.body.password;
    db.query('SELECT * FROM TeamBorat.profile WHERE profilename=? and profilepassword=?;', [username,password], function (error, result, field){
        if(!error){
            console.log("Im here1");
            console.log(result);
            response.send(result);
        }else{
            console.log("Im here2");
            console.log(error);
            response.send(error);
        }
    });
});
app.route('/getProfile', cors(corsOptions)).post(function(request, response){
    var profileId = request.body.profileId;
    //select  from collection_profile A inner join collection B on A.collection=B.collectionid where A.profile=1;
    db.query('Select * from TeamBorat.profile WHERE profileid=?'
    , [profileId], function(error,result, fields){
    // db.query('select * from collection where collectionid=?', [collectionid], function(error,result, fields){
        if(!error){
            console.log("Im here1");
            console.log(result);
            response.send(result);
        }else{
            console.log("Im here2");
            console.log(error);
            response.send(error);
        }
    });
});


 // Basic things to include
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
    console.log("listening to Port", app.get("port"));
});

// TEST DB CONNECTIONS ONLY ** KINDLY PLEASE COMMENT IT ONCE FINISH TESTING
// db.getConnection((err1) => {
//     console.log('Connecting mySQL....')
//     if (err1) {
//         throw err1;
//     }
//     console.log('mySQL connected....')
//     db.query('SELECT * FROM profile;', function (err2, result, field) {
//         if (!err2) {
//             console.log(result);
//         }
//         else {
//             console.log(err2)
//         }
//     });
//     db.query('SELECT profilename, profileaddress, profileemail FROM profile WHERE profileid = ? ;', 1, function (err2, result, field) {
//         if (!err2) {
//             console.log(result);
//         }
//         else {
//             console.log(err2)
//         }
//     });
// });