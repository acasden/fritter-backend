import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Reaction, PopulatedReaction} from '../reaction/model';

// Update this if you add a property to the Freet type!
type ReactionResponse = {
    _id: string; // MongoDB assigns each object this ID on creation
    UserId: string;
    FreetId: string;
    vote: number;
};

/**
 * Transform a raw Reaction object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Reaction>} reaction - A reaction
 * @returns {ReactionResponse} - The reaction object formatted for the frontend
 */
const constructReactionResponse = (reaction: HydratedDocument<Reaction>): ReactionResponse => {
  const reactionCopy: PopulatedReaction = {
    ...reaction.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const user = reactionCopy.UserId;
  const freet = reactionCopy.FreetId;
  delete reactionCopy.UserId;
  return {
    ...reactionCopy,
    _id: reactionCopy._id.toString(),
    UserId: user._id.toString(),
    FreetId: freet._id.toString(),
    vote: reactionCopy.vote
  };
};

export {
  constructReactionResponse
};
