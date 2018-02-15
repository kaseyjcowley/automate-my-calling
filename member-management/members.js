const mysql = require('mysql');
const util = require('util');

class Members {
  constructor() {
    this.conn = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    this.query = util.promisify(this.conn.query).bind(this.conn);

    this.conn.connect();
  }

  async all(fields = '*', orderBy = 'name') {
    const members = await this.query('SELECT ?? FROM members ORDER BY ??', [
      fields,
      orderBy,
    ]);

    return members;
  }

  async insert(names) {
    const results = await this.query('INSERT INTO members (name) VALUES ?', [
      names,
    ]);

    // If we inserted more than one record, return the affected rows, otherwise return the insertId
    if (names.length > 1) {
      const {affectedRows} = await this.query(
        'SELECT ROW_COUNT() AS affectedRows'
      );

      return affectedRows;
    }

    return results.insertId;
  }

  async removeByName(names) {
    const results = await this.query(
      'DELETE FROM members WHERE name IN ? LIMIT ?',
      [[names], names.length]
    );

    return results.affectedRows;
  }

  close() {
    this.conn.end();
  }
}

module.exports = Members;
