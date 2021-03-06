import mongoose from 'mongoose';

import UserSchema from './schemas/user';

const connect = (uri) => {
  mongoose.connect(uri, {useMongoClient: true});
  mongoose.Promise = global.Promise;

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  mongoose.connection.on('connected', function(){
    console.error(`MONGO CONNECT SUCCESS`);
  });


  mongoose.model('User', UserSchema);
};

export default connect;
