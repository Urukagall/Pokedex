const express = require("express");
const dbo = require("./db/db");
const app = express();
const port = 4444;
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(bodyParser.urlencoded({ extended: true }));

dbo.connectToServer();

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
app.get("/pokemon/list", function (req, res) {
  //on se connecte à la DB MongoDB
  const dbConnect = dbo.getDb();
  //premier test permettant de récupérer mes pokemons !
  dbConnect
    .collection("Pokemon")
    .find({}) // permet de filtrer les résultats
    /*.limit(50) // pourrait permettre de limiter le nombre de résultats */
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching pokemons!");
      } else {
        res.json(result);
      }
    });
});

app.post('/pokemon/insert', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', req.body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const type = dbConnect.collection("Type")
  
  type.findOne({type: body.type1}).then(function (result,err) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      const type1 = result
      poke.insertOne({name: body.name,type: [result]})
      res.json(result);
      if (body.type2 !== null) {
        type.findOne({type: body.type2}).then(function (result1,err1) {
          if (err1) {
            res.status(400).send("Error fetching pokemons!");
          } else {
            poke.replaceOne({name: body.name}, {name: body.name,type : [type1, result1]})
            res.json(result1);
          }
        });
      }
    }
  });
  
}); 


app.get('/pokemon/read', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const type = dbConnect.collection("Type")
  poke.findOne({name: body.name}).then(function (result,err) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      res.json(result);
    }
  });
}); 

app.post('/pokemon/update', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', req.body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const type = dbConnect.collection("Type")
  const options = { upsert: true };
  
  type.findOne({type: body.type1}).then(function (result,err) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      const type1 = result
      poke.updateOne({name: body.name}, {$set: {type: [result]}}, options)
      type.findOne({type: body.type2}).then(function (result1,err1) {
        if (err) {
          res.status(400).send("Error fetching pokemons!");
        } else {
          if (body.type2 !== null) {
            poke.updateOne({name: body.name}, {$set: {type: [type1,result1]}}, options)
          }
          res.json(result1);
        }
      });
    }
  });
}); 


app.delete('/pokemon/delete', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', req.body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const type = dbConnect.collection("Type")
  
  
  poke.deleteOne({name: body.name}).then(function (result,err) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      res.json(result);
    }
  });
});