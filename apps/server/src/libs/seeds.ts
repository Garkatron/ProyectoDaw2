import Database from "bun:sqlite";

export function seed(db: Database) {
    const services = [
        { name: "Internal", duration: 30 },
        { name: "External", duration: 15 },
        { name: "Pool", duration: 15 },
        { name: "Vehicle", duration: 15 },
    ];

    for (const s of services) {
        db.run(
            `INSERT OR IGNORE INTO Services (name, duration) VALUES (?, ?)`,
            [s.name, s.duration],
        );
    }

    console.log("✅ Seeds applied");
}
