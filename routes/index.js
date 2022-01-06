const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const localstrategy = require('passport-local');
const userModel = require('./users');
const postModel = require('./post')

passport.use(new localstrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage })

router.get('/', function(req, res) {
  postModel.find()
  .populate('author')
  .then(function(foundPosts){
    res.render('index',{foundPosts});
  })
});

router.get('/login',function(req,res){
  res.render('login')
});

router.get('/register',function(req,res){
  res.render('register')
});

router.post('/register',function(req,res){
  var newUser = new userModel({
    username:req.body.username,
    email:req.body.email
  })
  userModel.register(newUser,req.body.password)
  .then(function(createdUser){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile')
    })
  });
});

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res,next){})


router.get('/profile',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate('posts')
  .then(function(foundUser){
    res.render('profile',{foundUser})
  })
})

router.post('/create',isLoggedIn,upload.single('image'),async function(req,res){
  let foundUser = await userModel.findOne({username:req.session.passport.user})
  let createdPost;
  if(req.file){
    createdPost = await postModel.create({
      author:foundUser._id,
      content:req.body.content,
      image:req.file.filename 
    })
  }
  else{
    createdPost = await postModel.create({
      author:foundUser._id,
      content:req.body.content 
    })
  }
  foundUser.posts.push(createdPost)
  foundUser.save()
  res.redirect('/profile')
})

router.get('/posts/:collegename',isLoggedIn,async function(req,res){
  let reg = new RegExp(`${req.params.collegename}`,'i');
  let data = await postModel.find({content:reg})
  .populate('author')
  res.render('index',{foundPosts:data});
})

router.get('/like/post/:id',isLoggedIn,async function(req,res){
  let user = await userModel.findOne({username:req.session.passport.user});
  let post = await postModel.findOne({_id:req.params.id});
  if(post.likes.indexOf(user._id) === -1)
    post.likes.push(user._id)
  else{
    var index = post.likes.indexOf(user._id)
    post.likes.splice(index,1)
  }
  post.save()
  res.redirect(req.headers.referer)
})

router.get('/report/post/:id',isLoggedIn,async function(req,res){
  let user = await userModel.findOne({username:req.session.passport.user});
  let post = await postModel.findOne({_id:req.params.id});
  post.report.push(user._id)
  post.save()
  res.redirect(req.headers.referer)
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated())
  return next()
  else
  res.redirect('/')
}

router.get('/logout',function(req,res,next){
  req.logOut()
  res.redirect('/')
})

module.exports = router;
