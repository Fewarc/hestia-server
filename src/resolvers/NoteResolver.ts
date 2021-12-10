import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Note } from "../models/Note";

@Resolver()
export class NoteResolver {
  @Mutation(() => [Note])
  async saveNote(
    @Arg('userId') userId: number,
    @Arg('eventId') eventId: number,
    @Arg('content') content: string
  ) {
    let note = await Note.findOne({ ownerId: userId, eventId: eventId });

    if (note) {
      note.content = content
      await note.save();
    } else {
      let newNote = Note.create();

      newNote.ownerId = userId;
      newNote.eventId = eventId;
      newNote.content = content;

      await newNote.save();
    }

    return Note.find({ ownerId: userId });
  }

  @Query(() => Note)
  async getNote(
    @Arg('userId') userId: number,
    @Arg('eventId') eventId: number
  ) {
    const note = await Note.findOne({ ownerId: userId, eventId: eventId });

    if (note) {
      return note;
    } else {
      let newNote = Note.create();

      newNote.ownerId = userId;
      newNote.eventId = eventId;
      newNote.content = '';

      await newNote.save();
      
      return newNote;
    }
  }

  @Query(() => [Note])
  async getAllNotes(
    @Arg('userId') userId: number
  ) {
    return await Note.find({ ownerId: userId });
  }
}