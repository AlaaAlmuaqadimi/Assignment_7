const mongoose = require('mongoose');
const Note = require('../models/Note');

exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.query.userId;

    const note = await Note.create({ title, content, userId });
    res.status(201).json({ message: 'Note created', note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.query.userId;
    const { title, content } = req.body;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not the owner' });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.replaceNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.query.userId;
    const { title, content } = req.body;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not the owner' });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { title, content },
      { new: true }
    );
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAllNotes = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { title } = req.body;

    const result = await Note.updateMany({ userId }, { title });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No notes found' });
    }

    res.status(200).json({ message: 'All notes updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.query.userId;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not the owner' });
    }

    await Note.findByIdAndDelete(noteId);
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPaginatedNotes = async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({ userId });

    res.status(200).json({
      notes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not the owner' });
    }

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNoteByContent = async (req, res) => {
  try {
    const { content } = req.query;
    const userId = req.query.userId;

    const note = await Note.findOne({ content, userId });
    if (!note) {
      return res.status(404).json({ message: 'No note found' });
    }

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotesWithUser = async (req, res) => {
  try {
    const userId = req.query.userId;

    const notes = await Note.find({ userId })
      .select('title userId createdAt')
      .populate('userId', 'email');

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.aggregateNotes = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { title } = req.query;

    const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
    if (title) {
      matchStage.title = title;
    }

    const notes = await Note.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          title: 1,
          userId: 1,
          createdAt: 1,
          'user.name': 1,
          'user.email': 1,
        },
      },
    ]);

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAllNotes = async (req, res) => {
  try {
    const userId = req.query.userId;

    await Note.deleteMany({ userId });
    res.status(200).json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
