import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {FreetSplitter, PopulatedFreetSplitter} from '../freet_splitter/model';


// Update this if you add a property to the Freet type!
type FreetSplitterResponse = {
    _id: string; // MongoDB assigns each object this ID on creation
  userID: string;
  content: string;
  splits: string;
};


/**
 * Transform a raw FreetSplitter object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<FreetSplitter>} freetsplitter - A freetsplitter
 * @returns {FreetSplitterResponse} - The freetsplitter object formatted for the frontend
 */
const constructFreetSplitterResponse = (freetsplitter: HydratedDocument<FreetSplitter>): FreetSplitterResponse => {
  const freetSplitterCopy: PopulatedFreetSplitter = {
    ...freetsplitter.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = freetSplitterCopy.userID;
  delete freetSplitterCopy.userID;
  return {
    ...freetSplitterCopy,
    _id: freetSplitterCopy._id.toString(),
    userID: username,
  };
};

export {
  constructFreetSplitterResponse
};
