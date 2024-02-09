    const Note = require('../models/Notes')
    const {StatusCodes} = require('http-status-codes')
    const { NotFoundError } = require('../errors/notFound')

    const getAllNotes = async (req, res) => {
        const notes = await Note.find({ createdBy:req.user.userId }).sort('createdAt')
        res.status(StatusCodes.OK).render("notes", { notes, csrfToken: req.csrfToken() });
    }

    const createNote = async (req, res) => {
        req.body.createdBy = req.user.userId
        console.log('Creating Note:', req.body);
        const note = await Note.create(req.body);
        res.redirect("/notes");
    }

    const noteEntry = async (req, res) => {
        const { noteId } = req.params;
        if (noteId) {
            const note = await Note.findById(noteId);
            if (!note || note.createdBy.toString() !== req.user.userId) {
                throw new NotFoundError(`No note found for editing`);
            }
            res.render('note', { note, action: `/notes/update/${noteId}`, csrfToken: req.csrfToken() });
        } else {
            res.render('note', { note: null, action: '/notes', csrfToken: req.csrfToken() });
        }
    };

    const editNote = async (req, res) => {
        const {
            user: { userId },
            params: { id: noteId }
        } = req;

        const note = await Note.findById(noteId);

        if (!note || note.createdBy.toString() !== userId) {
            throw new NotFoundError(`No note found for editing`);
        }

        res.render("note", { note, action: `/notes/update/${noteId}`, csrfToken: req.csrfToken() });
    }

    const updateNote = async (req, res) =>{
        const {
            user: { userId },
            params: { id: noteId },
            body
        } = req;
        console.log('Updating Note:', body);

        const note = await Note.findOneAndUpdate(
            { _id: noteId, createdBy: userId },
            body,
            { new: true, runValidators: true }
        );

        if (!note) {
            throw new NotFoundError(`No note found for updating`);
        }

        res.redirect("/notes");
    }

    const deleteNote = async (req, res) => {
        const {
        user:{userId},
        params:{id:noteId}
        } = req

    const note = await Note.findByIdAndRemove(
        {_id:noteId, createdBy:userId}, 
    )
    if (!note) {
        throw new NotFoundError(`No note with that name`)
    }
        res.redirect("/notes");
    }


    module.exports = {
        getAllNotes,
        noteEntry,
        createNote,
        editNote,
        updateNote,
        deleteNote,
    }