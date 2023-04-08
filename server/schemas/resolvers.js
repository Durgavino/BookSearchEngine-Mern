const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    
    Query: {
        me: async (parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({ _id: context.user._id }).select('-__v -password')
            .populate("books");
    console.log(userData,"ME QUERY");
            return userData;
          }
    
          throw new AuthenticationError('Not logged in');
        },
      },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({
                email
            });
            if (!user) {
                throw new AuthenticationError('No User with this email found');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect Password!');
            }
            const token = signToken(user);
            return { token, user };
        },


        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
      
            return { token, user };
          },

      
        saveBook:async (parent, { Bookdata }, context) => {
            console.log(Bookdata);
            if (context.user) {
                const newuser=await User.findOneAndUpdate({ _id: context.user._id },
                    { $addToSet: { savedBooks:  input  } },
                    { new: true,
                        runValidators: true, }
                );
return newuser;
            }
            throw new AuthenticationError('You need to be logged in!');
    },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const newuser=await User.findOneAndUpdate({ _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return newuser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
};


module.exports = resolvers;