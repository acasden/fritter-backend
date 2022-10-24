import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type { Freet } from 'freet/model';

/**
 * This file defines the properties stored in a FreetSplitter
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for FreetSplitter on the backend
export type FreetSplitter = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  userID: Types.ObjectId;
  content: string;
  splits: Set<number>;
};

export type PopulatedFreetSplitter = {
    _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  userID: User;
  content: string;
  splits: Set<number>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// FreetSplitters stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const FreetSplitterSchema = new Schema<FreetSplitter>({
  // The author userId
  userID: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The content of the freet
  content: {
    type: String,
    required: true
  },
});

const FreetSplitterModel = model<FreetSplitter>('FreetSplitter', FreetSplitterSchema);
export default FreetSplitterModel;
