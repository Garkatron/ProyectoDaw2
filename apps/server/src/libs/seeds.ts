import Database from "bun:sqlite";

export function seed(db: Database) {
    const services = [
        { name: "Internal", category: "hause" },
        { name: "External", category: "hause" },
        { name: "Pool", category: "hause" },
        { name: "Vehicle", category: "personal" },
    ];

    for (const s of services) {
        db.run(
            `INSERT OR IGNORE INTO Services (name, category) VALUES (?, ?)`,
            [s.name, s.category],
        );
    }

    console.log("✅ Seeds applied");
}
