// The package for the web server
const express = require('express');
// Additional package for logging of HTTP requests/responses
const morgan = require('morgan');
const path = require('path');

const app = express();
// Get port from environment and store in Express.
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

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
    respond.render('index', { title: 'Simple Form' });
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
    userQ2 = userQ2 / q1Array.length;

    userQ3 = 0;
    for (let i of q3Array) {
        userQ3 += i;
    }
    userQ3 = userQ3 / q1Array.length;

    let currentTime = new Date();
    currentTime = currentTime.toString();
    submissionCount++;

    let stmt = db.run(`INSERT INTO User VALUES (${userFirstname}, ${userLastname}, ${userEmail}, ${currentTime}, ${userQ1}, ${userQ2}, ${userQ3}, ${userFavColour}, ${userComments})`);

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

app.get('/users', function (req, res) {
    let html = '';
    //HTML code to display multiple tables with DB data
        html += '<body><div class="container">';
        html += '<h3> Survey Information Table </h3>';
        html += '<table class="table">';
        html += '<thead class="thead-dark"><tr>';
        html += '<th>Name</th><th>Password</th><th>Option</th>';
        html += '<tr></thead><tbody>';

        // Retrieve data from table User on the server 
        // and display it in a web page table structure
        db.all('SELECT * FROM User', function (err, rows) {
            if (err) {
                return console.error(err.message);
            }
            if (rows.length === 0) {
                console.log("Array is empty!")
                html += '<tr><td colspan="3"> No data found </td></tr>';
            } else {
                rows.forEach(function (row) {
                    html += '<tr>';
                    html += '<td>' + row.userFirstname + '</td>';
                    html += '<td>' + row.userLastname + '</td>';
                    html += '<td>' + row.userEmail + '</td>';
                    html += '<td>' + row.currentTime + '</td>';
                    html += '<td>' + row.userQ1 + '</td>';
                    html += '<td>' + row.userQ2 + '</td>';
                    html += '<td>' + row.userQ3 + '</td>';
                    html += '<td>' + row.userFavColour + '</td>';
                    html += '<td>' + row.userComments + '</td></tr>';
                });
            }

            html += '</tbody></table>';
            html += '</div>';
            html += '</body></html>';
            res.send(html);

        });
});

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