const db = require('../../DB/connect'); // MySQL connection

const createUser = async (name, email, contactNumber, password ) => {
  const [result] = await db.execute(
    'INSERT INTO admin (Name, Email, ContactNumber,Password) VALUES (?,?,?,?)',
    [name,email,contactNumber,password,]
  );
  return result;
};

const getEmailAndNumber = async (email,contactNumber) => {
  const [rows] = await db.execute('SELECT * FROM admin WHERE Email = ? OR ContactNumber = ?', [email, contactNumber]);
  return rows;
};

const getFullPersonal = async () => {
  const [rows] = await db.execute("SELECT * FROM admin");
  console.log(rows);
  
  // If you want to return as JSON explicitly (usually it already is an array of objects)
  return rows;
};

module.exports = {createUser,getEmailAndNumber, getFullPersonal};