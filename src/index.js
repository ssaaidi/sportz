import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations for Real-Time Sports App...');

    // CREATE: Insert a new match
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        status: 'scheduled',
        startTime: new Date(),
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }
    
    console.log('✅ CREATE: New match created:', newMatch);

    // READ: Select the match
    const foundMatch = await db.select().from(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ READ: Found match:', foundMatch[0]);

    // UPDATE: Start the match
    const [liveMatch] = await db
      .update(matches)
      .set({ status: 'live', homeScore: 1 })
      .where(eq(matches.id, newMatch.id))
      .returning();
    
    if (!liveMatch) {
      throw new Error('Failed to update match');
    }
    
    console.log('✅ UPDATE: Match is now live:', liveMatch);

    // CREATE: Add a commentary entry
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 10,
        sequence: 1,
        period: 'First Half',
        eventType: 'Goal',
        actor: 'Player One',
        team: 'Team A',
        message: 'Spectacular goal from distance!',
        metadata: { x: 45, y: 12 },
        tags: ['goal', 'highlight'],
      })
      .returning();

    console.log('✅ CREATE: Commentary added:', newCommentary);

    // DELETE: Remove the match (and cascaded commentary if set, but we didn't set cascade)
    // For now just finish the demo
    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
