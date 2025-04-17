(() => {
    function getCost(type, base_price, price, qty) {
        let
            qty_m = qty;

        if (qty <= 0) {
            return 0;
        }

        switch (type) {
            case "buy":
                qty_m *= -1;
                break;
            case "sell":
                qty_m *= 1;
                break;
            default:
                break;
        }

        new_price = (qty_m / (rg_pull / ((price + base_price * 3) / 4)) + 1) * price;
        transaction_price = (new_price * 3 + price) / 4 * qty;

        price = new_price;

        return {
            'new_price': price,
            'cost': transaction_price
        };
    }

    let
        get_data = new axRequest('d.json'),
        base_prices = {
            'steel': 5,
            'gold': 5,
            'silver': 7.5,
            'copper': 1.3,
        },
        rg_pull = 3000;

    new axModularFunction('price', (el) => {
        let
            type = el.axAttribute('bar'),
            base_price = base_prices[type],
            price = base_price,
            stock = 0;

        get_data.execute([], (accounting) => {
            let
                type_accounting = JSON.parse(accounting)[type];

            type_accounting.forEach((transaction) => {
                let
                    qty = transaction.qty;

                stock = transaction.stock;

                if (qty <= 0) {
                    return;
                }

                let
                    result;

                if (transaction.type === 'investment') {
                    let
                        full_receive = qty * (transaction.percent * transaction.period / 100 + 1),
                        resource_receive = Math.floor(full_receive * ((40 - transaction.percent * 2) / 100));

                    result = getCost('buy', base_price, price, full_receive - resource_receive);
                } else {
                    result = getCost(transaction.type, base_price, price, qty);

                }


                price = result.new_price;
            });

            el.axQS('.price__in-stock strong').axVal(stock);
            el.axQS('.price__rg').axVal(Math.round(price * 10) / 10 + ' r.g.');

            if (type === 'steel') {
                el.click();
            }
        });

        el.addEventListener('click', () => {
            axQSA('.calc').forEach((calc) => {
                calc.axAttribute('type', type)
                    .axAttribute('price', price)
                    .axAttribute('base_price', base_price);

                calc.axQSA('.resource').forEach(res => {
                    res.axVal(el.axQS('span').axVal());
                });

                calc.update();
            });
        });
    });

    new axModularFunction('calc', (el) => {
        el.update = () => {
            let
                price = el.axAttribute('price') * 1,
                base_price = el.axAttribute('base_price'),
                qty = el.axQS('input').axVal(),
                type = el.axQS('select').value;

            switch (type) {
                case "buy":
                    type = "sell";
                    break;
                case "sell":
                    type = "buy";
                    break;
            }

            let
                result = getCost(type, base_price, price, qty);

            el.axQS('.calc__cost').axVal(Math.round(result.cost));
        }

        el.axQSA('input, select').forEach((input) => (
                input.addEventListener('change', () => {
                    el.update();
                })
            )
        );
    });

    new axModularFunction('deposit_calc', (el) => {
        el.update = () => {
            let
                price = el.axAttribute('price') * 1,
                base_price = el.axAttribute('base_price'),
                qty = el.axQS('[name="qty"]').axVal(),
                type = el.axQS('[name="type"]').value,
                period = el.axQS('[name="period"]').value,
                percent = el.axQS('[name="percent"]').value,
                full_receive = qty * (percent * period / 100 + 1),
                resource_receive = Math.floor(full_receive * ((40 - percent * 2) / 100));

            if (resource_receive < 1) {
                resource_receive = 1;
            }

            switch (type) {
                case "investment":
                    type = "buy";
                    break;
                case "credit":
                    type = "sell";
                    break;
            }

            let
                rg_receive = getCost(type, base_price, price, qty - resource_receive).cost * (percent * period / 100 + 1);

            el.axQS('.span-rg-receive').axVal(Math.round(rg_receive));
            el.axQS('.span-resource-receive').axVal(resource_receive);
            el.axQS('.span-period').axVal(period);
            if (rg_receive > 100) {
                el.axQS('.warning').axAttribute('style', 'display: none');
            } else {
                el.axQS('.warning').axAttribute('style', '');
            }
        }

        el.axQSA('input, select').forEach((input) => (
                input.addEventListener('change', () => {
                    el.update();
                })
            )
        );
    });
})();
