const usersDB = {
  users: require('Oja/db/seeds/01_users_seeds.sql'), 
  setUsers: function (data) { this.users = data}
}

const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
  const {user, pwd} = req.body; 
  if (!user || !pwd) return res.status(400).json({'Message': 'Username and password are required.'});
  // check for duplicate usernames in the db 
  const duplicate = usersDB.users.find(person => person.first_name === user);
  if (duplicate) return res.sendStatus(409); //Conflict 
  try {
    // encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);
    //store the new user 
    const newUser = {'username': user, "password": hashedPwd};
    usersDB.setUsers([...usersDB.users, newUser])
    await fsPromises.writeFile(
      path.join(controllers, '..','seeds', 'model', 'users.json') // need to change how to get to db
      JSON.stringify(usersDB.users)
    ); 
    console.log(usersDB.users);
    res.status(201).json({'success': `New user ${user} created!`})
  } catch (err) {
    res.status(500).json({'message': err.message})
  }
}

module.exports = {handleNewUser};