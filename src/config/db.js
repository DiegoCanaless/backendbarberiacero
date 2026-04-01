import Database from "better-sqlite3";

const db = new Database("./database.db");

console.log("SQLite conectado ! ");

export const query = (sql, params = []) => {
    const stmt = db.prepare(sql);

    if (sql.trim().toUpperCase().startsWith("SELECT")) {
        const rows = stmt.all(params);
        return [rows];
    } else {
        const result = stmt.run(params);
        return [result];
    }
};

export default db;
