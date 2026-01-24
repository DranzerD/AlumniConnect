const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors())
app.use(express.json())
let client; 
let collection; 


MongoClient.connect("mongodb://localhost:27017/")
.then((connectedClient)=>{
    client = connectedClient;
    const dbo = client.db('Alumni')
    collection = dbo.collection('users')

    app.listen(port,()=>{
        console.log(`Server is running on http://localhost:${port}`);
    })
})
.catch((err)=>{
    console.log(err)
})


const findUser = async (username, password) => {
    const query = { username, password };
    try {
      const user = await collection.findOne(query);
      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  };
  

  app.get('/api/batches', async (req, res) => {
    try {
      const users = await collection.find({}).toArray();
      
      // Group users by graduation year
      const batchMap = users.reduce((acc, user) => {
        const batchKey = user.graduationYear;
        if (!acc[batchKey]) acc[batchKey] = [];
        acc[batchKey].push(user);
        return acc;
      }, {});
  
      // Transform batchMap to an array for rendering
      const batchArray = Object.entries(batchMap).map(([year, members]) => ({
        id: year, // Use the year as the ID
        years: year, // The year itself
        strength: members.length, // Count of members in that batch
        members: members, // Optionally include members
      }));
  
      res.status(200).json(batchArray.reverse()); // Most recent batches first
    } catch (error) {
      console.error('Error fetching batches:', error);
      res.status(500).send('Failed to fetch batches');
    }
  });
  
  app.get('/api/alumni/:batch', async (req, res) => {
    const { batch } = req.params;
    try {
      const alumni = await collection.find({ graduationYear: batch }).toArray();
      res.status(200).json(alumni);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      res.status(500).send('Failed to fetch alumni');
    }
  });
  
app.post('/save', async (req, res) => {
    const { username, password, email, graduationYear, institute, link } = req.body;
  
    const userDetails = {
      username,
      password,
      email,
      graduationYear,
      institute,
      link
    };
  
    try {
      console.log('Attempting to insert:', userDetails);
      const result = await collection.insertOne(userDetails);
      console.log('Insert result:', result); 
      res.status(200).send('Data saved successfully');
    } catch (err) {
      console.error('Error saving data:', err);
      res.status(500).send('Failed to save data');
    }
  });
  
  
  app.post('/signin', async (req, res) => {
    const { username, password, email, graduationYear } = req.body;

    try {
        const user = await findUser(username, password);
        console.log(user);

        if (!user) {
            return res.status(401).json({ message: 'Wrong username or password' });
        }
        res.status(200).json({ message: 'Login successful!', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


