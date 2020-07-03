'user stric'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var twitterSchema = Schema({
    description : String
})

module.exports = moongose.model('twitter', twitterSchema)