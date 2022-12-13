var cors = require('cors')

const express = require("express");
const dbo = require("./db/db");
const app = express();
const port = 4444;
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(cors())

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

// Fonction de création de poukemoun

app.post('/pokemon/create', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', req.body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const type = dbConnect.collection("Type")
  
  //cherche le type 1 dans le bibliothèque des Type

  type.findOne({type: body.type1}).then(function (result,err) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      const type1 = result
      //rajoute le type1
      poke.insertOne({name: body.name,img: body.img,type: [result]})
      //vérifie si il y a un type2 a rajouter
      if (body.type2 != null) {
        //cherche le type 2 dans le bibliothèque des Type
        type.findOne({type: body.type2}).then(function (result1,err1) {
          if (err1) {
            res.status(400).send("Error fetching pokemons!");
          } else {
            //rajoute le type2
            poke.replaceOne({name: body.name}, {name: body.name,img: body.img,type : [type1, result1]})
            res.json(body);
          }
        });
      } else{
        res.json(body);
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
  const pokedex = dbConnect.collection("Pokedex")
  const type = dbConnect.collection("Type")
  const options = { upsert: true };
  type.findOne({type: body.type1}).then(function (result,err) {
    if (result == null) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      const type1 = result
      poke.updateOne({name: body.name}, {$set: {type: [result]}})
      pokedex.updateOne({name: body.name}, {$set: {type: [result]}})
      if (body.type2 != null) {
        type.findOne({type: body.type2}).then(function (result1,err1) {
          if (err) {
            res.status(400).send("Error fetching pokemons!");
          } else {
            poke.updateOne({name: body.name}, {$set: {type: [type1,result1]}})
            pokedex.updateOne({name: body.name}, {$set: {type: [type1,result1]}})
            res.json(body);
          }
        });
      } else {
        res.json(body);
      }
    }
  });
  if (body.img != null) {
    poke.updateOne({name: body.name}, {$set: {img: body.img}})
    pokedex.updateOne({name: body.name}, {$set: {img: body.img}})
  }
  if (body.newname != null) {
    poke.updateOne({name: body.name}, {$set: {name: body.newname}})
    pokedex.updateOne({name: body.name}, {$set: {name: body.newname}})
  }
}); 


app.delete('/pokemon/delete', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', req.body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const pokedex = dbConnect.collection("Pokedex")
  const type = dbConnect.collection("Type")
  
  
  poke.deleteOne({name: body.name}).then(function (result,err) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      res.json(result);
      pokedex.deleteOne({name: body.name}).then(function (result1,err1) {
        if (err) {
          res.status(400).send("Error fetching pokemons!");
        }
      });
    }
  });
});

app.get("/pokemon/listtype?type=", function (req, res) {
  //on se connecte à la DB MongoDB
  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  //premier test permettant de récupérer mes pokemons !
  dbConnect
    .collection("Pokemon")

    .find({"type.type":req.query.type}) // permet de filtrer les résultats
    /*.limit(50) // pourrait permettre de limiter le nombre de résultats */
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching pokemons!");
      } else {
        res.json(result, type);
      }
    });
});

app.post('/pokedex/insert', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', req.body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const pokedex = dbConnect.collection("Pokedex")
  const type = dbConnect.collection("Type")
  
  poke.findOne({name: body.name}).then(function (result,err) {
    pokedex.findOne({name: body.name}).then(function (result1,err1) {
    if (result1 == null) {
      pokedex.insertOne(result)
      res.json(result);
    }
    });
  });

  
}); 



app.get("/pokedex/list", function (req, res) {
  //on se connecte à la DB MongoDB
  const dbConnect = dbo.getDb();
  //premier test permettant de récupérer mes pokemons !
  dbConnect
    .collection("Pokedex")
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

app.delete('/pokedex/delete', jsonParser, (req, res) => {
  const body = req.body;
  console.log('Got body:', req.body);

  const dbConnect = dbo.getDb();

  const poke = dbConnect.collection("Pokemon")
  const pokedex = dbConnect.collection("Pokedex")
  const type = dbConnect.collection("Type")
  
  
  pokedex.deleteOne({name: body.name}).then(function (result,err) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      res.json(result);
    }
  });
});