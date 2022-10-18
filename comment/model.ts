import { Freet } from 'freet/model';
import { User } from 'user/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Comment
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for User on the backend
export type Comment = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  userID: User;
  post: Freet;
  postUserID: User;
  datePosted: Date;
  text: String;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Users stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const CommentSchema = new Schema({
  // The user who commented's username
  userID: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The user who made original Freet's username
  postUserID: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The original post the comment is responding to
  password: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Freet'
  },
  // The date comment was posted
  datePosted: {
    type: Date,
    required: true
  },
  // The actual text in the comment
  text: {
    type: String,
    required: true
  }
});

const CommentModel = model<Comment>('Comment', CommentSchema);
export default CommentModel;
