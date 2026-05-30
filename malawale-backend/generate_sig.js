const crypto = require('crypto');
const secret = 'rahul_secret_123';
const payload = JSON.stringify({
    "event": "payment.failed",
    "payload": {
        "payment": {
            "entity": {
                "id": "pay_test_123456",
                "order_id": "order_SvY4GFIY44NitX"
            }
        }
    }
});
console.log(crypto.createHmac('sha256', secret).update(payload).digest('hex'));