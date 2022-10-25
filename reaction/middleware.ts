import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import ReactionCollection from '../reaction/collection';

/**
 * Checks if a reaction with reactionId is req.params exists
 */
const isReactionExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.reactionId);
  const reaction = validFormat ? await ReactionCollection.findOne(req.params.reactionId) : '';
  if (!reaction) {
    res.status(404).json({
      error: {
        reactionNotFound: `Reaction with reaction ID ${req.params.reactionId} does not exist.`
      }
    });
    return;
  }

  next();
};


/**
 * Checks if the current user is the author of the reaction whose reactionId is in req.params
 */
const isValidReactionModifier = async (req: Request, res: Response, next: NextFunction) => {
  const reaction = await ReactionCollection.findOne(req.params.reactionId);
  if (!reaction) { //check reaction exists
    res.status(404).json({
      error: {
        reactionNotFound: `Reaction with reaction ID ${req.params.reactionId} does not exist.`
      }
    });
    return;
  }
  const userId = reaction.UserId._id;
  if (req.session.userId !== userId.toString()) { // check user is the one who made reaction
    res.status(403).json({
      error: 'Cannot modify other users\' reactions.'
    });
    return;
  }

  next();
};
/**
 * Checks if the reaction is a valid option (-1, 0, 1)
 * Raiser error 403 if no input
 * Raises error 403 if not 
 */
const isValidReaction =async (req: Request, res:Response, next: NextFunction) => {
  console.log(req.param);
  console.log(req.body);
  const input = req.params.vote;
  console.log(input);
  console.log(req.params);
  console.log(parseInt(input));
  if (parseInt(input)!==0 && parseInt(input)!==1 && parseInt(input)!==-1 ){
    res.status(403).json({
      error: 'The only valid reactions are -1, 0, and 1. Cannot parse invalid reaction value.'
    });
    return;
  }
  next();
  
}
export {
  isReactionExists,
  isValidReactionModifier,
  isValidReaction
};
