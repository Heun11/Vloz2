var express = require('express');
var path = require('path');
var fs = require('fs')
var app = express();

// const PORT = process.env.PORT || 3030;

// app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/pages'));

app.use(express.static(path.join(__dirname,'pages')))
app.use(express.static(path.join(__dirname,'css')));
app.use(express.static(path.join(__dirname,'js')));
app.use(express.static(path.join(__dirname,'resources')));

const files_folder = path.join(__dirname, 'files');

app.use('/', function(req, res, next){
    console.log("A new request received at " + Date.now());
    next();
 });

app.get('/', function(req, res){
    var files_arr = [];
    fs.readdir(files_folder, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        files.forEach(function (file) {
            files_arr.push(file);
        });
        res.render('home.html', {root: __dirname+'/pages', files:files_arr});
    });
});

app.get('/delete/:filename', function(req, res){
    res.end(req.params.filename);
});

app.get('/download/:filename', function(req, res){
    res.end(req.params.filename);
});

app.get('/upload/:filename', function(req, res){
    res.end(req.params.filename);
});

app.get('*', function(req, res){
    res.render('404.html', {root: __dirname+'/pages'});
});

// app.listen(PORT, () => {
//     console.log(`server started on port ${PORT}`);
// });
app.listen(8080);