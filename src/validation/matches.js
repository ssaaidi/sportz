import { z } from 'zod';
//this code validates data coming from the browser to the server

/**
 * Constant for match status values
 */
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

/**
 * Schema for listing matches with an optional limit
 */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Schema for match ID parameter
 */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const isoDateString = z.iso.datetime({ offset: true })
/**
 * Schema for creating a new match
 */
export const createMatchSchema = z.object({
  sport: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  startTime: isoDateString,
  endTime: isoDateString,
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional(),
}).superRefine((data, ctx) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "endTime must be chronologically after startTime",
      path: ["endTime"],
    });
  }
});

/**
 * Schema for updating match scores
 */
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
