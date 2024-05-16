const express=require('express');
const fs = require('fs');
const session = require('express-session');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const path=require('path');

// port is at the end of this file 

const app=express();

// set it so it uses ejs
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public')); // to use the images and css from the public folder

app.use(session({
    secret: 'your-secret-key',
    resave: false, // when false : prevents unnecessary session updates
    saveUninitialized: false
}));

app.get('/giveaway', (req,res) =>{
    if(req.session.loggedIn){
        res.render('giveaway', { username: req.session.username, loggedIn: req.session.loggedIn });
    }else {
        res.render('login', { message: '' , loggedIn: req.session.loggedIn });
    }
})

app.post('/giveaway', (req,res)=>{
    const species = req.body['pet-type'];

    const breedOptions = {
        '1':'Breed 1',
        '2':'Breed 2',
        '3':'Breed 3',
        '4':'Breed 4',
        '5':'Breed 5',
        '6':'Mix breed'
    };
    const breed = breedOptions[req.body.breed];

    const age = req.body.age;
    const gender = req.body.gender;
    const alongDog = req.body['along-dog'];
    const alongCat = req.body['along-cat'];
    const alongChild = req.body['along-child'];
    const comment = req.body.bragging;
    const ownerName = req.body['owner-name'];
    const email=req.body.email;
    const username = req.session.username;

    let lineCount;
    try {
        const data = fs.readFileSync('petInfo.txt', 'utf8');
        
        // Split the data by newline characters and count the lines
        lineCount = data.split('\n').length;
        
    } catch (err) {
        lineCount = 0
    }

    const newData=`${lineCount}:${username}:${species}:${breed}:${age}:${gender}:${alongDog}:${alongCat}:${alongChild}:${comment}:${ownerName}:${email}\n`;
    fs.appendFile('petInfo.txt', newData, (err)=>{
        if(err){
            return res.status(500).send("Error submitting giveaway form.");
        }
        res.render('giveawayDone', { loggedIn: req.session.loggedIn });
    });
});

app.post('/findDog', (req, res) => {
    const species = 'Dog';

    const breedOptions = {
        '1':'Breed 1',
        '2':'Breed 2',
        '3':'Breed 3',
        '4':'Breed 4',
        '5':'Breed 5',
        '6':"Doesn't matter"
    };
    const breed = breedOptions[req.body.breed];

    const age = req.body.age;
    const gender = req.body.gender;
    const alongDog = req.body['along-dog'];
    const alongCat = req.body['along-cat'];
    const alongChild = req.body['along-child'];

    fs.readFile('petInfo.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading petInfo.txt:', err);
            return res.status(500).send("Error retrieving pet information.");
        }

        const lines = data.split('\n').filter(line => line.trim() !== ''); // get the lines 
        const records = lines.map(line => line.split(':')); // seperate the info in the line
        const matchingRecords = records.filter(record => {
            const [counter, username, recordSpecies, recordBreed, recordAge, recordGender, recordAlongDog, recordAlongCat, recordAlongChild] = record;
            
            console.log(counter);
            console.log(species);
            console.log(breed);
            console.log(age );
            console.log(gender); 
            console.log(recordAlongDog === alongDog); 
            console.log(recordAlongCat === alongCat); 
            console.log(recordAlongChild === alongChild);
            console.log();

            return (
                (recordSpecies === species) &&
                (breed === "Doesn't matter" || breed === recordBreed) &&
                (age === "Doesn't matter" || age === recordAge) &&
                (gender === "Doesn't matter" || recordGender === gender) &&
                (recordAlongDog === alongDog) &&
                (recordAlongCat === alongCat) &&
                (recordAlongChild === alongChild)
            );
        });

        // response to client 
        res.render('animalFound', { matchingRecords , loggedIn: req.session.loggedIn }); // returns if found a matching record, thaat will change the output on findResults
    });
        
    });

app.post('/findCat', (req, res) => {
    const species = 'Cat';

    // this is not necessary to do but its fine
    const breedOptions = {
        '1':'Breed 1',
        '2':'Breed 2',
        '3':'Breed 3',
        '4':'Breed 4',
        '5':'Breed 5',
        '6':'Doesn\'t matter'
    };
    const breed = breedOptions[req.body.breed];

    const age = req.body.age;
    const gender = req.body.gender;
    const alongDog = req.body['along-dog'];
    const alongCat = req.body['along-cat'];
    const alongChild = req.body['along-child'];

    fs.readFile('petInfo.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading petInfo.txt:', err);
            return res.status(500).send("Error retrieving pet information.");
        }

        const lines = data.split('\n').filter(line => line.trim() !== ''); // get the lines 
        const records = lines.map(line => line.split(':')); // seperate the info in the line
        const matchingRecords = records.filter(record => {
            const [counter, username, recordSpecies, recordBreed, recordAge, recordGender, recordAlongDog, recordAlongCat, recordAlongChild] = record;

            return (
                (recordSpecies === species) &&
                (breed === "Doesn't matter" || breed === recordBreed) &&
                (age === "Doesn't matter" || age === recordAge) &&
                (gender === "Doesn't matter" || recordGender === gender) &&
                (recordAlongDog === alongDog) &&
                (recordAlongCat === alongCat) &&
                (recordAlongChild === alongChild)
            );
        });

        // response to client 
        res.render('animalFound', { matchingRecords , loggedIn: req.session.loggedIn }); // returns if found a matching record, thaat will change the output on findResults
    });
});


app.post('/create-account', (req, res) => {
    const { username, password } = req.body;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        return res.render('createAccount', { message1: 'Username can only contain letters (both upper and lower case) and digits.', message2: '', loggedIn: req.session.loggedIn });
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
    if (!passwordRegex.test(password)) {
        return res.render('createAccount', { message1: '',message2: 'Password must be at least 4 characters long and contain at least one letter and one digit.' , loggedIn: req.session.loggedIn });
    }
    fs.readFile('login.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading login data.');
        }
        const existingUsers = data.split('\n').map(line => line.split(':')[0]);
        if (existingUsers.includes(username)) {
            return res.render('createAccount', { message1: 'Username already exists. Please choose a different username.', 
                                                message2: '', 
                                                loggedIn: req.session.loggedIn });
        }
        const newUserLine = `${username}:${password}\n`;

        fs.appendFile('login.txt', newUserLine, err => {
            if (err) {
                return res.status(500).send('Error creating account.');
            }
            res.redirect('/registerSuccess');
        });
    });
});

// to log in 
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    let loggedIn = false;

    const users = fs.readFileSync('login.txt', 'utf8').split('\n');

    for (let i = 0; i < users.length; i++) {
        const [storedUsername, storedPassword] = users[i].split(':');
        if (username === storedUsername && password === storedPassword) {
            loggedIn = true;
            req.session.username = username;
            req.session.loggedIn = true;
            break;
        }
    }
    if (loggedIn) {
        res.redirect('/giveaway');
    } else {
        res.render('login', { message: 'Invalid username or password.' , loggedIn: req.session.loggedIn });
    }
});

// to log out
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/logoutConfirmation');
    });
});


// to call each pages 
app.get('/home', (req, res)=>{
    res.render('home', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>',
        loggedIn: req.session.loggedIn 
    });
});


app.get('/find',(req,res)=>{
    res.render('find', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>', 
        loggedIn: req.session.loggedIn 
    });
});

app.get('/dogForm', (req,res) => {
    res.render('dogForm', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>', 
        loggedIn: req.session.loggedIn 
    });
})

app.get('/catForm', (req,res) => {
    res.render('catForm', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>',
        loggedIn: req.session.loggedIn 
    });
})

app.get('/catcare',(req,res)=>{
    res.render('catcare', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>', 
        loggedIn: req.session.loggedIn 
    });
});

app.get('/dogcare',(req,res)=>{
    res.render('dogcare', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>',
        loggedIn: req.session.loggedIn 
    });
});

app.get('/giveaway', (req, res) => {
    if (req.session.loggedIn)
        res.render('login', { message: '' , loggedIn: req.session.loggedIn });
});

app.get('/giveaway',(req,res)=>{
    res.render('giveaway', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>',
        loggedIn: req.session.loggedIn 
    });
});

app.get('/createAccount',(req,res)=>{
    res.render('createAccount', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>',
        message1: '',
        message2: '', 
        loggedIn: req.session.loggedIn 
    });
});

app.get('/registerSuccess', (req,res) => {
    res.render('registerSuccess', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>', 
        loggedIn: req.session.loggedIn 
    })
});

app.get('/contactus', (req,res)=>{
    res.render('contactus', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>', 
        loggedIn: req.session.loggedIn 
    });
});

app.get('/statement', (req,res) =>{
    res.render('statement', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>', 
        loggedIn: req.session.loggedIn 
    })
})

app.get('/logoutConfirmation', (req,res) =>{
    res.render('logoutConfirmation', {
        header: '<%- include(header.ejs) %>',
        footer: '<%- include(footer.ejs) %>', 
        loggedIn: req.session.loggedIn 
    })
})

app.get('/', (req,res)=>{
    req.session.loggedIn = false; // start not connected 
    res.render('home', {loggedIn: req.session.loggedIn});
});

// change the port here !
const port=5007; 
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});