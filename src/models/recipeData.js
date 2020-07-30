const mongoose = require('mongoose');

const RecipeSchema = mongoose.Schema({
    name: String,
    steps: [],
    ingredients: [
        {
            quantity: String,
            name: String
        } 
    ],
    imageURL: String
});

var RecipeModel = mongoose.model('Recipes',RecipeSchema);

module.exports = RecipeModel;