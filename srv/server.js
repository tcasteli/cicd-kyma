const express = require('express');
const app = express();
const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: { label: 'xsuaa' }
});


const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/srv', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        res.status(200).send('app1');
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/srv/user', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        res.status(200).json(req.user);
    } else {
        res.status(403).send('Forbidden');
    }
});

const { retrieveJwt } = require('@sap-cloud-sdk/connectivity');
const { desc } = require('@sap-cloud-sdk/odata-v2');
const { salesOrderService } = require('@sap/cloud-sdk-vdm-sales-order-service');
const { salesOrderApi, salesOrderItemApi } = salesOrderService();

function getSalesOrders(req) {
    return salesOrderApi.requestBuilder()
        .getAll()
        .filter(salesOrderApi.schema.TOTAL_NET_AMOUNT.greaterThan(2000))
        .top(3)
        .orderBy(desc(salesOrderApi.schema.LAST_CHANGE_DATE_TIME))
        .select(
            salesOrderApi.schema.SALES_ORDER,
            salesOrderApi.schema.LAST_CHANGE_DATE_TIME,
            salesOrderApi.schema.INCOTERMS_LOCATION_1,
            salesOrderApi.schema.TOTAL_NET_AMOUNT,
            salesOrderApi.schema.TO_ITEM.select(salesOrderItemApi.schema.MATERIAL, salesOrderItemApi.schema.NET_AMOUNT)
        )
        .execute({
            destinationName: 'app1-s4hc-api'
            ,
            jwt: retrieveJwt(req)
        });
}

app.get('/srv/salesorders', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        getSalesOrders(req)
        .then(salesOrders => {
            res.status(200).json(salesOrders);
        });
    } else {
        res.status(403).send('Forbidden');
    }
});






const port = process.env.PORT || 5001;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});