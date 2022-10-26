import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FlagCollection from './collection';
// import UserCollection from '../user/collection';
// import ReactionCollection from 'reaction/collection';
import FreetCollection from '../freet/collection';
import * as userValidator from '../user/middleware';
import * as flagValidator from '../flag/middleware';
import * as freetValidator from '../freet/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the flags
 *
 * @name GET /api/flags
 *
 * @return {FlagResponse[]} - A list of all the flags sorted in descending
 *                      order by date modified
 */
/**
 * Get flags by freet.
 *
 * @name GET /api/flags?freetId=id
 *
 * @return {FlagResponse[]} - An array of flags on the freet given by freedId
 * @throws {400} - If freetId is not given
 * @throws {404} - If no freet has given freetId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if freetId or flagId query parameter was supplied
    console.log("getting flag");
    if (req.query.freetId !== undefined || req.query.flagId!== undefined) {
      next();
      return;
    }
    //no freetId -> get All
    const allFlags = await FlagCollection.findAll();
    console.log("there's no freet, getting all flags");
    console.log("all flags: ", allFlags);
    const response = allFlags.map(util.constructFlagResponse);
    res.status(200).json(response);
  },
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.freetId !== undefined) { 
        next();
        return;
      }
      //yes flagId, no freetId
    const flag = await FlagCollection.findOne(req.query.flagId as string);
    if (!flag){
        res.status(400).json({message: "invalid flagId"});
        return;
    }
    const response = util.constructFlagResponse(flag);
    res.status(200).json(response);
    
  },
  [
    freetValidator.isFreetExists //make sure freet exist
  ],
  async (req: Request, res: Response) => {
    //yes freetId, no flagId
    const flag = await FlagCollection.findOneByFreetId(req.query.freetId as string);
    if (!flag){
        res.status(400).json({message: "flag for freet ${req.query.freetId} does not exist"});
        return;
    }
    const response = util.constructFlagResponse(flag);
    res.status(200).json(response);
  }
);

/**
 * User creates a flag
 *
 * @name POST /api/flags:freetId
 *
 * @param {string} userId - 
 * @param {string} freetId - 
 * @param {Number} vote - -1 for downvote, 0 for novote, 1 for vote
 * @return {UserResponse} - The created user
 * @throws {403} - If there is a user already logged in
 * @throws {409} - If username is already taken
 * @throws {400} - If password or username is not in correct format
 *
 */
 router.post(
    '/:freetId?',
    [
      userValidator.isUserLoggedIn,
      freetValidator.isFreetExists,
      freetValidator.isValidFreetModifier //only valid freet modifiers can manually add flag
    ],
    async (req: Request, res: Response) => {
        console.log("posting by freetId");
        const freetId = (req.body.freetId);
        const freet = await FreetCollection.findOne(freetId);
        if (!freet){ //same as freetValidator.isFreetExists
          res.status(404).json({
            error: {
              freetNotFound: `Freet with freet ID ${req.body.freetId} does not exist. :()`
            }
          });
          return;
        }
        const flag = await FlagCollection.findOneByFreetId(freetId);
        const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
        var newFlag;
        if (!flag){//no existing flag so far
            newFlag = await FlagCollection.addOne(freetId, userId);
        }
        else{
            const flagId = flag._id;
            newFlag = await FlagCollection.updateAddFlagger(flagId);
        }
        res.status(201).json({
            message: `Manual react was created successfully, or already existed.`,
            react: util.constructFlagResponse(newFlag)
        });
      
    }
  );

/**
 * User deletes manual flag
 *
 * @name DELETE /api/flags/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the flag
 * @throws {404} - If the flagId is not valid
 */
router.delete(
  '/:flagId?',
  [
    userValidator.isUserLoggedIn,
    flagValidator.isFlagExists,
    flagValidator.isValidFlagModifier
  ],
  async (req: Request, res: Response) => {
    const flag= await FlagCollection.updateRemoveFlagger(req.params.flagId); //this function should now remove flagger AND update the value
    
    res.status(200).json({
      message: 'Your flag was updated successfully. Flagger was deleted., ${flag}',
    //   flag: util.constructFlagResponse(flag)
    });
  },
);


/**
 * User add manual flag to existing flag
 *
 * @name PUT /api/flags/:flagId
 *
 * @param {string} content - the new content for the flag
 * @return {FlagResponse} - the updated flag
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the flag
 * @throws {404} - If the flagId is not valid
 * @throws {400} - If the flag content is empty or a stream of empty spaces
 * @throws {413} - If the flag content is more than 140 characters long
 */
router.put(
  '/:flagId?',
  [
    userValidator.isUserLoggedIn,
    flagValidator.isFlagExists,
    flagValidator.isValidFlagModifier,
  ],
  async (req: Request, res: Response) => {
    const flag = await FlagCollection.updateAddFlagger(req.params.flagId);
    console.log("changing flag");
    res.status(200).json({
      message: 'Your flag was updated successfully.',
      flag: util.constructFlagResponse(flag)
    });
  }
);

export {router as flagRouter};
