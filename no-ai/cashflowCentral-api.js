const { default: axios } = require('axios');
const https = require('https');
const { expect } = require('chai');

const CASHFLOW_ACCOUNT_INFO_URL = 'https://runtoolapiportal-qafit.nj.adp.com/runessmobileapi/core/v1/cashflow-central/account-info';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

class CashflowCentralApi {
  async getAccountInfo(orgoid, associateoid, cookie) {
    const client = axios.create({
      baseURL: CASHFLOW_ACCOUNT_INFO_URL,
      headers: {
        orgoid,
        associateoid,
        Cookie: cookie,
      },
      httpsAgent,
    });
    return await client.get('');
  }
}

module.exports = CashflowCentralApi;
