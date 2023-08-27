var express = require('express');
var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
var multer = require('multer');
var app = express();
const db = require('better-sqlite3')('./files.db');
db.pragma('journal_mode = WAL');
let sql;

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

function create_files_table(){
    sql = "CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, filename ,time_of_creation, time_of_deletion)"
    db.prepare(sql).run();
}

function insert_to_files_table(filename, time_of_creation, time_of_deletion){
    sql = "INSERT INTO files(filename,time_of_creation, time_of_deletion) VALUES(?,?,?)";
    db.prepare(sql).run(filename, time_of_creation, time_of_deletion);
}

function update_file_from_files_table(filename, time_of_creation, time_of_deletion){
    sql = "UPDATE files SET time_of_creation=?, time_of_deletion=? WHERE filename=?";
    return db.prepare(sql).run(filename, time_of_creation, time_of_deletion);
}

function get_all_data_from_files_table(){
    sql = "SELECT * FROM files";
    return db.prepare(sql).all();
}

function get_data_about_file_from_files_table(filename){
    sql = "SELECT * FROM files WHERE filename=?";
    return db.prepare(sql).get(filename);
}

function file_exists_in_files_table(filename){
    sql = "SELECT * FROM files WHERE filename=?";
    var u = db.prepare(sql).get(filename);
    if(u){
        return true;
    }
    return false;
}

function delete_file_from_files_table(filename){
    if(file_exists_in_files_table(filename)){
        sql = "DELETE FROM files WHERE filename=?";
        db.prepare(sql).run(filename);
    }
    else{
        console.log("dont exist");
    }
}

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
        var f;
        files.forEach(function (file) {
            f = get_data_about_file_from_files_table(file);
            if(f.time_of_deletion<Date.now()){
                var filePath = path.join(files_folder, '/'+f.filename);
                fs.unlink(filePath, function (err) {
                    if (err){
                        res.end('neda sa vymazat');
                    }
                    else{
                        console.log('File deleted!');
                    }
                });
                delete_file_from_files_table(f.filename);
            }
            else{
                files_arr.push(f);
            }
        });

        res.render('home.html', {root: __dirname+'/pages', files:files_arr});
    });
});

app.post('/delete/:filename', function(req, res){
    var filePath = path.join(files_folder, '/'+req.params.filename);
    if(file_exists_in_files_table(req.params.filename)){
        delete_file_from_files_table(req.params.filename);
    }
    else{
        res.end("neexistuje v db");
    }
    fs.unlink(filePath, function (err) {
        if (err){
            res.end('neda sa vymazat');
        }
        else{
            console.log('File deleted!');
        }
    });
    res.redirect('/');
});

app.post('/download/:filename', function(req, res){
    // res.end(req.params.filename);
    var filePath = path.join(files_folder, '/'+req.params.filename);
    res.download(filePath);
});

app.post("/upload", upload.array('files'), (req, res) => {
    console.log(req.files, req.body.time_of_deletion);
    console.log('Files uploaded!');
    var time;
    if(!req.body.time_of_deletion || req.body.time_of_deletion<1){
        time = 0.0035;
    }
    else if(req.body.time_of_deletion>30){
        time = 30;
    }
    else{
        time = req.body.time_of_deletion;
    }
    req.files.forEach((file)=>{
        if(file_exists_in_files_table(file.originalname)){
            update_file_from_files_table(file.originalname,Date.now(), Date.now()+time*86400000);
        }
        else{
            insert_to_files_table(file.originalname, Date.now(), Date.now()+time*86400000);
        }
    });
    res.redirect('/');
});

app.get('*', function(req, res){
    res.render('404.html', {root: __dirname+'/pages'});
});


const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    create_files_table();

    // insert_to_file_table("test.txt", Date.now(), 2);
    // delete_file_from_files_table("test.txt");

    console.log(get_all_data_from_files_table());

    console.log(`server started on port ${PORT}`);
});