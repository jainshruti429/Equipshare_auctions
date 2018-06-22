var csv = require('fast-csv');
var fs = require('fs');

var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

//connection.query('USE ' + dbconfig.database);

var express  = require('express');
var app = express();

var owner = '';

var func_type = function(data){
	connection.query("INSERT INTO equipment_type (category, subcategory, brand, model, mapping_unit, max_dig_depth, engine_power, loader_capacity, showel_capacity, backhoe_bucket_capacity, weight, blade_capacity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10],data[11]], function(err){
		if(err) throw err;
	});
};

var func_equipment = function(data){
	connection.query("SELECT city, state FROM account WHERE id = ?",[owner], function(err1,rows1){
		if(err1) throw err1;
		else{
			connection.query("SELECT type_id FROM equipment_type WHERE category = ? AND subcategory = ? AND brand = ? AND model = ?", [data[0],data[1],data[2],data[3]],function(err2,rows2){
				if(err2) throw err2;
				else{
					connection.query("INSERT INTO all_equipment (category, subcategory, brand, model, year,km,colour,expected_price,description,city,state,available, type_id,owner_id, uploaded_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],rows1[0].city, rows1[0].state, 1, rows2[0].type_id, owner, 1], function(err){
						if(err) throw err;
					});
				}
			});	
		}
	});
};

module.exports = {

type_csv : function(req,res, next){

		file = req.files.csv;
		file.mv(file.name, function(err){
			if(err) throw err;
			else {
				var stream = fs.createReadStream(file.name);
				 
				var csvStream = csv()
				    .on("data", function(data){
				    console.log(data);
				    func_type(data);	
				    })
				    .on("end", function(){
				    });
				 
				stream.pipe(csvStream);
				return next();
			}
		});
	},

equipment_csv : function(req,res, next){

		file = req.files.csv;
		file.mv(file.name, function(err){
			if(err) throw err;
			else {
				var stream = fs.createReadStream(file.name);
				owner = req.session.owner_id
				 
				var csvStream = csv()
				    .on("data", function(data){
				    console.log(data);
				    func_equipment(data);	
				    })
				    .on("end", function(){
				    });
				stream.pipe(csvStream);
				return next();
			}
		});
	}	
}
