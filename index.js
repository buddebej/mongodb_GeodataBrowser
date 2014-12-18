var
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'), // open local template file
    mustache = require('mustache'), // map template
    MongoClient = require('mongodb').MongoClient, // database driver

    // database settings
    database = {
        host: 'mongodb://localhost:27017/',
        name: ''
    },

    dbCollection,
    dbQuery = {},
    dbCollectionList = [],

    mapState = {
        center: [54.153, 12.09],
        zoom: 13
    },
    mapLayers = [],

    getGeoJson = function(docs) {
        return '{"type": "FeatureCollection","features":' + JSON.stringify(docs) + '}';
    },

    updateViewer = function(db, res) {
        queryDB(db, function(docs) {
            var templateData = {
                dbName: database.host + database.name,
                dbObjects: getGeoJson(docs),
                dbCollectionList: dbCollectionList,
                dbCollection: dbCollection,
                mapStateCenter: mapState.center,
                mapStateZoom: mapState.zoom,
                mapLayers: mapLayers
            };
            mapLayers.push(templateData.dbObjects);
            var page = fs.readFileSync("template/index.html", "utf8");
            var html = mustache.to_html(page.toString(), templateData);
            res.send(html);
        });

    },

    startServer = function(db) {
        // create application/x-www-form-urlencoded parser
        var urlencodedParser = bodyParser.urlencoded({
            extended: false
        });

        app.post('/query', urlencodedParser, function(req, res) {
            if (!req.body)
                return res.sendStatus(400);
            dbQuery = JSON.parse(req.body.queryString);
            dbCollection = req.body.queryCollection;
            mapState.zoom = req.body.queryMapStateZoom;
            mapState.center = [req.body.queryMapStateCenter];
            updateViewer(db, res);
            console.log("Query and add layer.\n");                        
        });

        app.post('/deleteLayers', urlencodedParser, function(req, res) {
            if (!req.body)
                return res.sendStatus(400);
            mapLayers = [];
            dbCollection = dbCollectionList[0];
            updateViewer(db, res);
            console.log("Reset application.\n");            
        });


        app.get('/', function(req, res) {
            updateViewer(db, res);
            console.log("Update viewer.\n");
        });

        app.use(express.static(__dirname + '/template'));
        app.listen(3000);
        console.log('Server running at http://127.0.0.1:3000/');
    },

    queryDB = function(db, callback) {
        var collection = db.collection(dbCollection);
        collection.find(dbQuery).toArray(function(err, docs) {
            callback(docs);
        });
    };


// check for db name in execution arguments
if (process.argv[2] === undefined) {
    process.exit(1);
} else {
    database.name = process.argv[2];

    // connect to db
    MongoClient.connect(database.host + database.name, function(err, db) {
        console.log("Database connection established.\nDatabase: " + database.name+"\n");

        // read all available collections
        db.collections(function(err, collections) {
            for (var m = 0; m < collections.length; m++)
                if (collections[m].s.name != "system.indexes")
                    dbCollectionList.push("'" + collections[m].s.name + "'");
            if (dbCollection === undefined)
                dbCollection = dbCollectionList[0];
        });

        // launch webserver
        startServer(db);
    });

}
