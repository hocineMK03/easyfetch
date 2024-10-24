
const easyfetch = require('./EasyFetch');

const user={
email: "joedoe@gmail.com",
	password: "hashed_password_here"
}
easyfetch({ url: 'http://127.0.0.1:5000/auth/login',
    method: 'POST',
    body: user
 });