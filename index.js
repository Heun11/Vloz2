var express = require('express');
var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
var multer = require('multer');
var app = express();

// app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/pages'));

app.use(express.static(path.join(__dirname,'pages')))
app.use(express.static(path.join(__dirname,'css')));
app.use(express.static(path.join(__dirname,'js')));
app.use(express.static(path.join(__dirname,'resources')));

const files_folder = path.join(__dirname, 'files');

var fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, files_folder);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
var upload = multer({storage:fileStorageEngine});

app.use('/', function(req, res, next){
    console.log("A new request received at " + Date.now());
    next();
 });

app.get('/', function(req, res){
    var files_arr = [];
    fs.readdir(files_folder, function (err, files) {
        if (err) {
            console.log('Unable to scan directory: ' + err);
        } 
        files.forEach(function (file) {
            files_arr.push(file);
        });
        res.render('home.html', {root: __dirname+'/pages', files:files_arr});
    });
});

app.get('/delete/:filename', function(req, res){
    var filePath = path.join(files_folder, '/'+req.params.filename);
    fs.unlink(filePath, function (err) {
        if (err){
            res.end('neda sa vymazat');
        }
        else{
            console.log('File deleted!');
            res.redirect('/');
        }
    }); 
});

app.get('/download/:filename', function(req, res){
    // res.end(req.params.filename);
    var filePath = path.join(files_folder, '/'+req.params.filename);
    res.download(filePath);
});

app.post("/upload", upload.array('files'), (req, res) => {
    console.log(req.files);
    console.log('Files uploaded!');
    res.redirect('/');
});

app.get('*', function(req, res){
    res.render('404.html', {root: __dirname+'/pages'});
});


const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});