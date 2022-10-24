import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import CommentCollection from './collection';
import * as userValidator from '../user/middleware';
import * as commentValidator from '../comment/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the comments
 *
 * @name GET /api/comments
 *
 * @return {CommentResponse[]} - A list of all the comments sorted in descending
 *                      order by date modified
 */
/**
 * Get comments by author.
 *
 * @name GET /api/comments?authorId=id
 *
 * @return {CommentResponse[]} - An array of comments created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // If yes username or yes freetID, go to next function
    console.log("here");
    if (req.query.author !== undefined || req.query.id !==undefined) {
      console.log("one is true");
      next();
      return;
    }
    //not given parameter "author" or "id"
    const allComments = await CommentCollection.findAll();
    const response = allComments.map(util.constructCommentResponse);
    res.status(200).json(response);
    console.log(response, 1);
  },
  async (req: Request, res: Response, next: NextFunction) => {
  //if yes freetID, go to next function
  if (req.query.id == undefined){
    console.log("there's not an id");
    next();
    return;
  }
    
  const authorComments = await CommentCollection.findAllByFreetId(req.query.id as string);
  const response = authorComments.map(util.constructCommentResponse);
  res.status(200).json(response);
  console.log(response, 3);
  },
  [    userValidator.isAuthorExists
  ],
  
  async (req: Request, res: Response) => {
    //case: given "author" username
    userValidator.isAuthorExists
    const allComments = await CommentCollection.findAllByUsername(req.query.author as string);
    const response = allComments.map(util.constructCommentResponse);
    res.status(200).json(response);  
    console.log(response, 2);
  },
);

/**
 * Create a new comment.
 *
 * @name POST /api/comments
 *
 * @param {string} content - The content of the comment
 * @return {CommentResponse} - The created comment
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the comment content is empty or a stream of empty spaces
 * @throws {413} - If the comment content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    commentValidator.isValidCommentContent
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const freetId = (req.body.freet)
    const comment = await CommentCollection.addOne(userId, freetId, req.body.content);

    res.status(201).json({
      message: 'Your comment was created successfully.',
      comment: util.constructCommentResponse(comment)
    });
  }
);

/**
 * Delete a comment
 *
 * @name DELETE /api/comments/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the comment
 * @throws {404} - If the commentId is not valid
 */
router.delete(
  '/:commentId?',
  [
    userValidator.isUserLoggedIn,
    commentValidator.isCommentExists,
    commentValidator.isValidCommentModifier
  ],
  async (req: Request, res: Response) => {
    await CommentCollection.deleteOne(req.params.commentId);
    res.status(200).json({
      message: 'Your comment was deleted successfully.'
    });
  }
);


export {router as commentRouter};
