import type {HydratedDocument, Types} from 'mongoose';
import type {Flag} from './model';
import FlagModel from './model';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';
import ReactionCollection from '../reaction/collection';
import FreetModel from '../freet/model';
import UserModel from '../user/model';

/**
 * This files contains a class that has the functionality to explore flags
 * stored in MongoDB, including adding, finding, updating, and deleting flags.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Flag> is the output of the FlagModel() constructor,
 * and contains all the information in Flag. https://mongoosejs.com/docs/typescript.html
 */
class FlagCollection {
  /**
   * Add a flag to the collection
   *
   * @param {string} freetId - 
   * @param {string} flagger
   * @return {Promise<HydratedDocument<Flag>>} - The newly created flag
   */
  static async addOne(freetId: Types.ObjectId | string, flagger?: Types.ObjectId | string): Promise<HydratedDocument<Flag>> {
    if (typeof flagger !== 'undefined') {
        const flag = new FlagModel({
            FreetId: freetId,
            flagger
            });
        await flag.save(); // Saves flag to MongoDB
        return flag.populate('FreetId');
    }
    else{
        const flag = new FlagModel({
            FreetId: freetId,
            });
        await flag.save(); // Saves flag to MongoDB
        return flag.populate('FreetId');
    }
  }

  /**
   * Find a flag by flagId
   *
   * @param {string} flagId - The id of the flag to find
   * @return {Promise<HydratedDocument<Flag>> | Promise<null> } - The flag with the given flagId, if any
   */
  static async findOne(flagId: Types.ObjectId | string): Promise<HydratedDocument<Flag>> {
    return FlagModel.findOne({_id: flagId});    // .populate('freetId');
  }

  /**
   * Get all the flags in the database
   *
   * @return {Promise<HydratedDocument<Flag>[]>} - An array of all of the flags
   */
  static async findAll(): Promise<Array<HydratedDocument<Flag>>> {
    return FlagModel.find({}).populate('FreetId');
  }


 /**
   * Get the flags in for the given freet if any
   *
   * @param {string} freetId 
   * @return {Promise<HydratedDocument<Flag>>} - An array of all of the flags
   */
  static async findOneByFreetId(freetId: Types.ObjectId |string): Promise<HydratedDocument<Flag>> {
    const freet = await FreetCollection.findOne(freetId);
    return FlagModel.findOne({FreetId: freet._id});
  } 

  /**
   * Update a flag with the new content
   * Assumes that
   *
   * @param {string} flagId - The id of the flag to be updated
   * @param {string} value - True or False
   * @return {Promise<HydratedDocument<Flag>>} - The newly updated flag
   */
  static async updateAddFlagger(flagId: Types.ObjectId | string): Promise<HydratedDocument<Flag>> {
    const flag = await FlagModel.findOne({_id: flagId});
    const freetId = flag.FreetId;
    const freet = await FreetModel.findOne({FreetId: freetId});
    const flaggerId = freet.authorId;
    const flagger = await UserModel.findOne(flaggerId);
    
    flag.FlaggerId = flagger._id;
    await flag.save();
    
    return flag.populate('FlaggerId'); //this hopefully works even when removing, else we just set flag.vote == 0
  }

  static async updateRemoveFlagger(flagId: Types.ObjectId | string): Promise<HydratedDocument<Flag> | boolean> {
    const flag = await FlagModel.findOne({_id: flagId});    
    flag.FlaggerId = null;
    await flag.save();
    return await this.updateOne(flagId);
     //this hopefully works even when removing, else we just set flag.vote == 0
}
    static isControversial(up: number, down:number):boolean{
        const larger = Math.max(up, down);
        const smaller = Math.min(up, down);
        const percent = larger-smaller/larger*100;
        if (up>3 && down>3 && percent<20){
            return true;
        }
        return false;
    }
  static async updateOne(flagId: Types.ObjectId | string): Promise<HydratedDocument<Flag>|boolean> {
    const flag = await FlagModel.findOne({_id: flagId});
    const freetId = flag.FreetId;
    const up = await (await ReactionCollection.findUpByFreetId(freetId)).length;
    const down = await (await ReactionCollection.findDownByFreetId(freetId)).length;
    const controversial = this.isControversial(up, down);
    if (flag.FlaggerId== null && !controversial){ //case: no flagger, not close enough to flag
        return await this.deleteOne(flagId);
    }
    //case flagger (already exists) OR close enough to flag (already flagged by nature of flagId existing)
    await flag.save();
    
    return flag; //this hopefully works even when removing, else we just set flag.vote == 0
  }

  /**
   * Delete a flag with given flagId.
   *
   * @param {string} flagId - The flagId of flag to delete
   * @return {Promise<Boolean>} - true if the flag has been deleted, false otherwise
   */
  static async deleteOne(flagId: Types.ObjectId | string): Promise<boolean> {
    const flag = await FlagModel.deleteOne({_id: flagId});
    return flag !== null;
  }


  /**
   * Delete all the flags on a given post
   *
   * @param {string} authorId - The id of author of flags
   */
  static async deleteByFreet(freetId: Types.ObjectId | string): Promise<void> {
    await FlagModel.deleteMany({FreetId:freetId});
  }
}

export default FlagCollection;
