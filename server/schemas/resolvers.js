const { AuthenticationError } = require('apollo-server-express');

const { User } = require('../models');

const { signToken } = require('../utils/auth');


const resolvers = {

    Query: {

        me: async (parent, args, context) => {

            if (context.user) {

                const userData = await User.findOne({ _id: context.user._id })

                    .select('-__v -password')
                    .populate('books');

                return userData;

            }

            throw new AuthenticationError('Not logged in');

        },

    }, 

    Mutation: {

        login: async (parent, {email, password }) => {

            const user = await User.findOne({ email });

            if (!user) {

                throw new AuthenticationError('No user with that name found');

            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {

                throw new AuthenticationError('Incorrect password');

            }

            const token = signToken(user);

            return { token, user };
        },

        addUser: async (parent, args) => {

            const user = await User.create(args);

            const token = signToken(user);

            return { token, user };

        },

        saveBook: async (parent, { authors, description, bookId, image, link, title}, context) => {

            if (context.user) {

                const updatedUser = await User.findOneAndUpdate(

                    { _id: context.user._id},
                    { $addToSet: { savedBooks: { authors, description, bookId, image, link, title } } },
                    { new: true }
                ).populate('savedBooks');

                return updatedUser;

            }

            throw new AuthenticationError('You need to be logged in!');

        }
    }

};

module.exports = resolvers;