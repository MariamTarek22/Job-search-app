import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

export const imageType = new GraphQLObjectType({
  name: "Image",
  fields: () => ({
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  }),
});

export const userType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    profilePic: {
      type: imageType,
      resolve: (parent) => parent.profilePic || {}, // Prevents null issues
    },
    coverPic: {
      type: imageType,
      resolve: (parent) => parent.coverPic || {}, // Prevents null issues
    },
    bannedAt: { type: GraphQLString },
    DOB: { type: GraphQLString },
    gender: { type: GraphQLString },
    isConfirmed: { type: GraphQLString },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

export const companyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    logo: {
      type: imageType,
      resolve: (parent) => parent.logo || {}, // Prevents null issues
    },
    coverPic: {
      type: imageType,
      resolve: (parent) => parent.coverPic || {}, // Prevents null issues
    },
    Hrs: {
      type: new GraphQLList(userType),
      resolve: async (parent) => {
        return await User.find({ _id: { $in: parent.Hrs } });
      },
      legalAttachment: {
        type: imageType,
      },
      approvedByAdmin: {
        type: GraphQLBoolean,
      },
    },
    bannedAt: {
      type: GraphQLString,
    },
  },
});
