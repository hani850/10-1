// The package for the web server
const express = require('express');
// Additional package for logging of HTTP requests/responses
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = 3000;

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('myDB');

// Include the logging for all requests
app.use(morgan('common'));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Tell our application to serve all the files under the `public_html` directory
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public_html'));


app.get('/result', (request, respond, next) => {
    respond.render('result', { title: 'Result' });
});

//default route handle for ejs template
app.get('/', (request, respond, next) => {
    respond.render('index', {title: 'Simple Form'});
});
//now: currentTime.toString() } 

var submissionCount = 0;
let q1Array = [0];
let q2Array = [0];
let q3Array = [0];

app.post('/submitsurvey', (req, res, next) => {
    console.log('Got a POST request');
    console.log(req.body); //moves body fields into terminal
    let userFirstname = req.body.firstname;
    let userLastname = req.body.surname;
    let userEmail = req.body.email;
    let userQ1 = parseInt(req.body.q1radio);
    q1Array.push(userQ1);
    let userQ2 = parseInt(req.body.q2radio);
    q2Array.push(userQ2);
    let userQ3 = parseInt(req.body.q3radio);
    q3Array.push(userQ3);
    let userFavColour = req.body.butterflyColour;
    let userComments = req.body.comments;

    userQ1 = 0;
    for (let i of q1Array) {
        userQ1 += i;
    }
    userQ1 = userQ1 / q1Array.length;

    userQ2 = 0;
    for (let i of q2Array) {
        userQ2 += i;
    }
    userQ2 = userQ2 /  q1Array.length;

    userQ3 = 0;
    for (let i of q3Array) {
        userQ3 += i;
    }
    userQ3 = userQ3 /  q1Array.length;

    let currentTime = new Date();
    currentTime = currentTime.toString();
    submissionCount++;

    db.run(`INSERT INTO User (id, fname, sname, email, date, q1, q2, q3, colour, comment) VALUES (serFirstname, userLastname, userEmail, currentTime, userQ1, userQ2, userQ3, userFavColour, useComments)`);
    res.render('result',
        {
            title: 'Results',
            SurveyCompleted: currentTime,
            firstname: userFirstname,
            surname: userLastname,
            email: userEmail,
            FavouriteButterflyColour: userFavColour,
            Comment: userComments,
        
            Count: submissionCount,
            Q1: userQ1,
            Q2: userQ2,
            Q3: userQ3,
        });
    //send back a response
    res.send('Thank you for submitting the form data');
});


db.serialize(function() {
    /*db.run("CREATE TABLE IF NOT EXISTS User (id INTEGER, fname TEXT, sname TEXT, email TEXT, date TEXT NOT NULL, q1 INTEGER, q2 INTEGER, q3 INTEGER, colour TEXT, comment TEXT)");
    db.run("DELETE FROM User");
    
    db.run(`INSERT INTO User (id, fname, sname, email, date, q1, q2, q3, colour, comment) VALUES ("Jason", "deakin2017", "1")`);
    */
   // NOTE: The order of the fields relates to the order of the Values provided
       
    
    // The SELECT operation is performed on the DB one row at a time and the function
    // is called for each row 'selected'
   
    console.log('Display all content from all rows of the DB');
    db.each("SELECT * FROM User", function(err, row) {
        console.log("[all] Name: " + row.fname + "  Lastname: " + row.sname + "  email: " + row.email); 
    });

    //id, fname, sname, email, date, q1, q2, q3, colour, comment
    // Or you can select 'specific' fields from a data row
   /*
   console.log('Display only the name and option fields from all rows of the DB');
    db.each("SELECT name, option FROM User", function(err, row) {
        console.log("[subset] Name: " + row.name + "  Option: " + row.option); 
    });
    */
});
db.close(); 


// ********************************************
// *** Other route/request handlers go here ***
//handle the 404 file not found error
app.use((request, response) => {
    response.status(404);
    response.render('404', { title: '404', message: '404 - Not Found', url: request.url });
});

// handle the 500 system error
app.use((error, request, response, next) => {
    let errorStatus = error.status || 500;
    response.status(errorStatus);
    response.send(`ERROR(${errorStatus}): ${error.toString()}`);
});

// ********************************************
// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, () => {
    // When the application starts, print to the console that our app is
    // running at http://localhost:3000. Print another message indicating
    // how to shut the server down.
    console.log(`Web server running at: http://localhost:${port}`);
    console.log(`Type Ctrl+C to shut down the web server`);
})