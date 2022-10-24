import type {HydratedDocument, Types} from 'mongoose';
import type {FreetSplitter} from './model';
import FreetSplitterModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore FreetSplitters
 * stored in MongoDB, including adding, finding, updating, and deleting FreetSplitters.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<FreetSplitter> is the output of the FreetSplitterModel() constructor,
 * and contains all the information in FreetSplitter. https://mongoosejs.com/docs/typescript.html
 */
class FreetSplitterCollection {
  /**
   * Add a FreetSplitter to the collection
   *
   * @param {string} userID - The id of the author of the FreetSplitter
   * @param {string} content - The id of the content of the FreetSplitter
   * @param {string} freetId - The id of the Freet this FreetSplitter is posted to
   * @return {Promise<HydratedDocument<FreetSplitter>>} - The newly created FreetSplitter
   */
  static async addOne(userID: Types.ObjectId | string, freetId: Types.ObjectId | string, content: string): Promise<HydratedDocument<FreetSplitter>> {
    const date = new Date();
    console.log(freetId);
    const FreetSplitter = new FreetSplitterModel({
      userID,
      post:freetId,
      datePosted: date,
      content,
    });
    await FreetSplitter.save(); // Saves FreetSplitter to MongoDB
    return FreetSplitter.populate('userID');
  }

  /**
   * Find a FreetSplitter by FreetSplitterID
   *
   * @param {string} FreetSplitterID - The id of the FreetSplitter to find
   * @return {Promise<HydratedDocument<FreetSplitter>> | Promise<null> } - The FreetSplitter with the given FreetSplitterID, if any
   */
  static async findOne(FreetSplitterID: Types.ObjectId | string): Promise<HydratedDocument<FreetSplitter>> {
    return FreetSplitterModel.findOne({_id: FreetSplitterID}).populate('userID');
  }

  /**
   * Find all freetsplitters under a specific FreetId
   * 
   * @param {string} FreetSplitterID - The id of the FreetSplitter to find
   * @return {Promise<HydratedDocument<FreetSplitter>> | Promise<null> } - The FreetSplitter with the given FreetSplitterID, if any
   */
   static async findAllByFreetId(FreetId: Types.ObjectId | string): Promise<Array<HydratedDocument<FreetSplitter>>> {
    return FreetSplitterModel.find({freetId: FreetId}).sort({datePosted: -1}).populate('userID');
  }

  /**
   * Get all the FreetSplitters in the database
   *
   * @return {Promise<HydratedDocument<FreetSplitter>[]>} - An array of all of the FreetSplitters
   */
  static async findAll(): Promise<Array<HydratedDocument<FreetSplitter>>> {
    // Retrieves FreetSplitters and sorts them from most to least recent
    return FreetSplitterModel.find({}).sort({datePosted: -1}).populate('userID');
  }

  /**
   * Get all the FreetSplitters by given author
   *
   * @param {string} username - The username of author of the FreetSplitters
   * @return {Promise<HydratedDocument<FreetSplitter>[]>} - An array of all of the FreetSplitters
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<FreetSplitter>>> {
    const user = await UserCollection.findOneByUsername(username);
    return FreetSplitterModel.find({userID: user._id}).populate('userID');
  }


  /**
   * Delete a FreetSplitter with given FreetSplitterID.
   *
   * @param {string} FreetSplitterID - The FreetSplitterID of FreetSplitter to delete
   * @return {Promise<Boolean>} - true if the FreetSplitter has been deleted, false otherwise
   */
  static async deleteOne(FreetSplitterID: Types.ObjectId | string): Promise<boolean> {
    const FreetSplitter = await FreetSplitterModel.deleteOne({_id: FreetSplitterID});
    return FreetSplitter !== null;
  }

  /**
   * Delete all the FreetSplitters by the given author
   *
   * @param {string} userID - The id of author of FreetSplitters
   */
  static async deleteMany(userID: Types.ObjectId | string): Promise<void> {
    await FreetSplitterModel.deleteMany({userID});
  }
}

export default FreetSplitterCollection;
