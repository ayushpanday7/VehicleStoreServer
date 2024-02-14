const user = {
    username: {
        type: String,
        unique: true,
    },
    password: String,
    coin: {
        type: Number,
        default: 0,
    }
}
const shop = {
    carID: Number,
    carName: String,
    carIMG: String,
    carPrise: Number,
}
const admin = {
    coinRate: Number,
    coinBase: Number,
}
const adminHistory = {
    title: String,
    description: String,
}
module.exports = { user, shop, admin, adminHistory };