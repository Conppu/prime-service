/* eslint-disable @typescript-eslint/no-unused-vars */
import { rule, shield } from "graphql-shield";
import logger from "../helpers/logger.js";
import GQLError from "../helpers/errors.js";
import { GraphQLError } from "graphql";

const isAuthenticated = rule({ cache: "contextual" })(async (
  _parent,
  _args,
  ctx,
  _info,
) => {
  return ctx.user.isAuthenticated;
});

export const permissions = shield(
  {
    Query: {},
    Mutation: {},
  },
  {
    async fallbackError(thrownThing, _parent, _args, _context, _info) {
      if (thrownThing instanceof GraphQLError) {
        // expected errors
        return thrownThing;
      }
      if (thrownThing instanceof Error) {
        // unexpected errors
        logger.error("SHIELD_FALLBACK_ERROR", thrownThing.message, thrownThing);
        return GQLError("SHIELD_FALLBACK_ERROR");
      }
      // what the hell got thrown
      logger.error(
        "SHIELD_FALLBACK_ERROR",
        "The resolver threw something that is not an error.",
        thrownThing,
      );
      return GQLError("SHIELD_FALLBACK_ERROR");
    },
  },
);
