import sqlite3 from "sqlite3"

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error conectando a SQLite: ", err.message)
    } else {
        console.log("SQLite conectado")
    }
})

export const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve([rows])
            }
        })
    })
}

export default db