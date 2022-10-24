import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {FreetSplitter, PopulatedFreetSplitter} from '../freet_splitter/model';


// Update this if you add a property to the Freet type!
type FreetSplitterResponse = {
    _id: string; // MongoDB assigns each object this ID on creation
  userID: string;
  content: string;
  splits: Set<number>;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw FreetSplitter object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<FreetSplitter>} freetsplitter - A freetsplitter
 * @returns {FreetSplitterResponse} - The freetsplitter object formatted for the frontend
 */
const constructFreetSplitterResponse = (freetsplitter: HydratedDocument<FreetSplitter>): FreetSplitterResponse => {
  const freetsplitterCopy: PopulatedFreetSplitter = {
    ...freetsplitter.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = freetsplitterCopy.userID;
  delete freetsplitterCopy.userID;
  return {
    ...freetsplitterCopy,
    _id: freetsplitterCopy._id.toString(),
    userID: username,
  };
};

export {
  constructFreetSplitterResponse
};
