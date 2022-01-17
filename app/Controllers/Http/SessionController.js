'use strict';

const User = use('App/Models/User');

class SessionController {
  async create({ request, auth, response }) {
    const { email, password } = request.only(['email', 'password']);
    const { token } = await auth.attempt(email, password);


    var user = {};
    if (token) {
      user = await User.findBy('email', email);
    }


    if (user.customer_id) {
      await user.load('customer');
    }



    return response.status(200).json({ token, user });
  }

  async getUserSession({ params, request, response, auth }) {


    return auth.user;
  }


}

module.exports = SessionController;
