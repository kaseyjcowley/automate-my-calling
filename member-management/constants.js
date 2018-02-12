module.exports = {
  LRC_URL: 'https://www.lds.org/mls/mbr/?lang=eng',

  /** Login page constants */
  USERNAME_SELECTOR: '#IDToken1',
  PASSWORD_SELECTOR: '#IDToken2',
  LOGIN_BUTTON_SELECTOR: '#login-submit-button',

  /** LCR page navigation constants */
  ORGANIZATIONS_DROPDOWN_SELECTOR:
    '.nav > li.dropdown:nth-child(2) > a.dropdown-toggle',
  ELDERS_QUORUM_LINK_SELECTOR: '[data-menu-item-name="Elders Quorum"] > a',

  /** Elders Quorum page constants */
  MEMBERS_TAB_SELECTOR: '#organization .nav-tabs > li:nth-child(2) > a',
  MEMBERS_TABLE_SELECTOR: 'table.members',
  MEMBER_NAME_SELECTOR: 'table.members tr > td:nth-child(3)',
};
