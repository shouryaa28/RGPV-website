const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  author:{
      type:mongoose.Schema.Types.ObjectId,ref:'user'
  },
  content:String,
  image:String,
  likes:[{
      type:mongoose.Schema.Types.ObjectId,ref:'user'
  }],
  report:[{
      type:mongoose.Schema.Types.ObjectId,ref:'user'
  }]
});


module.exports = mongoose.model('post',postSchema);