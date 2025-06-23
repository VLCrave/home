const axios = require("axios");
const { parseObject } = require("./util")
 
module.exports = async function(id, server) {
if (!id) throw `Parameter 'id' cannot be empty`;
if (!server) throw `Parameter 'server' cannot be empty`;
try {
    let data = await axios.post("https://moogold.com/wp-content/plugins/id-validation-new/id-validation-ajax.php", new URLSearchParams( {
        "attribute_amount": "Weekly Pass",
        "text-5f6f144f8ffee": id,
        "text-1601115253775": server,
        "quantity": 1,
        "add-to-cart": 15145,
        "product_id": 15145,
        "variation_id": 4690783
      }), { headers: { "Referer": "https://moogold.com/product/mobile-legends/", "Origin": "https://moogold.com" }})
      let { message } = data.data;
      if (!message) throw `Invalid ID Player or Server ID`;
      return parseObject(message);
    } catch (e) {
      throw e + ""
    }
 }