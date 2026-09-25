-- btree_gist backs the bookings_no_overlap EXCLUDE constraint (the
-- database-level double-booking guarantee). PostGIS is deliberately not
-- installed: geographic search is a future feature.
CREATE EXTENSION IF NOT EXISTS btree_gist;
