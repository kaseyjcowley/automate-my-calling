require('dotenv').config();

const Nightmare = require('nightmare');
const arraySync = require('array-sync');
const {promisify} = require('util');
const ldsOrg = require('./constants');
const Members = require('./members');
const Rollbar = require('./rollbar');

const nightmare = Nightmare({show: false, width: 1920, height: 1080});

const start = new Date();

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
    const members = new Members();

    // Grab the existing members
    const rows = await members.all(['name']);
    const sourceMembers = rows.map(row => row.name);
    const syncResults = await arraySync(sourceMembers, updatedMembers);
    let numberRemoved = 0;
    let numberAdded = 0;

    // Do the removals first
    if (syncResults.remove.length > 0) {
      numberRemoved = members.removeByName(syncResults.remove);
    }

    // Next do the additions
    if (syncResults.create.length > 0) {
      numberAdded = members.insert(syncResults.create.map(member => [member]));
    }

    members.close();

    nightmare
      .end(() => {
        const finish = new Date();
        const secondsElapsed = (finish.getTime() - start.getTime()) / 1000;

        Rollbar.info(`
          Member sync finished.

          Results: ${numberRemoved} members removed. ${numberAdded} members added.
          Time elapsed: ${secondsElapsed} seconds.
        `);
      })
      .catch(Rollbar.error);
  });
