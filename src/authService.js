const authRepository = require('./authRepository')

module.exports = {
  signin: signin,
  signup: signup,
  confirmSignup: confirmSignup,
  getUser: getUser
};

async function signup(user){
  try{
    console.log('authService::signup');
    return await authRepository.signup(user);
  }
  catch(error){
    console.log('authService::signup::error')
    throw error;
  }
}

async function confirmSignup(username, code){
  try{
    console.log('authService::confirmSignup');
    return await authRepository.confirmSignup(username, code);
  }
  catch(error){
    console.log('authService::confirmSignup::error')
    throw error;
  }
}

async function signin(credentials){
  try{
    console.log('authService::signin');
    return await authRepository.signin(credentials);
  }
  catch(error){
    console.log('authService::signin::error')
    throw error;
  }
}

async function getUser(token){
  try{
    console.log('authService::getUser');
    return await authRepository.getUser(token);
  }
  catch(error){
    console.log('authService::getUser::error')
    throw error;
  }
}