import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetSplitterCollection from '../freet_splitter/collection';
import FreetCollection from '../freet/collection';

/**
 * Checks if a freetSplitter of user exists
 */
const isFreetSplitterExists = async (req: Request, res: Response, next: NextFunction) => {
  console.log("isfreetsplitterexists");
  const userId = req.session.userId as string;
  const freetSplitter = await FreetSplitterCollection.findOneUserID(userId);
  console.log(userId, freetSplitter);
  if (!freetSplitter) {
    res.status(404).json({
      error: {
        freetSplitterNotFound: `User ${userId} does not have an existing FreetSplitter draft.`
      }
    });
    return;
  }
  console.log("it dose exist");
  next();
};

/**
 * Checks if the content of the freetSplitter in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */
const isValidFreetSplitterContent = (req: Request, res: Response, next: NextFunction) => {
  console.log("isvalidfreetsplittercontent");
  const {content, splits} = req.body as {content: string, splits:string};
  console.log(content, splits);
  if (!content.trim()) {
    res.status(400).json({
      error: 'FreetSplitter content must be at least one character long.'
    });
    return;
  }

  // const splitArray = splits.split(`,`).map(x => +x)
  const splitRegex = /"^[0-9]+(,[0-9]+)*"/i; //regex for "number" or "number,number,number..."
  if (!splitRegex.test(splits)) {
    res.status(400).json({
      error: {
        username: 'Splits attribute must only be numbers separated by commas, not ${splits}.'
      }
    });
    return;
  }
  next();
};

const isValidFreetSplitterValue = (req: Request, res: Response, next: NextFunction) => {
  console.log("isvalidfreetsplitervalue");
  var valueString = req.body.value;
  if (valueString==undefined){
      valueString = req.params.value;
  }
  console.log('in verifier. value:', valueString);

  if (!valueString.trim()) {
    res.status(400).json({
      error: 'FreetSplitter split value must be at least one character long.'
    });
    return;
  }

  const splitRegex = /^[0-9]+/i;
  if (!splitRegex.test(valueString) || valueString === "0") {
    res.status(400).json({
      error: {
        username: 'Splits value must be a positive number.'
      }
    });
    return;
  }
  
  next();
};


export {
  isValidFreetSplitterContent,
  isFreetSplitterExists,
  isValidFreetSplitterValue
};
