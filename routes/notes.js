const express = require('express')
const router = express.Router()

const {getAllNotes, createNote, noteEntry, editNote, updateNote, deleteNote} = require('../controllers/notes')


router.route("/").get(getAllNotes, noteEntry).post(createNote)

router.route("/create").get(noteEntry)

router.route("/:id").get(editNote,).post(updateNote).delete(deleteNote)

module.exports = router
