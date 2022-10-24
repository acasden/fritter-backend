import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FreetSplitterCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetsplitterValidator from '../freet_splitter/middleware';
import * as util from './util';

const router = express.Router();

/**
 *
 * @name GET /api/freetsplitters
 *
 * @return {FreetSplitterResponse[]} - A list of all the freetsplitters sorted in descending
 *                      order by date modified
 */
/**
 * Get freetsplitters by author.
 *
 * @name GET /api/freetsplitters?authorId=id
 *
 * @return {FreetSplitterResponse[]} - An array of freetsplitters created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }
    //no authorID -> get All
    const allFreetSplitters = await FreetSplitterCollection.findAll();
    const response = allFreetSplitters.map(util.constructFreetSplitterResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorFreetSplitters = await FreetSplitterCollection.findAllByUsername(req.query.author as string);
    const response = authorFreetSplitters.map(util.constructFreetSplitterResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new freetsplitter.
 *
 * @name POST /api/freetsplitters
 *
 * @param {string} content - The content of the freetsplitter
 * @return {FreetSplitterResponse} - The created freetsplitter
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freetsplitter content is empty or a stream of empty spaces
 * @throws {413} - If the freetsplitter content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    // freetsplitterValidator.isValidFreetSplitterContent
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    // const freetsplitter = await FreetSplitterCollection.addOne(userId, req.body.content);

    res.status(201).json({
      message: 'Your freetsplitter was created successfully.',
    //   freetsplitter: util.constructFreetSplitterResponse(freetsplitter)
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
    // freetsplitterValidator.isFreetSplitterExists,
    // freetsplitterValidator.isValidFreetSplitterModifier
  ],
  async (req: Request, res: Response) => {
    await FreetSplitterCollection.deleteOne(req.params.freetsplitterId);
    res.status(200).json({
      message: 'Your freetsplitter was deleted successfully.'
    });
  }
);

/**
 * Modify a freetsplitter
 *
 * @name PUT /api/freetsplitters/:id
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
  '/:freetsplitterId?',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    // const freetsplitter = await FreetSplitterCollection.updateOne(req.params.freetsplitterId, req.body.content);
    res.status(200).json({
      message: 'Your freetsplitter was updated successfully.',
    //   freetsplitter: util.constructFreetResponse(freetsplitter)
    });
  }
);

export {router as freetsplitterRouter};
