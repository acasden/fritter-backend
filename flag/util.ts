import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Flag, PopulatedFlag} from '../flag/model';

// Update this if you add a property to the Freet type!
type FlagResponse = {
    _id: string; // MongoDB assigns each object this ID on creation
    FlaggerId: string;
    FreetId: string;
};

/**
 * Transform a raw Flag object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Flag>} flag - A flag
 * @returns {FlagResponse} - The flag object formatted for the frontend
 */
const constructFlagResponse = (flag: HydratedDocument<Flag>): FlagResponse => {
  const flagCopy: PopulatedFlag = {
    ...flag.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  console.log('flag: ', flag);
  const FlaggerId = flagCopy.FlaggerId ? flagCopy.FlaggerId._id.toString() : null; //if Null avoids ._id error
  const FreetId = flagCopy.FreetId._id.toString();
  delete flagCopy.FlaggerId;
  delete flagCopy.FreetId;
  console.log(FlaggerId, FreetId);
  return {
    ...flagCopy,
    _id: flagCopy._id.toString(),
    FlaggerId: FlaggerId,
    FreetId: FreetId,
  };
};

export {
  constructFlagResponse
};
