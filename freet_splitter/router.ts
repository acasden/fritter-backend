import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FreetSplitterCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetSplitterValidator from '../freet_splitter/middleware';
import * as util from './util';
import { constructFreetResponse } from '../freet/util';

const router = express.Router();


/**
 * Get the current user's freetsplitter
 *
 * @name GET /api/splits
 *
 * @return {FreetSplitterResponse[]} - An array of freetsplitters created by user with id, authorId
 * @throws {400} - If user is not signed in
 * @throws {404} - If no FreetSplitter draft exists
 *
 */
router.get(
  '/',
  [
    userValidator.isUserLoggedIn,
    freetSplitterValidator.isFreetSplitterExists
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    //no authorID -> get All
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const draft = await FreetSplitterCollection.findOneUserID(userId); //we know this exists bc of the validator

    res.status(200).json({
      freetSplitter: util.constructFreetSplitterResponse(draft)
    });
  },
);
/**
 * Create a new freetsplitter.
 * @param {string} content - The content of the freetsplitter
 * @param {string} splits //todo fix so that it's an array of numbers instead
 */
/**
 *  Posts the existing freetsplitter
 *
 * @name POST /api/splits/
 *
 * @param {} FreetSplitterId
 * @return {FreetSplitterResponse} - The created freetsplitter
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freetsplitter content is empty or a stream of empty spaces
 * @throws {413} - If the freetsplitter content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response, next : NextFunction) => {
    console.log("post split", req.params, req.body, req.query);
    const splitterId = req.params.splitterId ?? req.body.splitterId;
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const currentSplitter = await FreetSplitterCollection.findOneUserID(userId);
    if (currentSplitter!==undefined || currentSplitter!==null){
      next();
      return;
    }
    // creating new draft
    //first, if already exists a draft, let's delete that
    const current = await FreetSplitterCollection.findOneUserID(userId)
    if (current){ //not undefined, not null
      FreetSplitterCollection.deleteOne(current._id);
    }
    //make sure our content is valid
    freetSplitterValidator.isValidFreetSplitterContent;
    //define variables
    const content = req.params.content ?? req.body.content;
    console.log('content', content)
    const splits = req.body.splits ?? "";
    //make draft
    const freetsplitter = await FreetSplitterCollection.addOne(userId, content, splits);
    res.status(201).json({
      message: 'Your freetsplitter was created successfully.',
      freetsplitter: util.constructFreetSplitterResponse(freetsplitter)
    });
  },
  [
    freetSplitterValidator.isFreetSplitterExists,
  ],
  async (req: Request, res: Response, next : NextFunction) => {
    // turning draft into freet/comments
    console.log("turning draft into freet/comment");
    const freetSplitterId = req.body.splitterId ?? req.params.splitterId;
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    // const freetSplitterDraft = await FreetSplitterCollection.findOne(freetSplitterId);
    const freet = await FreetSplitterCollection.makePost(freetSplitterId, userId);
    await FreetSplitterCollection.deleteOne(freetSplitterId);
    res.status(201).json({
      message: 'Your freetsplitter was created successfully headed by the following freet.',
      freet: constructFreetResponse(freet)
    });
  }
);

/**
 * Delete a freetsplitter
 *
 * @name DELETE /api/freetsplitters/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freetsplitter
 * @throws {404} - If the freetsplitterId is not valid
 */
router.delete(
  '/:freetsplitterId?',
  [
    userValidator.isUserLoggedIn,
    freetSplitterValidator.isFreetSplitterExists,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const existing = await FreetSplitterCollection.findOneUserID(userId);
    await FreetSplitterCollection.deleteOne(existing._id);
    res.status(200).json({
      message: 'Your freetsplitter was deleted successfully.'
    });
  }
);

/**
 * @name PUT /api/splitters/:content?
 */
/**
 * Modify a freetsplitter
 *
 * @name PUT /api/splitters/:splitterId?:value?
 *
 * @param {string} content - the new content for the freetsplitter
 * @return {FreetSplitterResponse} - the updated freetsplitter
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the freetsplitter
 * @throws {404} - If the freetsplitterId is not valid
 * @throws {400} - If the freetsplitter content is empty or a stream of empty spaces
 * @throws {413} - If the freetsplitter content is more than 140 characters long
 */
router.put(
  '/',
  [
    userValidator.isUserLoggedIn,
    freetSplitterValidator.isFreetSplitterExists
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("post request, body: ", req.body, req.params);
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const freetsplitter = await FreetSplitterCollection.findOneUserID(userId);
    const value = req.body.value; //body or param?
    if (value !== undefined){ 
      next(); //if value, next
      return;
    }
    //NO value, yes content 
    const content = req.body.content; //body or param? 
    if (content==undefined || content ==""){
      res.status(400).json({
        message: 'You did not provide new content/text for the freetSplitter',
      //   freetsplitter: util.constructFreetResponse(freetsplitter)
      });
      return;
    }
    //update freetsplitter with new content
    const newContent = await FreetSplitterCollection.updateOneContent(freetsplitter._id, content);
    const finalFreetSplitter = await FreetSplitterCollection.removeHighSplits(newContent._id); //if content is shorter, remove extra high splits
    res.status(200).json({
      message: 'Your freetsplitter was updated successfully.',
      freetsplitter: util.constructFreetSplitterResponse(finalFreetSplitter)
    });
  },  
  [
    freetSplitterValidator.isValidFreetSplitterValue
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.session.userId as string) ?? '';
    const freetSplitterId = await FreetSplitterCollection.findOneUserID(userId);
    const valueString = req.body.value; //param????
    const value = +valueString; //casts to number
    const freetSplitter = await FreetSplitterCollection.updateOneValue(freetSplitterId._id, value);
    res.status(200).json({
      message: 'Your freetsplitter split was updated (added/removed) successfully.',
      freetsplitter: util.constructFreetSplitterResponse(freetSplitter)
    });
  }
);

export {router as freetSplitterRouter};
