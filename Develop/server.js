const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const PORT = 3000;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// GET route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET route for notes API
app.get('/api/notes', (req, res) => {
  let notes = JSON.parse(fs.readFileSync('./db/db.json')); 
  res.json(notes);
  console.log('GET NOTES!');
});

// GET route for homepage
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// POST request to add a note
app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

   // Destructuring assignment for the items in req.body
   const { title, text } = req.body;

   // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };
 
    readAndAppend(newNote, './db/db.json');

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting review');
  }

  // Log the response body to the console
  console.log(req.body);
});

// DELETE request to delete a note
app.delete('/api/notes/:id', (req, res) => {
  let notes = fs.readFileSync("./db/db.json", "utf8");
  const parsedNotes = JSON.parse(notes);
  const filteredNotes = parsedNotes.filter((note) => {
    return note.id !== req.params.id;
  });

  fs.writeFile("./db/db.json", JSON.stringify(filteredNotes),(err, text) => {
      if (err) {
        console.error(err);
        return;
      }
    });

  res.json(filteredNotes)
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);

