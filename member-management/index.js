const Nightmare = require('nightmare');
const arraySync = require('array-sync');
// const mysql = require('mysql');
const ldsOrg = require('./constants');

require('dotenv').config();

const nightmare = Nightmare({show: true, width: 1920, height: 1080});

// const connection = mysql.createConnection({
//   host: 'localhost',
// });

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
      [...document.querySelectorAll(selector)].map(cell => cell.innerText),
    ldsOrg.MEMBER_NAME_SELECTOR
  )
  .then(names => {
    console.log('member rows', names);

    nightmare.end().catch(function(error) {
      console.error('Error:', error);
    });
  });
