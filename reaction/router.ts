import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import ReactionCollection from './collection';
import UserCollection from 'user/collection';
import FreetCollection from 'freet/collection';
import * as userValidator from '../user/middleware';
import * as reactionValidator from '../reaction/middleware';
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
    if (req.query.freet !== undefined) {
      next();
      return;
    }
    //no freetId -> get All
    const allReactions = await ReactionCollection.findAll();
    const response = allReactions.map(util.constructReactionResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const freetReactions = await ReactionCollection.findAllByUsername(req.query.freet as string);
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
      userValidator.isUserLoggedIn
    ],
    async (req: Request, res: Response) => {
      const user = await UserCollection.findOneByUserId(req.body.user);
      const freet = await FreetCollection.findOne(req.body.freet);
      //TODO
      // if user!= user or freet does not exist raise error
      // if reaction exists, put ?
      res.status(201).json({
        message: `Your account was created successfully. You have been logged in as ${user.username}`,
        // user: util.constructUserResponse(user)
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
    // reactionValidator.isValidReactionContent
  ],
  async (req: Request, res: Response) => {
    const reaction = await ReactionCollection.updateOne(req.params.reactionId, req.body.content);
    res.status(200).json({
      message: 'Your reaction was updated successfully.',
      reaction: util.constructReactionResponse(reaction)
    });
  }
);

export {router as reactionRouter};
