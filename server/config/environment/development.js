'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    /*uri: 'mongodb://localhost/wearablehrmonitorcloud-dev'*/
    uri: 'mongodb://Admin:Tphalo8c@ds011472.mlab.com:11472/wearable-sensor-data'
  },

  // Seed database on startup
  seedDB: false

};
