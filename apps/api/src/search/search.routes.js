import express from "express";
import { SearchQueryInput } from "@hometutoring/types";
import { validateQuery } from "../common/validate.js";
import { createSearchController } from "./search.controller.js";

// URL surface for the search module — public, no auth required. This is
// the parent-facing discovery entrypoint.
export function createSearchRoutes({ searchService }) {
  const router = express.Router();
  const controller = createSearchController({ searchService });

  router.get("/search/tutors", validateQuery(SearchQueryInput), controller.searchTutors);

  return router;
}
