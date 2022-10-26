import type {Types, PopulatedDoc, Document, BooleanExpression} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type { Freet } from '../freet/model';
import type { Reaction } from '../reaction/model';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Flag on the backend {post: postID, flagger: lone user}
export type Flag = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  FlaggerId: Types.ObjectId;
  FreetId: Types.ObjectId;
};

export type PopulatedFlag = {
    _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
    FlaggerId: User;
    FreetId: Freet;
  };

// Mongoose schema definition for interfacing with a MongoDB table
// aka what I need as an input to make a Flag
const FlagSchema = new Schema<Flag>({
    FlaggerId: {
    type: Schema.Types.ObjectId,    // Use Types.ObjectId outside of the schema
    required: false,
    ref: 'User'
  },

  FreetId: {
    type: Schema.Types.ObjectId,    // Use Types.ObjectId outside of the schema
    required: true,
    ref: 'Freet'
  }
});

const FlagModel = model<Flag>('Flag', FlagSchema);
export default FlagModel;
