// importing required liberarys
const express = require('express');
const database = require('mongoose');
const bodyparser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { user, shop, admin, adminHistory } = require('./schema');


// setting database connection
database.connect('mongodb://localhost:27017/ayushproject');
database.connection.on('error', console.error.bind(console, 'error occorred'))
database.connection.once('open', function () { console.log('connected to db') });

// Building Schemas with model
const userSchema = database.Schema(user);
const userModel = database.model('UsersData', userSchema);

const shopSchema = database.Schema(shop);
const shopModel = database.model('shop', shopSchema);

const adminSchema = database.Schema(admin);
const adminModel = database.model('admin', adminSchema);
const adminHistorySchema = database.Schema(adminHistory);
const adminHistoryModel = database.model('adminHistory', adminHistorySchema);


// setting applications
const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'build','index.html'))
})
app.get('/Shop', (req, res) => {
    res.sendFile(path.join(__dirname,'build','index.html'))
})
app.get('/Login', (req, res) => {
    res.sendFile(path.join(__dirname,'build','index.html'))
})
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname,'build','index.html'))
})
app.get('/Admin', (req, res) => {
    res.sendFile(path.join(__dirname,'build','index.html'))
})

// login user
app.post('/login', async (req, res) => {
    console.log(req.body);
    await userModel.findOne(req.body).then((items) => {
        if (items) {
            let connection = database.createConnection(`mongodb://localhost:27017/${req.body.username}`);
            let shopSchema = database.Schema(shop);
            let getCarBuyed = connection.model('cars', shopSchema);
            getCarBuyed.find({}).then((caritems) => {
                if (caritems) {
                    let admineHD = adminHistoryModel({ title: `user logined`, description: 'user logined with credintial' })
                    admineHD.save();
                    res.json({ code: 1, coin: items.coin.toFixed(2), car: caritems });
                }
                else {
                    let admineHD = adminHistoryModel({ title: `user logined`, description: 'user reject to login' })
                    admineHD.save();
                    res.json({ code: 1, coin: items.coin.toFixed(2), car: [] });
                }
            })
        }
        else {
            res.json({
                code: 0,
                error: 'user does not exist'
            })
        }
    }).catch((error) => {
        console.log(error);
    });
})


// register new user
app.post('/register', (req, res) => {
    console.log(req.body);
    let createNewUser = userModel({ username: req.body.username, password: req.body.password, coin: 0 });
    createNewUser.save().then(() => {
        let admineHD = adminHistoryModel({ title: `user Registered`, description: 'Registered new user' })
        admineHD.save();
        res.json({ code: 1, coin: 0 })
    })
        .catch((error) => {
            res.json({ code: 0, error: 'user already exist' })
        });
})


app.post('/addCars', (req, res) => {
    console.log('Data: ', req.body)
    let addItemToShop = shopModel(req.body);
    addItemToShop.save().then(() => {
        res.json({ code: 1 });
    }).catch((error) => {
        res.json(error);
    });
})
app.get('/GetCars', (req, res) => {
    shopModel.find().then((item) => {
        console.log(item);
        res.json(item);
    }).catch((error) => {
        console.log(error);
        res.json(error);
    });
})

app.post('/BuyCar', async (req, res) => {
    const requestData = req.body;
    console.log('requestData: \n', requestData);

    let connection = database.createConnection(`mongodb://localhost:27017/${req.body.username}`);
    let shopSchema = database.Schema(shop);
    let saveBuy = connection.model('cars', shopSchema);
    let saveData = saveBuy({
        carID: requestData.carID,
        carName: requestData.carName,
        carIMG: requestData.carIMG,
        carPrice: requestData.carPrice
    })
    await saveData.save().then(() => {
        let admineHD = adminHistoryModel({ title: `user purchased`, description: 'user purchase car' })
        admineHD.save();
        console.log('saved');
    }).catch((error) => {
        console.log(error);
    })
    saveBuy.find({}).then((data) => {
        res.json(data);
        userModel.updateOne({ username: req.body.username }, { $inc: { coin: -requestData.carPrise } }).then((error, document) => {
        })
    }).catch((error) => {
        console.log(error)
    })
})
app.post('/BuyCoin', async (req, res) => {
    let coin;
    console.log(req.body);
    await userModel.findOne({ username: req.body.username }).then((items) => {
        if (items) {
            let admineHD = adminHistoryModel({ title: `user purchased`, description: 'user purchase coin' })
            admineHD.save();
            coin = items.coin;
            console.log(coin);
        }
        else {
            console.log('error');
        }
    }).catch((error) => {
        console.log(error);
    });
    res.json({ coin: coin.toFixed(2) });

    adminModel.updateOne({}, { $inc: { coinRate: 0.005 } }).then((error, document) => {
    })
})
app.get('/getCoinPrise', (req, res) => {
    console.log('user');
    adminModel.findOne({}).then((item) => {
        console.log(item);
        res.json({ cr: item.coinRate - 1 });
    })
})
app.get('/AdminData', async (req, res) => {
    let cr;
    let history = [];
    await adminModel.findOne({}).then((item) => {
        console.log(item);
        cr = item.coinRate;
    })
    await adminHistoryModel.find({}).then((item)=>{
        history = item
    })
    res.json({cr:cr.toFixed(2),curdData:history});
})
app.listen(80, () => {
    console.log('listning');
})