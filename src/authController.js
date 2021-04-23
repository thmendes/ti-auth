const authService = require('./authService');
const errorUtil = require('./errorUtil');

module.exports = {
  signup: signup,
  confirmSignup: confirmSignup,
  signin: signin,
  getUser: getUser
};

async function signup(req, res) {
  try{
    console.time('signup');
    console.log('authController::signup');
    const validateInputResponse = await validateInput(req.body, true);
    if(validateInputResponse.error){
      const errorResponse = errorUtil.errorResponse(validateInputResponse.scope, validateInputResponse.error);
      res.status(errorResponse.statusCode).send(errorResponse.body);
      return console.timeEnd('signup in');
    }
    const response = await authService.signup(req.body);
    res.json(response);
  }
  catch(error){
    const errorResponse = errorUtil.errorResponse(error.name, error.message, error.errors);
    res.status(errorResponse.statusCode).send(errorResponse.body);
  }
  finally{
    console.timeEnd('signup');
  }
}

async function confirmSignup(req, res){
  try{
    console.time('confirm signup');
    console.log('authController::confirmSignup');
    const response = await authService.confirmSignup(req.body.email, req.body.code);
    res.json(response);
  }
  catch(error){
    console.log('authController::confirmSignup::error');
    const errorResponse = errorUtil.errorResponse(error.name, error.message, error.errors);
    res.status(errorResponse.statusCode).send(errorResponse.body);
  }
  finally{
    console.timeEnd('confirm signup');
  }
}

async function signin(req, res) {
  try{
    console.time('signin in');
    console.log('authController::signin');
    const validateInputResponse = await validateInput(req.body);
    if(validateInputResponse.length > 0){
      throw {name : "FieldsValidationError", message : "Um ou mais campos inválidos/incorretos.", errors: validateInputResponse};
    }
    const response = await authService.signin(req.body)
    res.json(response);
  }
  catch(error){
    const errorResponse = errorUtil.errorResponse(error.name, error.message, error.errors);
    res.status(errorResponse.statusCode).send(errorResponse.body);
  }
  finally{
    console.timeEnd('signin in');
  }
}

async function getUser(req, res){
  try{
    console.time('getUser in');
    console.log('authController::getUser');
    const response = await authService.getUser(req.body.token)
    res.json(response);
  }
  catch(error){
    const errorResponse = errorUtil.errorResponse(error.name, error.message, error.errors);
    res.status(errorResponse.statusCode).send(errorResponse.body);
  }
  finally{
    console.timeEnd('getUser in');
  }
}

async function validateInput(input, validateName = false){
  console.log('authController::validateInput');
  const response = [];
  
  if(!input.email){
    response.push({
      error: errorUtil.knownErrors.EMAIL_IS_REQUIRED
    });
  }

  if(!input.password){
    response.push({
      error: errorUtil.knownErrors.PASSWORD_IS_REQUIRED
    });
  }

  if(!input.name && validateName){
    response.push({
      error: errorUtil.knownErrors.NAME_IS_REQUIRED
    });
  }
  
  if(input.email && !validateEmail(input.email)){
    response.push({
      error: errorUtil.knownErrors.EMAIL_MALFORMED
    });
  }
  
  return response;
}

function validateEmail(email){
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}