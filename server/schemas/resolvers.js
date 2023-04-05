const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    // Query: {

    //     me: async () => {
    //         return User.find();
    //     },
    //     me: async (parent, args) => {
    //         return User.findOne(args.id)
    //     },
    //     // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    //     me: async (parent, args, context) => {
    //         if (context.user) {
    //             return User.findOne({ _id: context.user._id });
    //         }
    //         throw new AuthenticationError('You need to be logged in!');
    //     },
    // },
    Query: {
        me: async (parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
    
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


        // addUser: async (parent, { username, email, password }) => {
        //     const user = await User.create({ username, email, password });
        //     const token = signToken(user);
        //     return { token, user };
        // },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
      
            return { token, user };
          },

      
        saveBook:async (parent, { input }, context) => {
            console.log(input);
            if (context.user) {
                return User.findOneAndUpdate({ _id: context.user._id },
                    { $addToSet: { savedBooks:  input  } },
                    { new: true,
                        runValidators: true, }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
    },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return User.findOneAndUpdate({ _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
};


module.exports = resolvers;