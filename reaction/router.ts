import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import ReactionCollection from './collection';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';
import * as userValidator from '../user/middleware';
import * as reactionValidator from '../reaction/middleware';
import * as freetValidator from '../freet/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the reactions
 *
 * @name GET /api/reactions
 *
 * @return {ReactionResponse[]} - A list of all the reactions sorted in descending
 *                      order by date modified
 */
/**
 * Get reactions by freet.
 *
 * @name GET /api/reactions?freetId=id
 *
 * @return {ReactionResponse[]} - An array of reactions on the freet given by freedId
 * @throws {400} - If freetId is not given
 * @throws {404} - If no freet has given freetId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if freetId query parameter was supplied
    console.log("getting reaction");
    if (req.query.freetId !== undefined) {
      next();
      return;
    }
    //no freetId -> get All
    const allReactions = await ReactionCollection.findAll();
    console.log("there's no freet, getting all reactions");
    console.log("all reactions: ", allReactions);
    const response = allReactions.map(util.constructReactionResponse);
    res.status(200).json(response);
  },
  [
    freetValidator.isFreetExists //make sure freet exist
  ],
  async (req: Request, res: Response) => {
    const freetReactions = await ReactionCollection.findAllByFreetId(req.query.freetId as string);
    console.log("there's a freet, looking at it's reactions", freetReactions);
    const response = freetReactions.map(util.constructReactionResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new reaction
 *
 * @name POST /api/users
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
    '/',
    [
      userValidator.isUserLoggedIn,
      reactionValidator.isValidReaction
    ],
    async (req: Request, res: Response) => {
      console.log("reaction post request");
      const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
      const freetId = (req.body.freetId)
      const freet = await FreetCollection.findOne(freetId);
      if (!freet){ //same as freetValidator.isFreetExists
        res.status(404).json({
          error: {
            freetNotFound: `Freet with freet ID ${req.body.freetId} does not exist. :()`
          }
        });
        return;
      }
      const react = await ReactionCollection.findOneByUserAndFreet(userId, freetId);
      if (react){ //reaction already exists, let's delete it
        //TODO: remove value from Freet's count
        await ReactionCollection.deleteOneByFreetAndUser(userId, freetId);
      }
      //TODO: add value to Freet's count
      const reaction = await ReactionCollection.addOne(userId, freetId, req.body.vote);
      res.status(201).json({
        message: `React was created successfully.`,
        react: util.constructReactionResponse(reaction)
      });
      
    }
  );

/**
 * Delete a reaction
 *
 * @name DELETE /api/reactions/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the reaction
 * @throws {404} - If the reactionId is not valid
 */
router.delete(
  '/:reactionId?',
  // async (req: Request, res: Response, next:NextFunction) => {
  //   console.log(req.params);
  //   next();
  //   return
  // },
  [
    userValidator.isUserLoggedIn,
    reactionValidator.isReactionExists,
    reactionValidator.isValidReactionModifier
  ],
  async (req: Request, res: Response) => {
    await ReactionCollection.deleteOne(req.params.reactionId);
    res.status(200).json({
      message: 'Your reaction was deleted successfully.'
    });
  }
);

/**
 * Modify a reaction
 *
 * @name PUT /api/reactions/:id
 *
 * @param {string} content - the new content for the reaction
 * @return {ReactionResponse} - the updated reaction
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the reaction
 * @throws {404} - If the reactionId is not valid
 * @throws {400} - If the reaction content is empty or a stream of empty spaces
 * @throws {413} - If the reaction content is more than 140 characters long
 */
router.put(
  '/:reactionId?',
  [
    userValidator.isUserLoggedIn,
    reactionValidator.isReactionExists,
    reactionValidator.isValidReactionModifier,
    reactionValidator.isValidReaction
  ],
  async (req: Request, res: Response) => {
    const reaction = await ReactionCollection.updateOne(req.params.reactionId, req.body.content);
    console.log("changing reaction");
    res.status(200).json({
      message: 'Your reaction was updated successfully.',
      reaction: util.constructReactionResponse(reaction)
    });
  }
);

export {router as reactionRouter};
