const db = require("./db");
const movies = [
 ["Dune: Part Two", "Dune: Part Two", "Paul Atreides joins Chani and the Fremen to confront the forces that destroyed his family.", "dune-part-two", "18:30:00", 2200],
 ["Gladiator II", "Gladiator II", "Forced into the arena, Lucius challenges the power of Rome and confronts his family's legacy.", "gladiator-2", "20:00:00", 2400],
 ["Wicked: Part One", "Wicked", "Elphaba and Glinda form an unlikely friendship at Shiz University before their paths diverge in Oz.", "wicked", "17:00:00", 2500],
 ["Aethelgard: The Luminous Frontier", "Interstellar", "A pilot leads a mission through a wormhole to find a new home for humanity, leaving his family behind.", "interstellar", "19:30:00", 2100],
 ["Celestia's Wondrous Journey", "Inside Out 2", "As Riley enters her teenage years, Joy and the other emotions must make room for Anxiety and new feelings.", "inside-out-2", "14:30:00", 1800],
 ["Neon Edge", "Inception", "A skilled dream thief takes on a dangerous assignment: plant an idea inside a target's subconscious.", "inception", "21:00:00", 2300],
 ["Nightfall Protocol", "The Wild Robot", "Stranded on a remote island, a robot learns to live among wild animals and care for an orphaned gosling.", "the-wild-robot", "19:00:00", 2000]
];
async function seed() {
 const connection = await db.promise().getConnection();
 try {
  const [columns] = await connection.query("SHOW COLUMNS FROM shows LIKE 'poster_url'");
  if (!columns.length) await connection.query("ALTER TABLE shows ADD COLUMN poster_url VARCHAR(500) NULL AFTER description");
  await connection.beginTransaction();
  for (const [previousTitle, title, description, slug, time, price] of movies) {
   const poster = `images/posters/${slug}-official.jpg`;
   const [existing] = await connection.execute("SELECT id FROM shows WHERE title IN (?, ?) FOR UPDATE", [previousTitle, title]);
   if (existing.length) {
    for (const show of existing) await connection.execute("UPDATE shows SET title = ?, description = ?, poster_url = ? WHERE id = ?", [title, description, poster, show.id]);
   } else {
    await connection.execute("INSERT INTO shows (title, description, poster_url, show_date, show_time, price) VALUES (?, ?, ?, CURRENT_DATE + INTERVAL 7 DAY, ?, ?)", [title, description, poster, time, price]);
   }
  }
  await connection.commit();
  console.log("Updated seven real films and posters; existing IDs, schedules, prices and bookings preserved.");
 } catch (error) {
  await connection.rollback();
  throw error;
 } finally {
  connection.release();
  await db.promise().end();
 }
}
seed().catch(error => { console.error("Movie update failed:", error.message); process.exitCode = 1; });
