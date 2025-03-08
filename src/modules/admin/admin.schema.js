import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
} from "graphql";

import { userType, companyType } from "./customTypes.js";
import { getAllDataQuery } from "./admin.quries.js";
import {
  approveCompanyMutation,
  banOrUnBanCompanyMutation,
  banOrUnBanUserMutation,
} from "./admin.mutation.js";

const query = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    getAllData: {
      type: new GraphQLObjectType({
        name: "usersAndComponies",
        fields: {
          users: { type: new GraphQLList(userType) },
          companies: { type: new GraphQLList(companyType) },
        },
      }),
      resolve: getAllDataQuery,
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    banOrUnBanUser: {
      type: userType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: banOrUnBanUserMutation,
    },
    banOrUnBanCompany: {
      type: companyType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: banOrUnBanCompanyMutation,
    },
    approveCompany: {
      type: companyType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: approveCompanyMutation,
    },
  },
});

export const adminSchema = new GraphQLSchema({
  query,
  mutation,
});
