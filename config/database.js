// config/database.js

// configs to connect to the database

//=================================USE THIS FOR ADMIN COMPUTER===================================
// module.exports = {
//     'connection': {
//       // local configs.
//         'host' : '192.168.0.9',
//         'user': 'root',
//         'password': 'root@SQL1',
// 			'database': 'eqsAuction'
//     }   
// };

//=================================USE THIS FOR OTHER COMPUTER===================================
// module.exports = {
//     'connection': {
//       // local configs.
//          'host' : '192.168.0.9',
//          'user': 'muskan',
//          'password': 'password',
// 			   'database': 'eqsAuction'
//     }   
// };

//=================================USE THIS FOR OTHER COMPUTER===================================
module.exports = {
    'connection': {
      // local configs.
         'host' : '192.168.0.10',
         'user': 'piyush',
         'password': 'password',
			   'database': 'eqsAuction'
    }   
};

//=================================USE THIS FOR SERVER===================================
// module.exports = {
//     'connection': {
//       // server configs.
//         'host' : 'mydbinstance.cltmsxnlpv2o.ap-south-1.rds.amazonaws.com',
//         'user': 'aakash',
//         'password': '123aakash',
//         'database': 'eqsAuction'
//     }
// };
