import { Router } from 'express';
import passport from 'passport';
import { isEmail } from 'validator';

const router = new Router();

/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignUpForm(payload) {
  const errors = validateBasicSignInSignUpForm(payload);

  if (!payload || (typeof payload.username !== 'string') || !/^[a-zA-Z]+([\-\s]?[a-zA-Z]+)*$/.test(payload.username.trim())) {
    console.log("error text")
    errors.username = {
      code: 'INVALID_USERNAME'
    };
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
    console.log("error length")
    errors.password = {
      code: 'INVALID_PASSWORD'
    };
  }

  return errors;
}

/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignInForm(payload) {
  const errors = validateBasicSignInSignUpForm(payload);

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    errors.password = {
      code: 'EMPTY_PASSWORD'
    };
  }

  return errors;
}

function validateBasicSignInSignUpForm(payload) {
  const errors = {};

  if (!payload || typeof payload.email !== 'string' || !isEmail(payload.email.trim())) {
    errors.email = {
      code: 'INVALID_EMAIL'
    };
  }

  return errors;
}

router.post('/signup', (req, res, next) => {

  console.log('/signup')
  console.log("req.body", req.body)

  const validationErrors = validateSignUpForm(req.body);

  if (Object.keys(validationErrors).length > 0) {
    return res.json({ errors: validationErrors });
  }

  return passport.authenticate('local-signup', (err) => {
    if (err) {
      const { field, code } = err.name === 'MongoError' && err.code === 11000
          ? { field: 'email', code: 'DUPLICATED_EMAIL' }
          : { field: '', code: 'FORM_SUBMISSION_FAILED' };

      return res.json({
        errors: { [field]: { code } }
      });
    }

    console.log("successful signup")
    // return res.redirect('/dashboard')
    return res.json({"signup":true});

  })(req, res, next);
});

router.post('/signin', (req, res, next) => {
  const validationErrors = validateSignInForm(req.body);
  console.log('/signin')
  console.log("req.body", req.body)

  if (Object.keys(validationErrors).length > 0) {
    return res.json({ errors: validationErrors });
  }

  return passport.authenticate('local-login', (error, token, username) => {
    if (error !== null) {
      return res.json({
        errors: {
          [error.code === 'INCORRECT_CREDENTIALS' ? 'password' : '']: error
        }
      });
    }
    console.log("successful login")
    console.log(token)
    console.log(username)

    return res.json({
      payload: {
        token,
        username,
      },
    });
  })(req, res, next);
});

module.exports = router;
