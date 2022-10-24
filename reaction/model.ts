import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type { Freet } from '../freet/model';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type Reaction = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  UserId: Types.ObjectId;
  FreetId: Types.ObjectId;
  vote: number; //0 for None, 1 for Upvote, -1 for Downvote
};

export type PopulatedReaction = {
    _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
    UserId: User;
    FreetId: Freet;
    vote: number; //0 for None, 1 for Upvote, -1 for Downvote
  };

// Mongoose schema definition for interfacing with a MongoDB table
// aka what I need as an input to make a Reaction
const ReactionSchema = new Schema<Reaction>({
  UserId: {
    type: Schema.Types.ObjectId,    // Use Types.ObjectId outside of the schema
    required: true,
    ref: 'User'
  },

  FreetId: {
    type: Schema.Types.ObjectId,    // Use Types.ObjectId outside of the schema
    required: true,
    ref: 'Freet'
  },

  vote: {
    type: Number,
    required: true,
    ref: 'Vote'
  },
});

const ReactionModel = model<Reaction>('Reaction', ReactionSchema);
export default ReactionModel;
