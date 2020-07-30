const express = require('express');
const cors = require('cors');
const _ = require('lodash');

const mongoose = require('./src/models/mongoose');
const {UserModel} = require('./src/models/userData');
const RecipeModel = require('./src/models/recipeData');
const recipes = require('./public/recipes');

var app = new express();
app.use(cors());
app.use(express.json());
app.use((req, res, next)=>{

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'origin,x-auth,content-type,Accept,X-Requested-With,X-Content-Type-Options');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Expose-Headers','x-auth, content-type');

    next();
});

//Add recipes every time server runs

addRecipes = ()=>{
  var i=0;

    RecipeModel.deleteMany({}).then(()=>{
      for(recipe of recipes){
        var newRecipe = new RecipeModel(recipe)
        newRecipe.save().then((addedRecipe)=>{});
      }
    });
}

app.post('/user/login',(req,res)=>{
       
    UserModel.findOne({email: req.body.email.toLowerCase()}).then((user)=>{
        if(req.body.password == user.password){
            // res.send(user);
            
            if(user.tokens[0]){
                var tokens = user.tokens[0];
                var token = user.tokens[0].token;
                var access = user.tokens[0].access;
                return res.send(user);
              }
          
              return user.generateAuthToken().then((token) => {
                // console.log('new token'+token);
                res.send(user);
                });

        }else res.status(401).send('Email and password do not match');
    }).catch((err)=>{
        res.status(401).send('User not found');
    });
});

app.post('/user/signup',(req,res)=>{

    var data = _.pick(req.body,['username','email','password']);

    var user = new UserModel(data);
    user.email = user.email.toLowerCase();
    // user.save().then((user)=>{
    //     console.log(user);
    //     res.send(user);
    // },(err)=>{
    //     res.status(409).send('Email already exists');
    // }).catch((err)=>{
    //     res.status(400).send('Error adding user');
    // });

    user.save().then(() => {
        return user.generateAuthToken();
      }).then((token) => {
        res.send(user);
        console.log(token);
      }).catch((e) => {
        res.status(409).send('Email already exists' );
      });
});

app.get('/user/:id',(req,res)=>{

  UserModel.findById(req.params.id).then((user)=>{
    res.send(user);
  }).catch((err)=>{
    res.status(401).send(err);
  })
});

app.get('/recipes', (req,res)=>{

  RecipeModel.find({}).then((recipes)=>{

    if(recipes.length == 0) res.status(400).send('No recipes found');

    res.send(recipes);

  });

})

app.post('/user/addfavorites',(req,res)=>{

  // console.log()

  console.log(req.body.id,req.body.recipe);

  UserModel.addFavorites(req.body.id,req.body.recipe).then((data)=>{
    res.send(data);
  }).catch((err)=>{
    res.status(401).send()
  });
});

app.post('/user/removefavorites',(req,res)=>{
  
  UserModel.removeFavorites(req.body.id,req.body.name).then((user)=>{
    res.send(user);
  }).catch((err)=>{
    res.status(401).send(err);
  });

});

app.post('/user/addtolist',(req,res)=>{

  UserModel.addToList(req.body.id, req.body.items).then((data)=>{
    res.send(data);
  }).catch((err)=>{
    res.status(400).send(err);
  })
});

app.post('/user/removefromlist',(req,res)=>{

  UserModel.removeFromList(req.body.id, req.body.itemId).then((data)=>{
    res.send(data);
  }).catch(err=>{
    res.status(400).send(err);
  })
})

app.post('/user/updateList',(req,res)=>{

  UserModel.updateList(req.body.id, req.body.item).then((data)=>{
    res.send(data);
  }).catch(err=>{
    res.status(400).send(err);
  })

})

app.listen('3000',()=>{
    console.log('App started at port 3000')
    addRecipes();
});