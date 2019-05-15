import {
  menuTitle, menuListPreview, menuListSearchInput,
  menuSecondOption, menuList,
} from '../../locators/menu-list';

Then('title on preview is {string}', (title) => {
  menuTitle().first().should('have.text', title);
});

When('I click into title', () => {
  menuTitle().first().click();
});

When('I click into menu item second element', () => {
  menuSecondOption().click();
});

Then('MenuList component is expanded', () => {
  menuListPreview().children().should('have.length', 4);
});

Then('MenuList component is not expanded', () => {
  menuListPreview().children().should('have.length', 0);
});

Then('filter is disabled', () => {
  menuListSearchInput().should('not.exist');
});

Then('filter is enabled', () => {
  menuListSearchInput().should('exist');
});

When('I change search parameter to {string}', (parameter) => {
  menuListSearchInput().clear().type(parameter);
});

Then('search result is {string}', (parameter) => {
  menuList().parent().should('have.length', 2);
  menuList().contains('.carbon-menu-list-item', parameter);
});
