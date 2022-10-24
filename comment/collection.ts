import type {HydratedDocument, Types} from 'mongoose';
import type {Comment} from './model';
import CommentModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore Comments
 * stored in MongoDB, including adding, finding, updating, and deleting Comments.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Comment> is the output of the CommentModel() constructor,
 * and contains all the information in Comment. https://mongoosejs.com/docs/typescript.html
 */
class CommentCollection {
  /**
   * Add a Comment to the collection
   *
   * @param {string} userID - The id of the author of the Comment
   * @param {string} content - The id of the content of the Comment
   * @param {string} freetId - The id of the Freet this Comment is posted to
   * @return {Promise<HydratedDocument<Comment>>} - The newly created Comment
   */
  static async addOne(userID: Types.ObjectId | string, freetId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Comment>> {
    const date = new Date();
    console.log(freetId);
    const Comment = new CommentModel({
      userID,
      post:freetId,
      datePosted: date,
      content,
    });
    await Comment.save(); // Saves Comment to MongoDB
    return Comment.populate('userID');
  }

  /**
   * Find a Comment by CommentID
   *
   * @param {string} CommentID - The id of the Comment to find
   * @return {Promise<HydratedDocument<Comment>> | Promise<null> } - The Comment with the given CommentID, if any
   */
  static async findOne(CommentID: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
    return CommentModel.findOne({_id: CommentID}).populate('userID');
  }

  /**
   * Find all comments under a specific FreetId
   * 
   * @param {string} CommentID - The id of the Comment to find
   * @return {Promise<HydratedDocument<Comment>> | Promise<null> } - The Comment with the given CommentID, if any
   */
   static async findAllByFreetId(FreetId: Types.ObjectId | string): Promise<Array<HydratedDocument<Comment>>> {
    return CommentModel.find({freetId: FreetId}).sort({datePosted: -1}).populate('userID');
  }

  /**
   * Get all the Comments in the database
   *
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the Comments
   */
  static async findAll(): Promise<Array<HydratedDocument<Comment>>> {
    // Retrieves Comments and sorts them from most to least recent
    return CommentModel.find({}).sort({datePosted: -1}).populate('userID');
  }

  /**
   * Get all the Comments by given author
   *
   * @param {string} username - The username of author of the Comments
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the Comments
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Comment>>> {
    const user = await UserCollection.findOneByUsername(username);
    return CommentModel.find({userID: user._id}).populate('userID');
  }


  /**
   * Delete a Comment with given CommentID.
   *
   * @param {string} CommentID - The CommentID of Comment to delete
   * @return {Promise<Boolean>} - true if the Comment has been deleted, false otherwise
   */
  static async deleteOne(CommentID: Types.ObjectId | string): Promise<boolean> {
    const Comment = await CommentModel.deleteOne({_id: CommentID});
    return Comment !== null;
  }

  /**
   * Delete all the Comments by the given author
   *
   * @param {string} userID - The id of author of Comments
   */
  static async deleteMany(userID: Types.ObjectId | string): Promise<void> {
    await CommentModel.deleteMany({userID});
  }
}

export default CommentCollection;
