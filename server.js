/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Humaira Shaikh Student ID: 139877203 Date: 02//2023
*
*  Cyclic Web App URL: https://glamorous-girdle-mite.cyclic.app/
*
*  GitHub Repository URL: https://github.com/myacademic17/web322-app
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require("path");
var data_service = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2; 
const streamifier = require('streamifier'); 
var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/about", (req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/posts/add",(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/addPost.html"));
});

cloudinary.config({
    cloud_name: 'drjaaoyjm',
    api_key: '721356919734995',
    api_secret: 'nsBgIjNc-vy7XeSxI0l5JW1KzeA',
    secure: true
});

 const upload = multer(); // no { storage: storage } 

 app.get("/posts/add",upload.single("featureImage"), (req,res)=>{
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }
     
    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    } 
        
});

//adding more routes 

app.get("/blogs", (req,res)=>{
    data_service.getBlogs().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
    });
});

app.get("/posts",(req,res)=>{
    data_service.getAllPosts().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
    });
});

app.get("/categories",(req,res)=>{
    data_service.getCategories().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
    });
});

// Update the "/posts" route
app.get("/posts", (req, res) => {
    let postsList;
    if (req.query.category) {
      postsList = blogService.getPostsByCategory(req.query.category);
    } else if (req.query.minDate) {
      postsList = blogService.getPostsByMinDate(req.query.minDate);
    } else {
      postsList = blogService.getAllPosts();
    }
    res.json(postsList);
  });

  // Add the "/post/:value" route
app.get("/post/:value", (req, res) => {
    const postId = parseInt(req.params.value);
    const post = blogService.getPostById(postId);
    res.json(post);
  });


app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

blog_service.initialize().then(()=>{
    //listen on HTTP_PORT
    app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{
    console.log("Cannot open files.");
});