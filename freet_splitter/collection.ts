import {Cursor, HydratedDocument, Types} from 'mongoose';
import type {FreetSplitter} from './model';
import FreetSplitterModel from './model';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';
import UserModel from '../user/model';
import CommentModel from '../comment/model';
import FreetModel from '../freet/model';
import { Freet } from '../freet/model';
import CommentCollection from '../comment/collection';
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
   * @param {string} content - The string of the content of the FreetSplitter
   * @param {string} splits - Array of numbers of the location of the breaks
   * @return {Promise<HydratedDocument<FreetSplitter>>} - The newly created FreetSplitter
   */
  static async addOne(userID: Types.ObjectId | string, content: string, splits: string): Promise<HydratedDocument<FreetSplitter>> {
    console.log("add One", userID, content, splits);
    const user = await UserCollection.findOneByUserId(userID);
    const FreetSplitter = new FreetSplitterModel({
      userID: user._id,
      content,
      splits
    });
    
    await FreetSplitter.save(); // Saves FreetSplitter to MongoDB
    return FreetSplitter.populate('userID');
  }

  /**
   * 
   * @param splitsString numbers separated by commas
   */
  static stringToSetOfNumbers(splitsString:string): Set<number> {
    const splits:number[] = splitsString.split(`,`).map(x => parseInt(x));
    return new Set(splits);
  }

  /**
   * 
   * @param splitsSet Set<numbers>
   * @returns string of sorted numbers separated by ','
   */
  static setToString(splitsSet:Set<number>):string{
    return Array.from(splitsSet).sort(function (a, b) {  return a - b;  }).join(',');
  }

  /**
   * Returns true if the value is already a split in the freetSplitter draft, else false 
   * 
   * @param FreetSplitterId 
   * @param value 
   * @returns bool true if split value exists, else false
   */
  static async isSplitExists(FreetSplitterId: Types.ObjectId | string, value: number): Promise<boolean> {
    const freetSplitter= await FreetSplitterModel.findOne({_id: FreetSplitterId}).populate('userID');
    const splits:Set<number>= this.stringToSetOfNumbers(freetSplitter.splits);
    if (splits.has(value)){return true;}
    return false;

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
   * Find a FreetSplitter by FreetSplitterID
   *
   * @param {Types.ObjectId | string} userId - The id of the FreetSplitter to find
   * @return {Promise<HydratedDocument<FreetSplitter>> | Promise<null> } - The FreetSplitter with the given FreetSplitterID, if any
   */
   static async findOneUserID(userId: Types.ObjectId | string): Promise<HydratedDocument<FreetSplitter>> {
    const user = await UserCollection.findOneByUserId(userId);
    console.log(user._id);
    return FreetSplitterModel.findOne({userID: user._id});
  }

  /**
   * When we adjust content, remove splits that are too large
   * @param {Types.ObjectId | string} FreetSplitterId
   * @returns {Promise<HydratedDocument<FreetSplitter>>} 
   */
  static async removeHighSplits(FreetSplitterId:Types.ObjectId | string) :Promise<HydratedDocument<FreetSplitter>>{
    const freetSplitter = await FreetSplitterModel.findOne({_id: FreetSplitterId});
    const content = freetSplitter.content;
    const contentLength = content.length;
    const oldSplitsString:string = freetSplitter.splits;
    const oldSplits=this.stringToSetOfNumbers(oldSplitsString);
    const splits:Set<number> =new Set();
    for (const split of oldSplits){
      if (split < contentLength){
        splits.add(split);
      }
    freetSplitter.splits = this.setToString(splits);
    }
    await freetSplitter.save();
    return freetSplitter;
  }

  /**
   * changes content of freet
   * @params FreetSplitterId
   * @params newContent
   */
  static async updateOneContent(FreetSplitterId: Types.ObjectId | string, newContent: string){
    const freetSplitter = await FreetSplitterModel.findOne({_id: FreetSplitterId});
    freetSplitter.content = newContent;
    await freetSplitter.save();
    return freetSplitter
  }

  static async updateOneValue(FreetSplitterId: Types.ObjectId | string, value:number):Promise<HydratedDocument<FreetSplitter>>{
    if (await this.isSplitExists(FreetSplitterId, value)){
      return this.removeOneSplit(FreetSplitterId, value)
    }
    return this.addOneSplit(FreetSplitterId, value);
  }

  /**
   * Get all the FreetSplitters in the database
   *
   * @return {Promise<HydratedDocument<FreetSplitter>[]>} - An array of all of the FreetSplitters
   * Only used for debugging purposes
   */
  static async findAll(): Promise<Array<HydratedDocument<FreetSplitter>>> {
    // Retrieves FreetSplitters and sorts them from most to least recent
    return FreetSplitterModel.find({}).populate('userID');
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
   * Delete a FreetSplitter with given FreetSplitterID.
   *
   * @param {string} FreetSplitterID - The FreetSplitterID of FreetSplitter to delete
   * @return {Promise<Boolean>} - true if the FreetSplitter has been deleted, false otherwise
   */
  static async deleteOneByUserId(userId: Types.ObjectId | string): Promise<boolean> {
    const FreetSplitter = await FreetSplitterModel.deleteOne({userId});
    return FreetSplitter !== null;
  }

  static isSplitPostPossible(content: string, splits: string): boolean{
    const splitsList :number[] =splits.split(`,`).map(x => parseInt(x)).sort(function (a, b) {  return a - b;  }); //sorted array of numbers
    var cur = 0;
    for (let i = 0; i < splitsList.length; i++){ //makes sure dif between spots is < 140 (our character limit)
      if (splitsList[i] - cur>140 || splitsList[i] > content.length || splitsList[i]<=0){ return false;} //gap > 240 or not in range (o=0, content.length)
      cur = splitsList[i];
    }
    return true;
  }

  static async addOneSplit(FreetSplitterId: Types.ObjectId | string, value:number): Promise<HydratedDocument<FreetSplitter>>{
    const freetSplitter = await this.findOne(FreetSplitterId);
    if (freetSplitter.splits == ""){    
      freetSplitter.splits=""+value;
    }
    else{
      freetSplitter.splits=freetSplitter.splits+","+value;
    }
    await freetSplitter.save();
    return freetSplitter;
  }

  static async removeOneSplit(FreetSplitterId: Types.ObjectId | string, value:number): Promise<HydratedDocument<FreetSplitter>>{
    const freetSplitter = await this.findOne(FreetSplitterId);
    const splitsSet = this.stringToSetOfNumbers(freetSplitter.splits);
    splitsSet.delete(value);
    freetSplitter.splits = this.setToString(splitsSet);
    await freetSplitter.save();
    return freetSplitter;
  }
  /**
   * Splits a valid FreetSplitter post into Freet and Comments
   * Assumes content and splits are valid
   * @param {Types.ObjectId | string} FreetSplitterId freetsplitter that is valid to be posted
   * @param {Types.ObjectId | string} authorId 
   * @returns Promise of the Freet heading the post
   */
  static async makePost(FreetSplitterId: Types.ObjectId | string, userId: Types.ObjectId | string):  Promise<HydratedDocument<Freet>> {
    const freetSplitter = await this.findOne(FreetSplitterId);
    console.log("making post with freetSplitter: ", freetSplitter);
    const content= freetSplitter.content;
    const splits = freetSplitter.splits;
    const splitsList :number[] =splits.split(`,`).map(x => parseInt(x)).sort(function (a, b) {  return a - b;  }); //sorted array of numbers
    const contents: string[] =[]; //holds broken strings that will become freet + comments
    var cur:number = 0;
    console.log("splitlist", splitsList);
    splitsList.push(content.length); 
    for (let i = 0; i < splitsList.length; i++){ //makes sure dif between spots is < 240 (our character limit)
      contents.push(content.substring(cur, splitsList[i])); //
      cur = splitsList[i];
    }
    console.log(contents);
    const freet = await FreetCollection.addOne(userId, contents.shift()); //make original freet
    const freetId = freet._id;
    // const commentArray =[freet];
    console.log("contents", contents);
    for (let i = 0; i < contents.length; i++){ //make comments
      console.log("creating comment number ", i);
      await CommentCollection.addOne(userId, freetId, contents.shift());
    }
    return freet;
  }
}

export default FreetSplitterCollection;
