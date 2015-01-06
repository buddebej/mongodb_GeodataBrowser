NodeJS based webservice, using a small Leaflet Map to browse spatial data in mongodb.

This application is just a prototype and still lacks some major features.

Clone repo, cd to the repo dir, install nodejs dependencies using npm:
```js
npm install 
```

Start mongodb daemon and run the application:
```js
node index.js <Database Host> <Name of Database>
```

Open gui in your webbrowser:
```
http://127.0.0.1:3000/
```

Browse your collections and plot your query results on a map.

![Screenshots](https://raw.github.com/buddebej/mongodb_GeodataBrowser/master/screenshots/gui_screenshot.png) 
