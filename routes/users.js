const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/chorbazar');

const userSchema = mongoose.Schema({
  name:String,
  username:String,
  email:String,
  password:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,ref:'post'
  }],
  collegename:String
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);