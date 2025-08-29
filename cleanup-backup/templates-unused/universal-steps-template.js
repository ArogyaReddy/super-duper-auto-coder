const { assert, expect } = require('chai');
const { Given, When, Then } = require('@cucumber/cucumber');
let HomePage = require('../../pages/common/home-page');

let homePage = null;

{{STEP_DEFINITIONS}}