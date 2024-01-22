const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
    title:{
        type: String,
        default: 'untitled',
        maxlength: 30,
    },
    note:{
        type: String,
    },
    tag:{
        type: String,
        maxlength: 20,

    },
    createdBy: {
        type:mongoose.Types.ObjectId,
        ref: 'User'
    },

}, {timestamps:true})

module.exports = mongoose.model('Notes', NoteSchema)