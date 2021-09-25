const express = require('express');
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const app = express();
const path = require('path');
const Campground = require('../models/camground')


mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useUnifiedTopology: true })
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('Database connected')
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random100 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20 + 10)
        const camp = new Campground({
            // YOUR AUTHOR Id
            author: '610feb58d001b62168b3fe89',
            location: `${cities[random100].city}, ${cities[random100].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            description: 'HAHAHAHAHAHAAHAHAHSFHSDAHFSHDFSDFSDFSDFSDFSDFSDF',
            price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random100].longitude, cities[random100].latitude],

            },
            images: [
                {
                    _id: '61127b61f004741de0ca45a2',
                    url: 'https://res.cloudinary.com/dblxvc6nd/image/upload/v1628601184/YelpCamp/shldxye9bjlz6hiaer6s.jpg',
                    filename: 'YelpCamp/shldxye9bjlz6hiaer6s'
                },
                {
                    _id: '61127b61f004741de0ca45a2',
                    url: 'https://res.cloudinary.com/dblxvc6nd/image/upload/v1628601184/YelpCamp/shldxye9bjlz6hiaer6s.jpg',
                    filename: 'YelpCamp/shldxye9bjlz6hiaer6s'
                },
                {
                    _id: '61127b61f004741de0ca45a2',
                    url: 'https://res.cloudinary.com/dblxvc6nd/image/upload/v1628601184/YelpCamp/shldxye9bjlz6hiaer6s.jpg',
                    filename: 'YelpCamp/shldxye9bjlz6hiaer6s'
                }
            ]

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
