// endpoint routes!
// for this project the business logic is inside the route

import { Router } from "express";
import {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.js";
import {matches} from "../db/schema.js";
import {db} from "../db/db.js";
import {getMatchStatus} from "../ utils/match-status.js";
import {desc} from "drizzle-orm";
import app from "express/lib/application.js";

export const matchRouter = Router();

const MAX_LIMIT = 100;

// give us back the current data

/**
 *          /matches?teamA=Arsenal&teamB=Chelsea
 *          Express automatically parses everything after the ? into key-value pairs.
 *          req.query equals: { teamA: "Arsenal", teamB: "Chelsea" }
 *
 *
 *          - req.query because HTTP GET requests pass data through URL parameters,
 *          - whereas req.body is used for HTTP methods like POST and PUT
 *                  that send data inside the request payload
 */
matchRouter.get("/",  async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if(!parsed.success){
        return res.status(400).json({ error: 'Invalid payload for Get.', details: parsed.error.issues });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    try{
        const data = await db
            .select() // select all
            .from(matches)
            .orderBy((desc(matches.createdAt)))
            .limit(limit)

        //return res.status(200).json(data)
        res.json( { data }); // just using (data) sends a raw array which makes it hard to add metadata later without breaking the client side

    } catch (error){
        res.status(500).json({error: 'Failed to list matches'});
    }
})


// implement the POST request to actually create a new match
// This route receives match data from the client, validates it, inserts it into the database, and sends the created match back.
matchRouter.post("/", async (req, res) => {
// we used async because we used await below

    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload.', details: parsed.error.issues });
    }

    const { data:
        {startTime,
            endTime,
            homeScore,
            awayScore
        }
    } = parsed;

    // same as
    //const startTime = parsed.data.startTime;
    //const endTime = parsed.data.endTime;
    //const homeScore = parsed.data.homeScore;
    //const awayScore = parsed.data.awayScore;

    try {// with this try, we can try to insert this new match into the database

        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime),

            }).returning(); // to get back the event we created

        if (res.app.locals.broadcastMatchCreated) {
            res.app.locals.broadcastMatchCreated(event);
        }
        // sends that newly created database row back to the browser:
        res.status(201).json({data: event});

    } catch (error){
        res.status(500).json({ error: 'Failed to create match.'});
    }


})