import type {Request, Response, NextFunction} from 'express';
import FreetCollection from '../freet/collection';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import FlagCollection from '../flag/collection';

/**
 * Checks if a flag with flagId is req.params exists
 */
const isFlagExists = async (req: Request, res: Response, next: NextFunction) => {
  var flagId= req.body.flagId;
  if (flagId == undefined){
    flagId =req.params.flagId;
  }
  if (flagId == undefined){
    console.log(req.body, req.params, req.query);
    flagId =req.query.flagId;
  }
  console.log("isFlagExists", flagId, req.body, req.params, req.query);
  const validFormat = Types.ObjectId.isValid(flagId);
  const flag = validFormat ? await FlagCollection.findOne(flagId) : '';
  if (!flag) {
    res.status(404).json({
      error: {
        flagNotFound: `Flag with flag ID ${flagId} does not exist.`
      }
    });
    return;
  }

  next();
};


/**
 * Checks if the current user is the author of the flag whose flagId is in req.params
 * Only the author of the freet can add flag manually. They can remove their own flag, 
 * but not affect if the freet is flagged for a reaction reason
 */
const isValidFlagModifier = async (req: Request, res: Response, next: NextFunction) => {
  const flag = await FlagCollection.findOne(req.params.flagId);
  if (!flag) { //check flag exists
    res.status(404).json({
      error: {
        flagNotFound: `Flag with flag ID ${req.params.flagId} does not exist.`
      }
    });
    return;
  }
  const freetId= flag.FreetId;
  const freet=await FreetCollection.findOne(freetId);
  const user = await UserCollection.findOneByUserId(freet.authorId);
  const userId=user._id;
  console.log("making sure users are the same", userId.toString(), req.session.userId);
  if (req.session.userId !== userId.toString()) { // check user is the one who made flag
    res.status(403).json({
      error: 'Cannot modify other users\' flags.'
    });
    return;
  }

  next();
};

export {
  isFlagExists,
  isValidFlagModifier
};
