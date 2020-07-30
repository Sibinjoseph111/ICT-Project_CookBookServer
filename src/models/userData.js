const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var ObjectId = require('mongoose').Types.ObjectId;


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        access: {
          type: String,
          // required: true
        },
        token: {
          type: String,
          // required: true
        }
    }],
    favorites: [
        {
        id: String,
        name: String,
        steps: [],
        ingredients: [
            {
                quantity: String,
                name: String
            } 
        ],
        imageURL: String
        }
    ],
    shoppingList:[
        {
            name: String,
            quantity: String
        }
    ]
});


UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
  
    return _.pick(userObject, ['_id', 'email','username','tokens', 'favorites','shoppingList']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() =>{
        // console.log (token);
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
        tokens: {token}
        }
    });
};

UserSchema.statics.addFavorites = function (userId,recipe){
    return new Promise((resolve,reject)=>{
        UserModel.findById(userId).then((user)=>{
            var found = false;
            id = recipe._id;
            name = recipe.name;
            steps = recipe.steps;
            ingredients = recipe.ingredients;
            imageURL = recipe.imageURL;
    
            for(fav of user.favorites){
                // console.log(fav)
                if (fav.name == name) {
                    found = true;
                }
            }
    
            if(!found){
                user.favorites = user.favorites.concat([{id, name, steps, ingredients, imageURL}]);
                user.save().then((user)=>{
                    resolve(user);
                });
            }else{
                resolve('Recipe already added')
            }
        }).catch((err)=>{
            reject(`User not found ${err}`)
        })
    })
}

UserSchema.statics.removeFavorites = function(userId,name){

    return new Promise((resolve,reject)=>{

        // UserModel.findOneAndUpdate({_id: userId}, {
        //     $pull: {
        //         favorites: {id: recipeId}
        //     })


        UserModel.findById(userId).then((user)=>{

            user.updateOne({
                $pull: {
                    favorites: {name: name}
                }
            }).then((user)=>{
                resolve(user);
            }).catch((err)=>{
                reject(err);
            });

        });


    });

}

UserSchema.statics.addToList = function(id, items){

    return new Promise((resolve, reject)=>{

        UserModel.findById(id).then((user)=>{

            // console.log(user);

            for(item of items){
                console.log(item);
                user.shoppingList = user.shoppingList.concat([{name: item.name.toUpperCase(), quantity: item.quantity}])
            }

            user.save().then((user)=>{
                resolve(user);
            }).catch(err =>{
                reject(err);
            })
        }).catch(err=>{
            reject(err);
        })

    });
}

UserSchema.statics.removeFromList = function(id, itemId){

    return new Promise((resolve, reject)=>{
        UserModel.findById(id).then((user)=>{

            user.updateOne({
                $pull: {
                    shoppingList: {_id: itemId}
                }
            }).then((user)=>{
                resolve(user);
            }).catch((err)=>{
                reject(err);
            });

        });
    })

}

UserSchema.statics.updateList = function(id,item){

    return new Promise((resolve, reject)=>{    

        UserModel.findOneAndUpdate({"_id": id,"shoppingList._id": item._id},
            {$set: {"shoppingList.$.name":item.name,"shoppingList.$.quantity": item.quantity}}, 
            function(error, success) {
                if (error) reject(error)
        
                resolve(success)
            }
            )

    })

}

var UserModel = mongoose.model('user',UserSchema);


module.exports = {UserModel};