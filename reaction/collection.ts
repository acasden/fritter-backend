import type {HydratedDocument, Types} from 'mongoose';
import type {Reaction} from './model';
import ReactionModel from './model';
import UserCollection from '../user/collection';
import FreetCollection from 'freet/collection';

/**
 * This files contains a class that has the functionality to explore reactions
 * stored in MongoDB, including adding, finding, updating, and deleting reactions.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Reaction> is the output of the ReactionModel() constructor,
 * and contains all the information in Reaction. https://mongoosejs.com/docs/typescript.html
 */
class ReactionCollection {
  /**
   * Add a reaction to the collection
   *
   * @param {string} userId - The id of the author of the reaction
   * @param {string} freetId - T
   * @param {number} vote - 0, -1, 1
   * @return {Promise<HydratedDocument<Reaction>>} - The newly created reaction
   */
  static async addOne(userId: Types.ObjectId | string, freetId: Types.ObjectId | string, vote: number): Promise<HydratedDocument<Reaction>> {
    const date = new Date();
    const reaction = new ReactionModel({
      UserId: userId,
      vote,
      FreetId: freetId
    });
    await reaction.save(); // Saves reaction to MongoDB
    return reaction.populate('freetId');
  }

  /**
   * Find a reaction by reactionId
   *
   * @param {string} reactionId - The id of the reaction to find
   * @return {Promise<HydratedDocument<Reaction>> | Promise<null> } - The reaction with the given reactionId, if any
   */
  static async findOne(reactionId: Types.ObjectId | string): Promise<HydratedDocument<Reaction>> {
    return ReactionModel.findOne({_id: reactionId}).populate('freetId');
  }

  /**
   * Get all the reactions in the database
   *
   * @return {Promise<HydratedDocument<Reaction>[]>} - An array of all of the reactions
   */
  static async findAll(): Promise<Array<HydratedDocument<Reaction>>> {
    return ReactionModel.find({}).populate('freetId');
  }

  /**
   * Get all the reactions by given user
   *
   * @param {string} userId - userId 
   * @return {Promise<HydratedDocument<Reaction>[]>} - An array of all of the reactions
   */
  static async findAllByUserId(userId: Types.ObjectId | string): Promise<Array<HydratedDocument<Reaction>>> {
    const user = await UserCollection.findOneByUserId(userId);
    return ReactionModel.find({userId: user._id}).populate('freetId');
  }

  /**
   * Get all the reactions by given user
   *
   * @param {string} username - username 
   * @return {Promise<HydratedDocument<Reaction>[]>} - An array of all of the reactions
   */
   static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Reaction>>> {
    const user = await UserCollection.findOneByUsername(username);
    return ReactionModel.find({userId: user._id}).populate('freetId');
  }

 /**
   * Get all the reactions in by given freet
   *
   * @param {string} freetId - The username of author of the reactions
   * @return {Promise<HydratedDocument<Reaction>[]>} - An array of all of the reactions
   */
  static async findAllByFreetId(freetId: Types.ObjectId |string): Promise<Array<HydratedDocument<Reaction>>> {
    const freet = await FreetCollection.findOne(freetId);
    return ReactionModel.find({FreetId: freet._id}).populate('freetId');
  } 

  /**
   * Finds freet by user and freet combo
   * 
   * @param {string} userId 
   * @param {string} freetId
   * @return {Promise<HydratedDocument<Reaction>>} a single reaction or undefined
   */
   static async findOneByUserAndFreet(userId: Types.ObjectId |string, freetId: Types.ObjectId |string): Promise<Array<HydratedDocument<Reaction>>> {
    const freet = await FreetCollection.findOne(freetId);
    const user = await UserCollection.findOneByUserId(userId);
    return ReactionModel.findOne({userId: user._id, freetId:freet._id}).populate('freetId');
   }

  /**
   * Update a reaction with the new content
   *
   * @param {string} reactionId - The id of the reaction to be updated
   * @param {string} vote - The new vote for the reaction
   * @return {Promise<HydratedDocument<Reaction>>} - The newly updated reaction
   */
  static async updateOne(reactionId: Types.ObjectId | string, vote: number): Promise<HydratedDocument<Reaction>> {
    const reaction = await ReactionModel.findOne({_id: reactionId});
    if (vote == 0){await this.deleteOne(reactionId);}
    else{reaction.vote = vote;
    await reaction.save();}
    
    return reaction.populate('freetId'); //this hopefully works even when removing 
  }

  /**
   * Delete a reaction with given reactionId.
   *
   * @param {string} reactionId - The reactionId of reaction to delete
   * @return {Promise<Boolean>} - true if the reaction has been deleted, false otherwise
   */
  static async deleteOne(reactionId: Types.ObjectId | string): Promise<boolean> {
    const reaction = await ReactionModel.deleteOne({_id: reactionId});
    return reaction !== null;
  }

  /**
   * Delete all the reactions on a given post
   *
   * @param {string} authorId - The id of author of reactions
   */
  static async deleteUsers(freetId: Types.ObjectId | string): Promise<void> {
    await ReactionModel.deleteMany({freetId});
  }

}

export default ReactionCollection;
