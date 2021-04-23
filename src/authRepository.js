const errorUtils  = require('./errorUtil');
const AWS = require('aws-sdk');
const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-19",
  region: "us-east-1"
});

const cognitoUserPool = process.env.COGNITO_USER_POOL;
const cognitoClientId = process.env.COGNITO_CLIENT_ID;

module.exports = {
  signup: signup,
  signin: signin,
  confirmSignup: confirmSignup,
  getUser: getUser
};

async function signup(user) {
  try {
    console.log('authRepository::signup');
    var params = {
      ClientId: cognitoClientId, 
      Password: user.password,
      Username: user.email,
      UserAttributes: [
        {
          Name: 'name', 
          Value: user.name
        },
      ],
      ValidationData: [
        {
          Name: 'username',
          Value: user.email
        },
      ]
    };

    await COGNITO_CLIENT.signUp(params, function(err, data) {
      if (err) throw(err);
      else console.log('authRepository::signup:::success');
    });

    return  "Conta criada com sucesso.";
  }
  catch(error){
    console.log('authRepository::signup:::error', error);
    response.exists = false;
    response.hasError = true;
    if (error.code == 'UsernameExistsException') {
        console.log('authRepository::signup:::UsernameExistsException');
        throw { name : error.code, message : errorUtils.knownErrors.ALREADY_EXISTS, errors: []};
    } 
    else if (error.code == 'InvalidPasswordException'){
      console.log('authRepository::signup:::InvalidPasswordException');
      throw { name : error.code, message : errorUtils.knownErrors.INVALID_PASSWORD, errors: []};
    }
    else {
      console.log('authRepository::signup:::internal error', error);
      throw { name : "Internal", message : errorUtils.knownErrors.INTERNAL, errors: []};
    }
  }
}

async function confirmSignup(username, code){
  console.log('authRepository::confirmSignUp');
  try{
    var params = {
      ClientId: cognitoClientId,
      ConfirmationCode: code,
      Username: username,
    };
    await COGNITO_CLIENT.confirmSignUp(params).promise();
    console.log('authRepository::confirmSignUp:::sucess');
    return "conta confirmada com sucesso!"
  }
  catch(error){
    if(error.code == 'ExpiredCodeException'){
      console.log('authRepository::confirmSignup:::ExpiredCodeException');
      throw { name : "ExpiredCodeException", message : errorUtils.knownErrors.CODE_EXPIRED, errors: []};
    }
    else if (error.code == 'MissingRequiredParameter'){
      console.log('authRepository::confirmSignup:::MissingRequiredParameter');
      throw { name : "MissingRequiredParameter", message : errorUtils.knownErrors.CONFIRMATION_MISSING_REQUIRED_PARAMETER, errors: []};
    }
    else{
      console.log('authRepository::confirmSignup:::internal error', error);
      throw { name : "Internal", message : errorUtils.knownErrors.INTERNAL, errors: []};
    }
  }
}

async function signin(credentials){
  console.log('authRepository::signin');
  try{
    let result = await COGNITO_CLIENT.adminInitiateAuth({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: cognitoClientId,
      UserPoolId: cognitoUserPool,
      AuthParameters: {
        USERNAME: credentials.email,
        PASSWORD: credentials.password
      }
    }).promise()

    let user = await COGNITO_CLIENT.adminGetUser({
      UserPoolId: cognitoUserPool,
      Username: credentials.email
    }).promise()

    Object.assign(result, user)
    return result;
  }
  catch(error){
    console.log('authRepository::signin:::error', error);
    if (error.code == 'NotAuthorizedException') {
        console.log('authRepository::signin:::NotAuthorizedException');
        throw { name : error.code, message : errorUtils.knownErrors.NOT_AUTHORIZED, errors: []};
    } else {
      console.log('authRepository::signin:::internal error', error);
      throw { name : "Internal", message : errorUtils.knownErrors.INTERNAL, errors: []};
    }
  }
}

async function getUser(token){
  console.log('authRepository::getUser');
  try{
    let result = await COGNITO_CLIENT.getUser({
      AccessToken: token
    }).promise()

    return result;
  }
  catch(error){
    console.log('authRepository::getUser:::internal error', error);
    throw { name : "Internal", message : errorUtils.knownErrors.INTERNAL, errors: []};
  }
}