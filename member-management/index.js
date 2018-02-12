const Nightmare = require('nightmare');
const arraySync = require('array-sync');
const mysql = require('mysql');
const {promisify} = require('util');
const ldsOrg = require('./constants');

require('dotenv').config();

const nightmare = Nightmare({show: false, width: 1920, height: 1080});

nightmare
  .goto(ldsOrg.LRC_URL)

  // Login to LCR
  .type(ldsOrg.USERNAME_SELECTOR, process.env.LDS_ORG_USERNAME)
  .type(ldsOrg.PASSWORD_SELECTOR, process.env.LDS_ORG_PASSWORD)
  .click(ldsOrg.LOGIN_BUTTON_SELECTOR)

  // Wait to see if the "Organizations" tab shows up and then click it
  .wait(ldsOrg.ORGANIZATIONS_DROPDOWN_SELECTOR)
  .click(ldsOrg.ORGANIZATIONS_DROPDOWN_SELECTOR)

  // Wait to see the "Elders Quorum" link and then click it
  .wait(ldsOrg.ELDERS_QUORUM_LINK_SELECTOR)
  .click(ldsOrg.ELDERS_QUORUM_LINK_SELECTOR)

  // Wait for the Elders Quorum page to load, wait to see the "Members" tab, then click it
  .wait(ldsOrg.MEMBERS_TAB_SELECTOR)
  .click(ldsOrg.MEMBERS_TAB_SELECTOR)

  // Wait for the members table to load
  .wait(ldsOrg.MEMBERS_TABLE_SELECTOR)
  .evaluate(
    selector =>
      // Grab the names of the members
      [...document.querySelectorAll(selector)]
        .map(cell => cell.innerText)
        .sort((a, b) => a.localeCompare(b)),
    ldsOrg.MEMBER_NAME_SELECTOR
  )
  .then(async updatedMembers => {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    connection.connect();

    const query = promisify(connection.query).bind(connection);

    // Grab the existing members
    const rows = await query('SELECT name FROM members ORDER BY name');
    const sourceMembers = rows.map(row => row.name);
    const syncResults = await arraySync(sourceMembers, updatedMembers);

    // Do the removals first
    if (syncResults.remove.length > 0) {
      query('DELETE FROM members WHERE `name` IN ? LIMIT ?', [
        [syncResults.remove],
        syncResults.remove.length,
      ]);
    }

    // Next do the additions
    if (syncResults.create.length > 0) {
      query('INSERT INTO members (name) VALUES ?', [
        syncResults.create.map(member => [member]),
      ]);
    }

    connection.end();

    nightmare.end().catch(function(error) {
      console.error('Error:', error);
    });
  });
